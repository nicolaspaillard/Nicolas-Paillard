import { DestroyRef, inject, InjectionToken, Injector, Service } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { OrderByDirection } from "@angular/fire/firestore";
import { FormGroup } from "@angular/forms";
import { Base } from "@classes/base";
import { loadFirestore } from "@services/firestore.service";
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

@Service()
export class CrudService<T extends Base> {
  private static cache = new Map<string, ReplaySubject<Base[]>>();
  form: FormGroup;
  type: new (data: Record<string, unknown>) => T;
  private _items: Subject<T[]> = new ReplaySubject(1);
  private collection: string;
  private destroyRef: DestroyRef = inject(DestroyRef);
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
    void loadFirestore().then(({ fs, db }) =>
      fs.onSnapshot(
        fs.query(fs.collection(db, "data", config.collection, config.collection), fs.orderBy(...config.order)),
        snapshot => this._items.next(snapshot.docs.map(doc => new config.type({ ...doc.data(), id: doc.id }))),
        error => console.error(error),
      ),
    );
    CrudService.cache.set(this.collection, this._items as unknown as ReplaySubject<Base[]>);
  }
  static forCollection<T extends Base>(parent: Injector, config: ServiceConfig<T>): CrudService<T> {
    return Injector.create({ providers: [CrudService, { provide: SERVICE_CONFIG, useValue: config }], parent }).get(CrudService<T>);
  }

  create = async (item: T) => {
    try {
      const { fs, db } = await loadFirestore();
      item.id = (await fs.addDoc(fs.collection(db, "data", this.collection, this.collection), Object.assign({}, item))).id;
    } catch (error) {
      console.error(error);
    }
  };
  delete = async (item: T) => {
    try {
      const { fs, db } = await loadFirestore();
      await fs.deleteDoc(fs.doc(db, "data", this.collection, this.collection, item.id));
    } catch (err) {
      console.error(err);
    }
  };
  getCloudinary = async (): Promise<{ api_key: string; api_secret: string } | undefined> => {
    try {
      const { fs, db } = await loadFirestore();
      return (await fs.getDoc(fs.doc(db, "keys", "cloudinary"))).data() as { api_key: string; api_secret: string } | undefined;
    } catch (error) {
      console.error(error);
      return;
    }
  };
  items = () => this._items.pipe(takeUntilDestroyed(this.destroyRef));
  update = async (item: T) => {
    try {
      const { fs, db } = await loadFirestore();
      await fs.setDoc(fs.doc(db, "data", this.collection, this.collection, item.id), Object.assign({}, item));
    } catch (err) {
      console.error(err);
    }
  };
}
