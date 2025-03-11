import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Base } from "./base";

export class Experience extends Base {
  start: Date;
  end: Date;
  title: string;
  text: string;
  company: string;
  address: string;
  postcode: string;
  city: string;
  activities: string;
  active: boolean;
  constructor(experience: Experience) {
    if (experience.start && !(experience.start instanceof Date)) experience.start = (experience.start as any).toDate();
    if (experience.end && !(experience.end instanceof Date)) experience.end = (experience.end as any).toDate();
    super(experience);
  }
}

export const formExperience = new FormGroup({
  id: new FormControl(""),
  start: new FormControl(new Date(), [Validators.required]),
  end: new FormControl(new Date(), []),
  title: new FormControl("", [Validators.required]),
  text: new FormControl("", []),
  company: new FormControl("", []),
  address: new FormControl("", []),
  postcode: new FormControl("", []),
  city: new FormControl("", []),
  activities: new FormControl("", []),
});
