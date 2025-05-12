import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { Experience, formExperience } from "@classes/experience";
import { CrudComponent } from "@components/crud.component";
import { AuthService } from "@services/auth.service";
import { ConfirmService } from "@services/confirm.service";
import { CrudService, SERVICE_CONFIG, ServiceConfig } from "@services/crud.service";
import { ButtonModule } from "primeng/button";
import { DatePickerModule } from "primeng/datepicker";
import { DialogModule } from "primeng/dialog";
import { InputGroupModule } from "primeng/inputgroup";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { TextareaModule } from "primeng/textarea";
import { TooltipModule } from "primeng/tooltip";
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
  imports: [CommonModule, ReactiveFormsModule, ExperienceComponent, DialogModule, DatePickerModule, SelectModule, TextareaModule, InputTextModule, ButtonModule, InputGroupModule, TooltipModule],
  templateUrl: "./career.component.html",
  providers: [CrudService<Experience>, { provide: SERVICE_CONFIG, useValue: SERVICE_VARIABLE }],
})
export class CareerComponent extends CrudComponent<Experience> {
  activities: string[] = [];
  constructor(crudService: CrudService<Experience>, authService: AuthService, confirmService: ConfirmService) {
    super(crudService, authService, confirmService);
  }
  add = (activity: string) => {
    this.activities.push(activity);
    this.form.patchValue({ activities: this.activities.join(";") });
  };
  move = (activity: string, up: boolean = false) => {
    let fromIndex = this.activities.indexOf(activity);
    if ((fromIndex == 0 && up) || (fromIndex == this.activities.length - 1 && !up)) return;
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
