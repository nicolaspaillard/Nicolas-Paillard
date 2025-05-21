import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Base } from "./base";

export class Category extends Base {
  rank: number;
  constructor(category: Category) {
    super(category);
  }
}
export const formCategory: FormGroup = new FormGroup({
  id: new FormControl(""),
  title: new FormControl("", [Validators.required]),
  rank: new FormControl(0, [Validators.required]),
});
