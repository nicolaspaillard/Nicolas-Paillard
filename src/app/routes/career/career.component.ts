import { Component, inject, Injector, signal } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { CONFIG_CATEGORIES, CONFIG_PROJECTS, CONFIG_SKILLS } from "@app/shared/route.configs";
import { Category } from "@classes/category";
import { Experience } from "@classes/experience";
import { Project } from "@classes/project";
import { Skill } from "@classes/skill";
import { CrudComponent } from "@components/crud.component";
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
import { AuthService } from "@services/auth.service";
import { ConfirmService } from "@services/confirm.service";
import { CrudService } from "@services/crud.service";
import { firstValueFrom } from "rxjs";
import { ExperienceComponent } from "./experience/experience.component";

@Component({
  selector: "app-career",
  imports: [ReactiveFormsModule, ExperienceComponent, DialogModule, DatePickerModule, MultiSelectModule, SelectModule, TextareaModule, InputTextModule, ButtonModule, InputGroupModule, TooltipModule, PromptComponent, PromptButtonComponent],
  templateUrl: "./career.component.html",
})
export class CareerComponent extends CrudComponent<Experience> {
  activities: string[] = [];
  categories = signal<Category[]>([]);
  projects = signal<Project[]>([]);
  skills = signal<Skill[]>([]);
  skillsGroups = signal<
    {
      items: { icon: string; label: string; value: string }[];
      label: string;
      value: string;
    }[]
  >([]);
  constructor() {
    const crudService = inject<CrudService<Experience>>(CrudService);
    const authService = inject(AuthService);
    const confirmService = inject(ConfirmService);
    super(crudService, authService, confirmService);

    const injector = inject(Injector);
    const projectsService = CrudService.forCollection(injector, CONFIG_PROJECTS);
    const skillsService = CrudService.forCollection(injector, CONFIG_SKILLS);
    const categoriesService = CrudService.forCollection(injector, CONFIG_CATEGORIES);
    // TODO skip if not admin
    Promise.all([firstValueFrom(projectsService.items()), firstValueFrom(skillsService.items()), firstValueFrom(categoriesService.items())])
      .then(([projects, skills, categories]) => {
        this.projects.set([...projects]);
        this.skills.set([...skills]);
        this.categories.set([...categories]);
        skills.map(skill => {
          const skillGroup = this.skillsGroups().find(sg => sg.value === skill.category);
          if (skillGroup) {
            const updatedGroup = {
              ...skillGroup,
              items: [...skillGroup.items, { label: skill.title, value: skill.id, icon: skill.icon }],
            };
            this.skillsGroups.update(groups => groups.map(group => (group === skillGroup ? updatedGroup : group)));
          } else {
            const newcat = categories.find(category => category.id === skill.category);
            this.skillsGroups.update(groups => [
              ...groups,
              {
                label: newcat!.title,
                value: newcat!.id,
                items: [{ label: skill.title, value: skill.id, icon: skill.icon }],
              },
            ]);
          }
        });
      })
      .catch(err => console.error(err));
  }
  add = (activity: string) => {
    this.activities.push(activity);
    this.form.patchValue({ activities: this.activities.join(";") });
  };
  override create() {
    // TODO update corresponding project
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
    this.form.patchValue({ activities: this.activities.join(";") });
    super.open(item);
  }
  remove = (activity: string) => {
    this.activities = this.activities.filter(act => act != activity);
    this.form.patchValue({ activities: this.activities });
  };
}
