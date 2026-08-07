import { Component, inject, signal } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { Category } from "@classes/category";
import { Experience, formExperience } from "@classes/experience";
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
import { CrudService, SERVICE_CONFIG, ServiceConfig } from "@services/crud.service";
import { ExperienceComponent } from "./experience/experience.component";

const SERVICE_VARIABLE: ServiceConfig<Experience> = {
  type: Experience,
  form: formExperience,
  collection: "experiences",
  order: ["start", "desc"],
  compareFn: (a, b) => b.start.getTime() - a.start.getTime(),
};

@Component({
  selector: "app-career",
  imports: [ReactiveFormsModule, ExperienceComponent, DialogModule, DatePickerModule, MultiSelectModule, SelectModule, TextareaModule, InputTextModule, ButtonModule, InputGroupModule, TooltipModule, PromptComponent, PromptButtonComponent],
  templateUrl: "./career.component.html",
  providers: [CrudService<Experience>, { provide: SERVICE_CONFIG, useValue: SERVICE_VARIABLE }],
})
export class CareerComponent extends CrudComponent<Experience> {
  activities: string[] = [];
  categories: Category[] = [];
  projects: Project[] = [];
  skills: Skill[] = [];
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
    // TODO skip if not admin
    Promise.all([crudService.getData(Project, "projects", ["start", "desc"]), crudService.getData(Skill, "skills", ["title"]), crudService.getData(Category, "categories", ["title"])])
      .then(([projects, skills, categories]) => {
        this.projects = projects;
        this.skills = skills;
        this.categories = categories;
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
      title: this.projects.find(project => project.id === projectId)!.title,
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
      const newSkill = this.skills.find(skill => skill.id === skillId)!;
      const newCategory = this.categories.find(category => category.id === newSkill.category)!;
      const category = categories.find(category => category.id === newCategory.id)!;
      if (category) {
        category.items.push(newSkill);
      } else {
        categories.push({ ...newCategory, items: [newSkill] });
      }
    });
    return categories;
  };
  move = (activity: string, up = false) => {
    const fromIndex = this.activities.indexOf(activity);
    if ((fromIndex == 0 && up) || (fromIndex == this.activities.length - 1 && !up)) return;
    const element = this.activities[fromIndex];
    this.activities.splice(fromIndex, 1);
    this.activities.splice(fromIndex + (up ? -1 : 1), 0, element);
    this.form.patchValue({ activities: this.activities.join(";") });
  };
  override open(item?: Experience): void {
    this.activities = item && item.activities ? item.activities.split(";") : [];
    this.form.patchValue({ activities: this.activities.join(";") });
    super.open(item);
  }
  remove = (activity: string) => {
    this.activities = this.activities.filter(act => act != activity);
    this.form.patchValue({ activities: this.activities.join(";") });
  };
}
