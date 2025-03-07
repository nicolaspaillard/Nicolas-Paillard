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
