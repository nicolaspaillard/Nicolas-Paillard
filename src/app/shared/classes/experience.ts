import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Base } from "./base";

export class Experience extends Base {
  active: boolean;
  activities: string;
  address: string;
  city: string;
  company: string;
  end: Date;
  postcode: string;
  start: Date;
  text: string;
  type: "Expérience" | "Formation" | "Évènement";
  constructor(experience: Experience) {
    // if (!experience.type) experience.type = "Expérience";
    if (experience.start && !(experience.start instanceof Date)) experience.start = (experience.start as any).toDate();
    if (experience.end && !(experience.end instanceof Date)) experience.end = (experience.end as any).toDate();
    super(experience);
  }
}

export const formExperience = new FormGroup({
  id: new FormControl(""),
  title: new FormControl("", [Validators.required]),
  start: new FormControl(new Date(), [Validators.required]),
  end: new FormControl(new Date(), []),
  text: new FormControl("", []),
  company: new FormControl("", []),
  address: new FormControl("", []),
  postcode: new FormControl("", []),
  city: new FormControl("", []),
  activities: new FormControl("", []),
  type: new FormControl("Expérience", [Validators.required]),
});
