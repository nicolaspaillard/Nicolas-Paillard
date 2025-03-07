import { Inject, Injectable, InjectionToken } from "@angular/core";
import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, getDocs, orderBy, OrderByDirection, query, setDoc } from "@angular/fire/firestore";
import { ReplaySubject, Subject } from "rxjs";
import { Base } from "../classes/base";

export interface ServiceConfig<T> {
  type: { new (...args: any[]): T };
  collection: string;
  order: [string, OrderByDirection?];
  compareFn?: (a: T, b: T) => number;
}

export const SERVICE_CONFIG = new InjectionToken<ServiceConfig<any>>("sets parameters for crud service constructor");

@Injectable({
  providedIn: "root",
})
export class CrudService<T extends Base> {
  type: { new (...args: any[]): T };
  private collection: string;
  private _items: Subject<T[]> = new ReplaySubject(1);
  private __items: T[] = [];
  private compareFn?: (a: T, b: T) => number;
  constructor(
    @Inject(SERVICE_CONFIG) config: ServiceConfig<T>,
    private db: Firestore,
  ) {
    this.type = config.type;
    this.collection = config.collection;
    if (config.compareFn) this.compareFn = config.compareFn;
    try {
      getDocs(query(collection(db, "data", config.collection, config.collection), orderBy(...config.order))).then((items) => {
        items.docs.forEach((doc) => {
          this.__items.push(new config.type({ ...doc.data(), id: doc.id }));
          this._items.next(this.__items);
        });
      });
    } catch (error) {
      console.error(error);
    }
  }
  items = () => this._items.asObservable();
  create = async (item: T) => {
    try {
      item.id = (await addDoc(collection(this.db, "data", this.collection, this.collection), Object.assign({}, item))).id;
      this.__items.push(item);
      if (this.compareFn) this.__items.sort(this.compareFn);
      this._items.next(this.__items);
    } catch (error) {
      console.error(error);
    }
  };
  update = async (item: T) => {
    try {
      let newItem: any = new this.type(item);
      delete newItem.id;
      setDoc(doc(this.db, "data", this.collection, this.collection, item.id), Object.assign({}, newItem));
      this.__items[this.__items.findIndex((tmp) => tmp.id === item.id)] = item;
      if (this.compareFn) this.__items.sort(this.compareFn);
      this._items.next(this.__items);
    } catch (error) {
      console.error(error);
    }
  };
  delete = async (item: T) => {
    try {
      deleteDoc(doc(this.db, "data", this.collection, this.collection, item.id!));
      // prettier-ignore
      this.__items.splice(this.__items.findIndex((tmp) => tmp.id === item.id),1);
      this._items.next(this.__items);
    } catch (error) {
      console.error(error);
    }
  };
  cloudinary = async (): Promise<{ api_key: string; api_secret: string } | undefined> => {
    try {
      return (await getDoc(doc(this.db, "keys", "cloudinary"))).data() as any;
    } catch (error) {
      console.error(error);
      return;
    }
  };
}
