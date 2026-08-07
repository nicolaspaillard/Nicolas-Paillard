import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Base } from "./base";

export class Section extends Base {
  rank: number;
  text: string;
  constructor(section: Section) {
    super(section);
  }
}

export const formSection = new FormGroup({
  id: new FormControl(""),
  rank: new FormControl(0, [Validators.required]),
  text: new FormControl("", [Validators.required]),
});
