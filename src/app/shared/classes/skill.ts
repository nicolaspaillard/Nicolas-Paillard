import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Base } from "./base";

export class Skill extends Base {
  category: string;
  icon: string;
  // rank: number;
  constructor(skill: Skill) {
    // if (!skill.rank) skill.rank = 0;
    super(skill);
  }
}
export const formSkill: FormGroup = new FormGroup({
  id: new FormControl(""),
  title: new FormControl("", [Validators.required]),
  category: new FormControl("", [Validators.required]),
  icon: new FormControl(""),
  // rank: new FormControl(0, [Validators.required]),
});
