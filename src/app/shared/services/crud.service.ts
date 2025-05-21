import { inject, Inject, Injectable, InjectionToken } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { addDoc, collection, deleteDoc, doc, FieldPath, Firestore, getDoc, getDocs, orderBy, OrderByDirection, query, setDoc, WhereFilterOp } from "@angular/fire/firestore";
import { FormGroup } from "@angular/forms";
import { ReplaySubject, Subject } from "rxjs";
import { Base } from "../classes/base";

export interface ServiceConfig<T> {
  collection: string;
  compareFn?: (a: T, b: T) => number;
  form: FormGroup;
  order: [string, OrderByDirection?];
  type: { new (...args: any[]): T };
  where?: [string | FieldPath, WhereFilterOp, any];
}

export const SERVICE_CONFIG = new InjectionToken<ServiceConfig<any>>("sets parameters for crud service constructor");

@Injectable({
  providedIn: "root",
})
export class CrudService<T extends Base> {
  form: FormGroup;
  type: { new (...args: any[]): T };
  private __items: T[] = [];
  private _items: Subject<T[]> = new ReplaySubject(1);
  private collection: string;
  private compareFn?: (a: T, b: T) => number;
  private db: Firestore = inject(Firestore);
  constructor(@Inject(SERVICE_CONFIG) config: ServiceConfig<T>) {
    this.type = config.type;
    this.form = config.form;
    this.collection = config.collection;

    if (config.compareFn) this.compareFn = config.compareFn;
    try {
      getDocs(query(collection(this.db, "data", config.collection, config.collection), orderBy(...config.order))).then((items) => {
        items.docs.forEach((doc) => {
          this.__items.push(new config.type({ ...doc.data(), id: doc.id }));
          this._items.next(this.__items);
        });
      });
    } catch (error) {
      console.error(error);
    }
  }
  cloudinary = async (): Promise<{ api_key: string; api_secret: string } | undefined> => {
    try {
      return (await getDoc(doc(this.db, "keys", "cloudinary"))).data() as any;
    } catch (error) {
      console.error(error);
      return;
    }
  };
  create = async (item: T) => {
    console.log(item);
    try {
      item.id = (await addDoc(collection(this.db, "data", this.collection, this.collection), Object.assign({}, this.removeId(item)))).id;
      this.__items.push(item);
      if (this.compareFn) this.__items.sort(this.compareFn);
      this._items.next(this.__items);
    } catch (error) {
      console.error(error);
    }
    return item.id;
  };
  delete = async (item: T) => {
    console.log(item);
    try {
      deleteDoc(doc(this.db, "data", this.collection, this.collection, item.id));
      // prettier-ignore
      this.__items.splice(this.__items.findIndex((tmp) => tmp.id === item.id),1);
      this._items.next(this.__items);
    } catch (error) {
      console.error(error);
    }
  };
  items = () => this._items.pipe(takeUntilDestroyed());
  update = async (item: T) => {
    console.log(item);
    try {
      setDoc(doc(this.db, "data", this.collection, this.collection, item.id), Object.assign({}, this.removeId(item)));
      this.__items[this.__items.findIndex((tmp) => tmp.id === item.id)] = item;
      if (this.compareFn) this.__items.sort(this.compareFn);
      this._items.next(this.__items);
    } catch (error) {
      console.error(error);
    }
  };
  private removeId = (item: T): T => {
    let noid: any = item;
    delete noid.id;
    return noid;
  };
}
