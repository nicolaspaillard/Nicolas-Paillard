import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Base } from "./base";

export class Skill extends Base {
  category: string;
  experiences: string[];
  icon: string;
  level: number;
  projects: string[];
  // rank: number;
  constructor(skill: Record<string, unknown>) {
    // if (!skill.rank) skill.rank = 0;
    if (!skill["level"]) skill["level"] = 0;
    if (!skill["experiences"]) skill["experiences"] = [];
    if (!skill["projects"]) skill["projects"] = [];
    super(skill);
  }
}
export const formSkill: FormGroup = new FormGroup({
  id: new FormControl(""),
  title: new FormControl("", [control => Validators.required(control)]),
  category: new FormControl("", [control => Validators.required(control)]),
  icon: new FormControl(""),
  level: new FormControl(0, [control => Validators.required(control)]),
  projects: new FormControl([]),
  experiences: new FormControl([]),
  // rank: new FormControl(0, [control => Validators.required(control)]),
});
