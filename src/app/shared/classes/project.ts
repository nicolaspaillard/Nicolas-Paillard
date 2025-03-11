import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Base } from "./base";

export class Project extends Base {
  start: Date;
  end: Date;
  title: string;
  text: string;
  company: string;
  address: string;
  postcode: string;
  city: string;
  activities: string;
  images: string;
  url: string;
  constructor(project: Project) {
    if (project.start && !(project.start instanceof Date)) project.start = (project.start as any).toDate();
    if (project.end && !(project.end instanceof Date)) project.end = (project.end as any).toDate();
    super(project);
  }
}

export const formProject: FormGroup = new FormGroup({
  id: new FormControl(""),
  start: new FormControl(new Date(), [Validators.required]),
  end: new FormControl(new Date(), [Validators.required]),
  title: new FormControl("", [Validators.required]),
  text: new FormControl("", []),
  company: new FormControl("", []),
  address: new FormControl("", []),
  postcode: new FormControl("", []),
  city: new FormControl("", []),
  activities: new FormControl("", []),
  url: new FormControl("", []),
  images: new FormControl("", []),
});
