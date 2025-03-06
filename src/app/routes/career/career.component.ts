import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "@app/shared/services/auth.service";
import { ConfirmService } from "@app/shared/services/frontend/confirm.service";
import { CareerService, Experience } from "@services/old/career.service";
import { ButtonModule } from "primeng/button";
import { DatePickerModule } from "primeng/datepicker";
import { DialogModule } from "primeng/dialog";
import { InputGroupModule } from "primeng/inputgroup";
import { InputTextModule } from "primeng/inputtext";
import { TextareaModule } from "primeng/textarea";
import { TooltipModule } from "primeng/tooltip";
import { ExperienceComponent } from "./experience/experience.component";

@Component({
  selector: "app-career",
  imports: [CommonModule, ReactiveFormsModule, ExperienceComponent, DialogModule, DatePickerModule, TextareaModule, InputTextModule, ButtonModule, InputGroupModule, TooltipModule],
  templateUrl: "./career.component.html",
})
export class CareerComponent {
  isDialogShown: boolean = false;
  user: any = null;
  activities: string[] = [];
  idEdit: string = "";
  formExperience = new FormGroup({
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
  experiences: Experience[] = [];
  constructor(
    private authService: AuthService,
    private confirmService: ConfirmService,
    private careerService: CareerService,
  ) {
    this.authService.user().subscribe((user) => (this.user = user));
    this.careerService.experiences().subscribe((experiences) => (this.experiences = experiences));
  }
  openDialog = (experience?: Experience) => {
    if (experience) {
      this.idEdit = experience.id!;
      if (experience.activities && experience.activities.length) this.activities = experience.activities.split(";");
      let tmp = new Experience(experience);
      delete tmp.id;
      this.formExperience.setValue(tmp);
    } else {
      this.idEdit = "";
      this.formExperience.reset();
      this.activities = [];
    }
    this.isDialogShown = true;
  };
  addActivity = (activity: string) => {
    this.activities.push(activity);
    this.formExperience.patchValue({
      activities: this.activities.join(";"),
    });
  };
  removeActivity = (activity: string) => {
    this.activities = this.activities.filter((act) => act != activity);
    this.formExperience.patchValue({
      activities: this.activities.join(";"),
    });
  };
  moveActivity = (activity: string, up: boolean = false) => {
    let fromIndex = this.activities.indexOf(activity);
    if ((fromIndex == 0 && up) || (fromIndex == this.activities.length - 1 && !up)) return;
    var element = this.activities[fromIndex];
    this.activities.splice(fromIndex, 1);
    this.activities.splice(fromIndex + (up ? -1 : 1), 0, element);
    this.formExperience.patchValue({
      activities: this.activities.join(";"),
    });
  };
  createExperience = () => {
    this.careerService.createExperience(this.formExperience.value as Experience);
  };
  updateExperience = () => {
    let experience: Experience = this.formExperience.value as Experience;
    experience.id = this.idEdit;
    this.careerService.updateExperience(experience);
  };
  deleteExperience = (experience: Experience) => {
    this.confirmService.confirm({
      message: `Voulez-vous vraiment supprimer '${experience.title}' ?`,
      accept: async () => {
        this.careerService.deleteExperience(experience);
      },
    });
  };
}
