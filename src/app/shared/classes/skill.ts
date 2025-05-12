import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Base } from "./base";

export class Skill extends Base {
  category: string;
  icon: string;
  rank: number;
  title: string;
  constructor(skill: Skill) {
    if (!skill.rank) skill.rank = 0;
    super(skill);
  }
}

export class Category {
  rank: number;
  skills: Skill[];
  title: string;
  constructor(category: Category) {
    Object.assign(this, category);
  }
}

export const formSkill: FormGroup = new FormGroup({
  category: new FormControl("", [Validators.required]),
  icon: new FormControl("", [Validators.required]),
  id: new FormControl(""),
  rank: new FormControl(0, [Validators.required]),
  title: new FormControl("", [Validators.required]),
});
