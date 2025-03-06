export class Experience {
  id?: string;
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
    Object.assign(this, experience);
  }
}
