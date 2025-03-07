import { Base } from "./base";

export class Section extends Base {
  rank: number;
  text: string;
  constructor(section: Section) {
    super(section);
  }
}
