import { Timestamp } from "@angular/fire/firestore";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Base } from "./base";
export class Application extends Base {
  activity: string;
  address: string;
  answer: string;
  answerDate: Date;
  comments: string;
  company: string;
  contactDate: Date;
  contacts: string;
  links: string;
  relaunchDate: Date;
  sector: string;
  type: "Annonce" | "Spontané";
  constructor(application: Record<string, unknown>) {
    if (application["contactDate"] && !(application["contactDate"] instanceof Date)) application["contactDate"] = (application["contactDate"] as Timestamp).toDate();
    if (application["relaunchDate"] && !(application["relaunchDate"] instanceof Date)) application["relaunchDate"] = (application["relaunchDate"] as Timestamp).toDate();
    if (application["answerDate"] && !(application["answerDate"] instanceof Date)) application["answerDate"] = (application["answerDate"] as Timestamp).toDate();
    if (!application["type"]) application["type"] = "Annonce";
    super(application);
  }
}

export const formApplication = new FormGroup({
  id: new FormControl(""),
  title: new FormControl("", [control => Validators.required(control)]),
  company: new FormControl("", [control => Validators.required(control)]),
  activity: new FormControl("", [control => Validators.required(control)]),
  sector: new FormControl("", [control => Validators.required(control)]),
  address: new FormControl("", [control => Validators.required(control)]),
  links: new FormControl(""),
  comments: new FormControl(""),
  contacts: new FormControl(""),
  contactDate: new FormControl(new Date()),
  relaunchDate: new FormControl(new Date()),
  answerDate: new FormControl(new Date()),
  answer: new FormControl(""),
  type: new FormControl("", [control => Validators.required(control)]),
});
