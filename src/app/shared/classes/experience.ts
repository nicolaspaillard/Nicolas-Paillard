import { Timestamp } from "@angular/fire/firestore";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Base } from "./base";

export class Experience extends Base {
  active: boolean;
  activities: string[];
  address: string;
  city: string;
  company: string;
  description: string;
  end: Date;
  postcode: string;
  projects: string[];
  skills: string[];
  start: Date;
  type: "Expérience" | "Formation" | "Évènement";
  constructor(experience: Experience) {
    if (experience.start && !(experience.start instanceof Date)) experience.start = (experience.start as Timestamp).toDate();
    if (experience.end && !(experience.end instanceof Date)) experience.end = (experience.end as Timestamp).toDate();
    super(experience);
  }
}

export const formExperience = new FormGroup({
  id: new FormControl(""),
  title: new FormControl("", [control => Validators.required(control)]),
  start: new FormControl(new Date(), [control => Validators.required(control)]),
  end: new FormControl(new Date()),
  description: new FormControl(""),
  company: new FormControl(""),
  address: new FormControl(""),
  postcode: new FormControl(""),
  city: new FormControl(""),
  activities: new FormControl([]),
  type: new FormControl("Expérience", [control => Validators.required(control)]),
  projects: new FormControl([]),
  skills: new FormControl([]),
});
