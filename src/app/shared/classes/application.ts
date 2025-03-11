import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Base } from "./base";
export class Application extends Base {
  title: string;
  company: string;
  activity: string;
  address: string;
  links: string;
  comments: string;
  contacts: string;
  contactDate: Date;
  relaunchDate: Date;
  answerDate: Date;
  answer: string;
  constructor(application: Application) {
    if (application.contactDate && !(application.contactDate instanceof Date)) application.contactDate = (application.contactDate as any).toDate();
    if (application.relaunchDate && !(application.relaunchDate instanceof Date)) application.relaunchDate = (application.relaunchDate as any).toDate();
    if (application.answerDate && !(application.answerDate instanceof Date)) application.answerDate = (application.answerDate as any).toDate();
    super(application);
  }
}

export const formApplication = new FormGroup({
  id: new FormControl(""),
  title: new FormControl("", [Validators.required]),
  company: new FormControl("", [Validators.required]),
  activity: new FormControl("", [Validators.required]),
  address: new FormControl("", [Validators.required]),
  links: new FormControl("", []),
  comments: new FormControl("", []),
  contacts: new FormControl("", []),
  contactDate: new FormControl(new Date(), []),
  relaunchDate: new FormControl(new Date(), []),
  answerDate: new FormControl(new Date(), []),
  answer: new FormControl("", []),
});
