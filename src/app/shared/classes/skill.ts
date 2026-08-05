import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Base } from "./base";

export class Skill extends Base {
  category: string;
  experiences: string[];
  icon: string;
  projects: string[];
  // rank: number;
  constructor(skill: Skill) {
    // if (!skill.rank) skill.rank = 0;
    if (!skill.experiences) skill.experiences = [];
    if (!skill.projects) skill.projects = [];
    super(skill);
  }
}
export const formSkill: FormGroup = new FormGroup({
  id: new FormControl(""),
  title: new FormControl("", [Validators.required]),
  category: new FormControl("", [Validators.required]),
  icon: new FormControl(""),
  projects: new FormControl([]),
  experiences: new FormControl([]),
  // rank: new FormControl(0, [Validators.required]),
});
