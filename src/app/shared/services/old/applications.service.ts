import { Injectable } from "@angular/core";
import { addDoc, collection, deleteDoc, doc, Firestore, getDocs, query, setDoc } from "@angular/fire/firestore";
import { ReplaySubject, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ApplicationsService {
  private __applications: Application[] = [];
  private _applications: Subject<Application[]> = new ReplaySubject(1);
  constructor(private db: Firestore) {
    try {
      getDocs(query(collection(this.db, "data", "applications", "applications"))).then((documents) =>
        documents.forEach((doc) => {
          let application: Application = new Application(doc.data() as any);
          application.id = doc.id;
          application.contactDate = doc.data()["contactDate"].toDate();
          application.relaunchDate = doc.data()["relaunchDate"].toDate();
          application.answerDate = doc.data()["answerDate"].toDate();
          this.__applications.push(application);
        }),
      );
    } catch (error) {
      console.error(error);
    } finally {
      this._applications.next(this.__applications);
    }
  }
  applications = () => this._applications.asObservable();
  createApplication = async (application: Application) => {
    try {
      application.id = (await addDoc(collection(this.db, "data", "applications", "applications"), application)).id;
      this.__applications.push(application);
      // this.__applications = this.__applications.sort((application1, application2) => (application1.start == application2.start ? 0 : application1.start > application2.start ? 1 : -1));
      this._applications.next(this.__applications);
    } catch (error) {
      console.error(error);
    }
  };
  updateApplication = async (application: Application) => {
    try {
      let newApplication = new Application(application);
      delete newApplication.id;
      setDoc(doc(this.db, "data", "applications", "applications", application.id!), Object.assign({}, newApplication));
      this.__applications[this.__applications.findIndex((tmp) => tmp.id === application.id)] = application;
      this._applications.next(this.__applications);
    } catch (error) {
      console.error(error);
    }
  };
  deleteApplication = async (application: Application) => {
    try {
      deleteDoc(doc(this.db, "data", "applications", "applications", application.id!));
      // prettier-ignore
      this.__applications.splice(this.__applications.findIndex((tmp) => tmp.id === application.id),1);
      this._applications.next(this.__applications);
    } catch (error) {
      console.error(error);
    }
  };
}
