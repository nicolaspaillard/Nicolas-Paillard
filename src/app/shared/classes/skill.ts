export class Skill {
  id?: string;
  category: string;
  icon: string;
  title: string;
  constructor(skill: Skill) {
    Object.assign(this, skill);
  }
}
