import { Component, computed, inject, Injector, signal } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { Category } from "@classes/category";
import { Experience } from "@classes/experience";
import { Project } from "@classes/project";
import { Skill } from "@classes/skill";
import { Crud } from "@components/crud.component";
import { PromptButtonComponent } from "@components/prompt-button/prompt-button.component";
import { PromptComponent } from "@components/prompt/prompt.component";
import { ButtonModule } from "@openng/optimus-ui/button";
import { DatePickerModule } from "@openng/optimus-ui/datepicker";
import { DialogModule } from "@openng/optimus-ui/dialog";
import { InputGroupModule } from "@openng/optimus-ui/inputgroup";
import { InputTextModule } from "@openng/optimus-ui/inputtext";
import { MultiSelectModule } from "@openng/optimus-ui/multiselect";
import { SelectModule } from "@openng/optimus-ui/select";
import { TextareaModule } from "@openng/optimus-ui/textarea";
import { TooltipModule } from "@openng/optimus-ui/tooltip";
import { CONFIG_CATEGORIES, CONFIG_PROJECTS, CONFIG_SKILLS } from "@routes/route.configs";
import { CrudService } from "@services/crud.service";
import { firstValueFrom } from "rxjs";
import { ExperienceComponent } from "./experience/experience.component";

@Component({
  selector: "app-career",
  imports: [ReactiveFormsModule, ExperienceComponent, DialogModule, DatePickerModule, MultiSelectModule, SelectModule, TextareaModule, InputTextModule, ButtonModule, InputGroupModule, TooltipModule, PromptComponent, PromptButtonComponent],
  templateUrl: "./career.component.html",
})
export class CareerComponent extends Crud<Experience> {
  activities: string[] = [];
  categories = signal<Category[]>([]);
  projects = signal<Project[]>([]);
  skills = signal<Skill[]>([]);
  skillsGroups = computed(() => {
    if (!this.user()?.admin) return [];
    return this.categories()
      .map(category => ({
        label: category.title,
        value: category.id,
        items: this.skills()
          .filter(skill => skill.category === category.id)
          .map(skill => ({ label: skill.title, value: skill.id, icon: skill.icon })),
      }))
      .filter(group => group.items.length);
  });
  constructor() {
    super();
    const injector = inject(Injector);
    Promise.all([firstValueFrom(CrudService.forCollection(injector, CONFIG_PROJECTS).items()), firstValueFrom(CrudService.forCollection(injector, CONFIG_SKILLS).items()), firstValueFrom(CrudService.forCollection(injector, CONFIG_CATEGORIES).items())])
      .then(([projects, skills, categories]) => {
        this.projects.set([...projects]);
        this.skills.set([...skills]);
        this.categories.set([...categories]);
      })
      .catch(err => console.error(err));
  }
  add = (activity: string) => {
    this.activities.push(activity);
    this.form.patchValue({ activities: this.activities });
  };
  override create() {
    // TODO update corresponding projects
    return super.create();
  }
  getProjects = (experience: Experience) => {
    if (!experience.projects || !experience.projects.length) return [];
    return experience.projects.map(projectId => ({
      id: projectId,
      title: this.projects().find(project => project.id === projectId)!.title,
    }));
  };
  getSkills = (experience: Experience) => {
    if (!experience.skills || !experience.skills.length) return [];
    const categories: {
      id: string;
      items: { icon: string; id: string; title: string }[];
      title: string;
    }[] = [];
    experience.skills.forEach(skillId => {
      const newSkill = this.skills().find(skill => skill.id === skillId);
      if (!newSkill) return;
      const newCategory = this.categories().find(category => category.id === newSkill.category);
      if (!newCategory) return;
      const category = categories.find(category => category.id === newCategory.id)!;
      if (category) {
        category.items.push(newSkill);
      } else {
        categories.push({ ...newCategory, items: [newSkill] });
      }
    });
    return categories;
  };
  move = (index: number, up = false) => {
    if ((index === 0 && up) || (index === this.activities.length - 1 && !up)) return;
    const element = this.activities[index];
    this.activities.splice(index, 1);
    this.activities.splice(index + (up ? -1 : 1), 0, element);
    this.form.patchValue({ activities: this.activities });
  };
  override open(item?: Experience): void {
    this.activities = item && item.activities ? item.activities : [];
    super.open(item);
  }
  remove = (activity: string) => {
    this.activities = this.activities.filter(act => act != activity);
    this.form.patchValue({ activities: this.activities });
  };
}
