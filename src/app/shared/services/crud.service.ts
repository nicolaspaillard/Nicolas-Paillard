import { Inject, Injectable, InjectionToken } from "@angular/core";
import { addDoc, collection, deleteDoc, doc, Firestore, getDocs, orderBy, OrderByDirection, query, setDoc } from "@angular/fire/firestore";
import { ReplaySubject, Subject } from "rxjs";

export interface ServiceConfig<T> {
  type: { new (...args: any[]): T };
  collection: string;
  order: [string, OrderByDirection?];
}

export const SERVICE_CONFIG = new InjectionToken<ServiceConfig<any>>("sets parameters for crud service constructor");

@Injectable({
  providedIn: "root",
})
export class CrudService<T> {
  private type: { new (...args: any[]): T };
  private collection: string;
  private _items: Subject<T[]> = new ReplaySubject(1);
  private __items: T[] = [];
  constructor(
    @Inject(SERVICE_CONFIG) config: ServiceConfig<T>,
    private db: Firestore,
  ) {
    this.type = config.type;
    this.collection = config.collection;
    try {
      getDocs(query(collection(this.db, "data", this.collection, this.collection), orderBy(...config.order))).then((items) => {
        items.docs.forEach((doc) => {
          let item: T = new this.type(doc.data() as any);
          item["id"] = doc.id;
          this.__items.push(item);
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
      item["id"] = (await addDoc(collection(this.db, "data", this.collection, this.collection), Object.assign({}, item))).id;
      this.__items.push(item);
    } catch (error) {
      console.error(error);
    }
  };
  update = async (item: T) => {
    try {
      let newItem = new this.type(item);
      delete newItem["id"];
      setDoc(doc(this.db, "data", this.collection, this.collection, item["id"]), Object.assign({}, newItem));
      this.__items[this.__items.findIndex((tmp) => tmp["id"] === item["id"])] = item;
    } catch (error) {
      console.error(error);
    }
  };
  delete = async (item: T) => {
    try {
      deleteDoc(doc(this.db, "data", this.collection, this.collection, item["id"]));
      // prettier-ignore
      this.__items.splice(this.__items.findIndex((tmp) => tmp["id"] === item["id"]),1);
    } catch (error) {
      console.error(error);
    }
  };
  sort = (compareFn?: (a: T, b: T) => number) => {
    this.__items.sort(compareFn);
    this._items.next(this.__items);
  };
}
