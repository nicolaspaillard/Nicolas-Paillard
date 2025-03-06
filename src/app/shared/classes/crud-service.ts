import { inject } from "@angular/core";
import { addDoc, collection, deleteDoc, doc, DocumentData, Firestore, getDoc, getDocs, query, QueryDocumentSnapshot, QueryOrderByConstraint, setDoc } from "@angular/fire/firestore";
import { ReplaySubject, Subject } from "rxjs";

export abstract class CrudService<T> {
  protected _items: Subject<any[]> = new ReplaySubject(1);
  protected __items: T[] = [];
  protected db: Firestore = inject(Firestore);
  constructor(
    protected type: { new (...args: any[]): T },
    protected collec: string,
    private order: QueryOrderByConstraint,
  ) {
    try {
      console.log(type, collec);
      getDocs(query(collection(this.db, "data", collec, collec), this.order)).then((items) => {
        items.docs.forEach((doc) => {
          let item: T = new this.type(doc.data() as any);
          item["id"] = doc.id;
          this.construct(item, doc);
        });
        this.postConstruct();
      });
    } catch (error) {
      console.error("service init", error);
    }
  }
  protected construct = (item: T, doc: QueryDocumentSnapshot<DocumentData, DocumentData>): any => this.__items.push(item);
  protected postConstruct = (): any => this._items.next(this.__items);

  items = () => this._items.asObservable();

  protected async preCreate?(item: T, images?: File[]): Promise<boolean>;
  protected postCreate = (item: T): any => {
    this.__items.push(item);
    this._items.next(this.__items);
  };
  create = async (item: any, images?: File[]): Promise<any> => {
    try {
      if (this.preCreate && !(await this.preCreate(item, images))) item["id"] = (await addDoc(collection(this.db, "data", this.collec, this.collec), Object.assign({}, item))).id;
      this.postCreate(item);
    } catch (error) {
      console.error("service create", error);
    }
  };
  protected async preUpdate?(item: any, param: any): Promise<boolean>;
  protected postUpdate = (item: T, param: any): any => {
    this.__items[this.__items.findIndex((tmp) => tmp["id"] === item["id"])] = item;
    this._items.next(this.__items);
  };
  update = async (item: any, param?: any): Promise<any> => {
    try {
      if (this.preUpdate && !(await this.preUpdate(item, param))) {
        let newItem = new this.type(item);
        delete newItem["id"];
        await setDoc(doc(this.db, "data", this.collec, this.collec, item["id"]), Object.assign({}, newItem));
      }
      this.postUpdate(item, param);
    } catch (error) {
      console.error("service update", error);
    }
  };

  protected async preDelete?(item: T | string): Promise<any>;
  protected postDelete = (item: T) => {
    // prettier-ignore
    this.__items.splice(this.__items.findIndex((tmp) => tmp["id"] === item["id"]),1);
    this._items.next(this.__items);
  };
  delete = async (item: any): Promise<any> => {
    try {
      if (this.preDelete && !(await this.preDelete(item))) await deleteDoc(doc(this.db, "data", this.collec, this.collec, item["id"]));
      this.postDelete(item);
    } catch (error) {
      console.error("service delete", error);
    }
  };
  protected getCloudinary = async () => (await getDoc(doc(this.db, "keys", "cloudinary"))).data() as any;
}
