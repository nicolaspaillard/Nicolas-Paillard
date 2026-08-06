import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { Category } from "@classes/category";
import { Experience, formExperience } from "@classes/experience";
import { Project } from "@classes/project";
import { Skill } from "@classes/skill";
import { CrudComponent } from "@components/crud.component";
import { PromptButtonComponent } from "@components/prompt-button/prompt-button.component";
import { PromptComponent } from "@components/prompt/prompt.component";
import { AuthService } from "@services/auth.service";
import { ConfirmService } from "@services/confirm.service";
import {
  CrudService,
  SERVICE_CONFIG,
  ServiceConfig,
} from "@services/crud.service";
import { ButtonModule } from "@openng/optimus-ui/button";
import { DatePickerModule } from "@openng/optimus-ui/datepicker";
import { DialogModule } from "@openng/optimus-ui/dialog";
import { InputGroupModule } from "@openng/optimus-ui/inputgroup";
import { InputTextModule } from "@openng/optimus-ui/inputtext";
import { MultiSelectModule } from "@openng/optimus-ui/multiselect";
import { SelectModule } from "@openng/optimus-ui/select";
import { TextareaModule } from "@openng/optimus-ui/textarea";
import { TooltipModule } from "@openng/optimus-ui/tooltip";
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
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ExperienceComponent,
    DialogModule,
    DatePickerModule,
    MultiSelectModule,
    SelectModule,
    TextareaModule,
    InputTextModule,
    ButtonModule,
    InputGroupModule,
    TooltipModule,
    PromptComponent,
    PromptButtonComponent,
  ],
  templateUrl: "./career.component.html",
  providers: [
    CrudService<Experience>,
    { provide: SERVICE_CONFIG, useValue: SERVICE_VARIABLE },
  ],
})
export class CareerComponent extends CrudComponent<Experience> {
  activities: string[] = [];
  categories: Category[] = [];
  projects: Project[] = [];
  skills: Skill[] = [];
  constructor(
    crudService: CrudService<Experience>,
    authService: AuthService,
    confirmService: ConfirmService,
  ) {
    super(crudService, authService, confirmService);
    crudService
      .getData(Project, "projects", ["start", "desc"])
      .then((projects) => (this.projects = projects));
    crudService
      .getData(Skill, "skills", ["title"])
      .then((skills) => (this.skills = skills));
    crudService
      .getData(Category, "categories", ["title"])
      .then((categories) => (this.categories = categories));
  }
  add = (activity: string) => {
    this.activities.push(activity);
    this.form.patchValue({ activities: this.activities.join(";") });
  };
  move = (activity: string, up: boolean = false) => {
    let fromIndex = this.activities.indexOf(activity);
    if (
      (fromIndex == 0 && up) ||
      (fromIndex == this.activities.length - 1 && !up)
    )
      return;
    var element = this.activities[fromIndex];
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
    this.activities = this.activities.filter((act) => act != activity);
    this.form.patchValue({ activities: this.activities.join(";") });
  };
}
