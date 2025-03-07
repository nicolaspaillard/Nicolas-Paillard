import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Experience } from "@app/shared/classes/experience";
import { CrudComponent } from "@components/crud.component";
import { AuthService } from "@services/auth.service";
import { CrudService, SERVICE_CONFIG, ServiceConfig } from "@services/crud.service";
import { ConfirmService } from "@services/frontend/confirm.service";
import { ButtonModule } from "primeng/button";
import { DatePickerModule } from "primeng/datepicker";
import { DialogModule } from "primeng/dialog";
import { InputGroupModule } from "primeng/inputgroup";
import { InputTextModule } from "primeng/inputtext";
import { TextareaModule } from "primeng/textarea";
import { TooltipModule } from "primeng/tooltip";
import { ExperienceComponent } from "./experience/experience.component";

const SERVICE_VARIABLE: ServiceConfig<Experience> = {
  type: Experience,
  collection: "experiences",
  order: ["start", "desc"],
  compareFn: (a, b) => b.start.getTime() - a.start.getTime(),
};

@Component({
  selector: "app-career",
  imports: [CommonModule, ReactiveFormsModule, ExperienceComponent, DialogModule, DatePickerModule, TextareaModule, InputTextModule, ButtonModule, InputGroupModule, TooltipModule],
  templateUrl: "./career.component.html",
  providers: [CrudService<Experience>, { provide: SERVICE_CONFIG, useValue: SERVICE_VARIABLE }],
})
export class CareerComponent extends CrudComponent<Experience> {
  form = new FormGroup({
    id: new FormControl(""),
    start: new FormControl(new Date(), [Validators.required]),
    end: new FormControl(new Date(), []),
    title: new FormControl("", [Validators.required]),
    text: new FormControl("", []),
    company: new FormControl("", []),
    address: new FormControl("", []),
    postcode: new FormControl("", []),
    city: new FormControl("", []),
    activities: new FormControl("", []),
  });
  activities: string[] = [];
  constructor(crudService: CrudService<Experience>, authService: AuthService, confirmService: ConfirmService) {
    super(crudService, authService, confirmService);
  }
  override open(item?: Experience): void {
    this.activities = item ? item.activities.split(";") : [];
    super.open(item);
  }
  add = (activity: string) => {
    this.activities.push(activity);
    this.form.patchValue({ activities: this.activities.join(";") });
  };
  remove = (activity: string) => {
    this.activities = this.activities.filter((act) => act != activity);
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
}
