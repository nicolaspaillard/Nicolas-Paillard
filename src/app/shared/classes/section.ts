export class Section {
  id?: string;
  rank: number;
  text: string;
  constructor(section: Section) {
    Object.assign(this, section);
  }
}
