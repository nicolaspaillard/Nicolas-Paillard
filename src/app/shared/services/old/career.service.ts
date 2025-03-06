import { Injectable } from "@angular/core";
import { Firestore, addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, setDoc } from "@angular/fire/firestore";
import { ReplaySubject, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CareerService {
  private __experiences: Experience[] = [];
  private _experiences: Subject<Experience[]> = new ReplaySubject(1);
  constructor(private db: Firestore) {
    try {
      getDocs(query(collection(this.db, "data", "experiences", "experiences"), orderBy("start", "desc"))).then((experiences) => {
        experiences.docs.forEach((doc) => {
          let experience: Experience = new Experience(doc.data() as any);
          experience.id = doc.id;
          experience.start = doc.data()["start"].toDate();
          if (doc.data()["end"]) experience.end = doc.data()["end"].toDate();
          this.__experiences.push(experience);
        });
      });
    } catch (error) {
      console.error(error);
    } finally {
      this._experiences.next(this.__experiences);
    }
  }
  experiences = () => this._experiences.asObservable();
  createExperience = async (experience: Experience) => {
    try {
      experience.id = (await addDoc(collection(this.db, "data", "experiences", "experiences"), experience)).id;
      this.__experiences.push(experience);
      this.__experiences.sort((exp1, exp2) => (exp1.start == exp2.start ? 0 : exp1.start < exp2.start ? -1 : 1));
      this._experiences.next(this.__experiences);
    } catch (error) {
      console.error(error);
    }
  };
  updateExperience = async (experience: Experience) => {
    try {
      let newExperience = new Experience(experience);
      delete newExperience.id;
      await setDoc(doc(this.db, "data", "experiences", "experiences", experience.id!), Object.assign({}, newExperience));
      this.__experiences[this.__experiences.findIndex((tmp) => tmp.id === experience.id)] = experience;
      this._experiences.next(this.__experiences);
    } catch (error) {
      console.error(error);
    }
  };
  deleteExperience = async (experience: Experience) => {
    try {
      await deleteDoc(doc(this.db, "data", "experiences", "experiences", experience.id!));
      // prettier-ignore
      this.__experiences.splice(this.__experiences.findIndex((tmp) => tmp.id === experience.id),1);
      this._experiences.next(this.__experiences);
    } catch (error) {
      console.error(error);
    }
  };
}
