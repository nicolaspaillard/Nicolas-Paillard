import { inject, Injectable, InjectionToken, Injector } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, onSnapshot, orderBy, OrderByDirection, query, setDoc } from "@angular/fire/firestore";
import { FormGroup } from "@angular/forms";
import { Base } from "@classes/base";
import { ReplaySubject, Subject } from "rxjs";

export interface ServiceConfig<T> {
  collection: string;
  form: FormGroup;
  order: [string, OrderByDirection?];
  type: new (data: Record<string, unknown>) => T;
}

export const SERVICE_CONFIG = new InjectionToken<ServiceConfig<unknown>>("sets parameters for crud service constructor", {
  providedIn: "root",
  factory: () => ({}) as ServiceConfig<unknown>,
});

@Injectable({ providedIn: "root" })
export class CrudService<T extends Base> {
  private static cache = new Map<string, ReplaySubject<Base[]>>();
  form: FormGroup;
  type: new (data: Record<string, unknown>) => T;
  private _items: Subject<T[]> = new ReplaySubject(1);
  private collection: string;
  private db: Firestore = inject(Firestore);

  constructor() {
    const config = inject<ServiceConfig<T>>(SERVICE_CONFIG);
    if (Object.keys(config).length === 0) return;
    this.type = config.type;
    this.form = config.form;
    this.collection = config.collection;

    const cached = CrudService.cache.get(this.collection);
    if (cached) {
      this._items = cached as unknown as Subject<T[]>;
      return;
    }
    onSnapshot(
      query(collection(this.db, "data", config.collection, config.collection), orderBy(...config.order)),
      snapshot => this._items.next(snapshot.docs.map(doc => new config.type({ ...doc.data(), id: doc.id }))),
      error => console.error(error),
    );
    CrudService.cache.set(this.collection, this._items as unknown as ReplaySubject<Base[]>);
  }
  static forCollection<T extends Base>(parent: Injector, config: ServiceConfig<T>): CrudService<T> {
    return Injector.create({ providers: [CrudService, { provide: SERVICE_CONFIG, useValue: config }], parent }).get(CrudService<T>);
  }
  create = async (item: T) => {
    try {
      item.id = (await addDoc(collection(this.db, "data", this.collection, this.collection), Object.assign({}, item))).id;
    } catch (error) {
      console.error(error);
    }
  };
  delete = async (item: T) => deleteDoc(doc(this.db, "data", this.collection, this.collection, item.id)).catch(err => console.error(err));
  getCloudinary = async (): Promise<{ api_key: string; api_secret: string } | undefined> => {
    try {
      return (await getDoc(doc(this.db, "keys", "cloudinary"))).data() as { api_key: string; api_secret: string } | undefined;
    } catch (error) {
      console.error(error);
      return;
    }
  };
  items = () => this._items.pipe(takeUntilDestroyed());
  update = async (item: T) => setDoc(doc(this.db, "data", this.collection, this.collection, item.id), Object.assign({}, item)).catch(err => console.error(err));
}
