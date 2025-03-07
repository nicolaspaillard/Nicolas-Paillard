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
