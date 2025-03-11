import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Base } from "./base";

export class Skill extends Base {
  category: string;
  icon: string;
  title: string;
  constructor(skill: Skill) {
    super(skill);
  }
}

export class Category {
  title: string;
  skills: Skill[];
  constructor(category: Category) {
    Object.assign(this, category);
  }
}

export const formSkill: FormGroup = new FormGroup({
  id: new FormControl(""),
  title: new FormControl("", [Validators.required]),
  icon: new FormControl("", [Validators.required]),
  category: new FormControl("", [Validators.required]),
});
