import { Timestamp } from "@angular/fire/firestore";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Base } from "./base";

export class Project extends Base {
  activities: string[];
  address: string;
  city: string;
  company: string;
  description: string;
  end: Date;
  experience: string;
  images: string;
  postcode: string;
  skills: string[];
  start: Date;
  url: string;
  constructor(project: Record<string, unknown>) {
    if (typeof project["activities"] === "string") project["activities"] = project["activities"].split(";");
    if (!project["experience"]) project["experience"] = "";
    if (!project["skills"]) project["skills"] = [];
    if (project["start"] && !(project["start"] instanceof Date)) project["start"] = (project["start"] as Timestamp).toDate();
    if (project["end"] && !(project["end"] instanceof Date)) project["end"] = (project["end"] as Timestamp).toDate();
    super(project);
  }
}

export const formProject: FormGroup = new FormGroup({
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
  url: new FormControl(""),
  images: new FormControl(""),
  experience: new FormControl(""),
  skills: new FormControl([]),
});
