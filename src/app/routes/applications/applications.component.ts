import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Application } from "@app/shared/classes/application";
import { AuthService } from "@services/auth.service";
import { CrudService, SERVICE_CONFIG } from "@services/crud.service";
import { ConfirmService } from "@services/frontend/confirm.service";
import { ApplicationsService } from "@services/old/applications.service";
import { ButtonModule } from "primeng/button";
import { DatePickerModule } from "primeng/datepicker";
import { DialogModule } from "primeng/dialog";
import { FileUploadModule } from "primeng/fileupload";
import { InputGroupModule } from "primeng/inputgroup";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { TextareaModule } from "primeng/textarea";

@Component({
  selector: "app-applications",
  imports: [DialogModule, DatePickerModule, ReactiveFormsModule, ButtonModule, InputGroupModule, FileUploadModule, CommonModule, InputTextModule, TextareaModule, DialogModule, DatePickerModule, TableModule],
  templateUrl: "./applications.component.html",
  providers: [
    CrudService<Application>,
    {
      provide: SERVICE_CONFIG,
      useValue: { type: Application, collection: "applications", order: ["title"] },
    },
  ],
  styles: ``,
})
export class ApplicationsComponent {
  isDialogShown: boolean = false;
  user: any = null;
  formApplication = new FormGroup({
    title: new FormControl("", [Validators.required]),
    company: new FormControl("", [Validators.required]),
    activity: new FormControl("", [Validators.required]),
    address: new FormControl("", [Validators.required]),
    links: new FormControl("", []),
    comments: new FormControl("", []),
    contacts: new FormControl("", []),
    contactDate: new FormControl(new Date(), []),
    relaunchDate: new FormControl(new Date(), []),
    answerDate: new FormControl(new Date(), []),
    answer: new FormControl("", []),
  });
  editing: { id: string } = { id: "" };
  applications: Application[] = [];
  expandedRows = {};
  constructor(
    private crudService: CrudService<Application>,
    private confirmService: ConfirmService,
    private authService: AuthService,
    private applicationsService: ApplicationsService,
  ) {
    this.authService.user().subscribe((user) => (this.user = user));
    this.applicationsService.applications().subscribe((applications) => {
      this.applications = applications;
      console.log(applications);
    });
  }
  openDialog = (application?: Application) => {
    if (application) {
      this.editing = { id: application.id! };
      let tmp = new Application(application);
      delete tmp.id;
      this.formApplication.setValue(tmp);
    } else {
      this.editing = { id: "" };
      this.formApplication.reset();
    }
    this.isDialogShown = true;
  };
  createApplication = async () => {
    this.applicationsService.createApplication(this.formApplication.value as Application);
  };
  updateApplication = async () => {
    let application: Application = this.formApplication.value as Application;
    application.id = this.editing.id;
    this.applicationsService.updateApplication(application);
  };
  deleteApplication = async (application: Application) => {
    this.confirmService.confirm({
      message: `Voulez-vous vraiment supprimer '${application.title}' ?`,
      accept: async () => {
        this.applicationsService.deleteApplication(application);
      },
    });
  };
}
