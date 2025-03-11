import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Application } from "@classes/application";
import { CrudComponent } from "@components/crud.component";
import { AuthService } from "@services/auth.service";
import { ConfirmService } from "@services/confirm.service";
import { CrudService, SERVICE_CONFIG, ServiceConfig } from "@services/crud.service";
import { ButtonModule } from "primeng/button";
import { DatePickerModule } from "primeng/datepicker";
import { DialogModule } from "primeng/dialog";
import { FileUploadModule } from "primeng/fileupload";
import { InputGroupModule } from "primeng/inputgroup";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { TextareaModule } from "primeng/textarea";

const SERVICE_VARIABLE: ServiceConfig<Application> = {
  type: Application,
  collection: "applications",
  order: ["title"],
  compareFn: (a, b) => (a.title < b.title ? -1 : a.title > b.title ? 1 : 0),
};

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
export class ApplicationsComponent extends CrudComponent<Application> {
  form = new FormGroup({
    id: new FormControl(""),
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
  links: string[] = [];
  contacts: string[] = [];
  expandedRows = {};
  constructor(crudService: CrudService<Application>, authService: AuthService, confirmService: ConfirmService) {
    super(crudService, authService, confirmService);
  }
  override open(item?: Application): void {
    this.links = item && item.links ? item.links.split(";") : [];
    this.contacts = item && item.contacts ? item.contacts.split(";") : [];
    super.open(item);
  }
  add = (item: string, field: string) => {
    this[field].push(item);
    this.form.patchValue({ [field]: this[field].join(";") });
  };
  remove = (item: string, field: string) => {
    this[field] = this[field].filter((itm: string) => itm != item);
    this.form.patchValue({ links: this.links.join(";") });
  };
  move = (item: string, field: string, up: boolean = false) => {
    let fromIndex = this[field].indexOf(item);
    if ((fromIndex == 0 && up) || (fromIndex == this.links.length - 1 && !up)) return;
    var element = this.links[fromIndex];
    this[field].splice(fromIndex, 1);
    this[field].splice(fromIndex + (up ? -1 : 1), 0, element);
    this.form.patchValue({ [field]: this[field].join(";") });
  };
}
