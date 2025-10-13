import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { formProject, Project } from "@classes/project";
import { CrudComponent } from "@components/crud.component";
import { sha1 } from "@helpers/helpers";
import { AuthService } from "@services/auth.service";
import { ConfirmService } from "@services/confirm.service";
import { CrudService, SERVICE_CONFIG, ServiceConfig } from "@services/crud.service";
import { ButtonModule } from "primeng/button";
import { DatePickerModule } from "primeng/datepicker";
import { DialogModule } from "primeng/dialog";
import { FileUploadModule } from "primeng/fileupload";
import { InputGroupModule } from "primeng/inputgroup";
import { InputTextModule } from "primeng/inputtext";
import { TextareaModule } from "primeng/textarea";
import { TooltipModule } from "primeng/tooltip";
import { cloudinaryConfig } from "src/main";
import { ProjectComponent } from "./project/project.component";

const SERVICE_VARIABLE: ServiceConfig<Project> = {
  type: Project,
  form: formProject,
  collection: "projects",
  order: ["start", "desc"],
  compareFn: (a, b) => b.start.getTime() - a.start.getTime(),
};

@Component({
  selector: "app-projects",
  imports: [CommonModule, ReactiveFormsModule, ProjectComponent, ButtonModule, DialogModule, TooltipModule, InputGroupModule, DatePickerModule, InputTextModule, TextareaModule, FileUploadModule],
  templateUrl: "./projects.component.html",
  providers: [CrudService<Project>, { provide: SERVICE_CONFIG, useValue: SERVICE_VARIABLE }],
})
export class ProjectsComponent extends CrudComponent<Project> {
  activities: string[] = [];
  images: string;
  constructor(crudService: CrudService<Project>, authService: AuthService, confirmService: ConfirmService) {
    super(crudService, authService, confirmService);
  }
  add = (activity: string) => {
    this.activities.push(activity);
    this.form.patchValue({ activities: this.activities.join(";") });
  };
  override async create(images: File[]) {
    const result = images.length ? await this.uploadImages(images) : "";
    if (result === false) return;
    await super.create({ ...this.form.value, images: result } as Project);
  }
  move = (activity: string, up: boolean = false) => {
    let fromIndex = this.activities.indexOf(activity);
    if ((fromIndex == 0 && up) || (fromIndex == this.activities.length - 1 && !up)) return;
    var element = this.activities[fromIndex];
    this.activities.splice(fromIndex, 1);
    this.activities.splice(fromIndex + (up ? -1 : 1), 0, element);
    this.form.patchValue({ activities: this.activities.join(";") });
  };
  override open(item?: Project) {
    this.activities = item && item.activities ? item.activities.split(";") : [];
    this.images = item ? item.images : "";
    super.open(item);
  }
  remove = (activity: string) => {
    this.activities = this.activities.filter(act => act != activity);
    this.form.patchValue({ activities: this.activities.join(";") });
  };
  override async update(images: File[]) {
    const result = images.length ? (await this.deleteImages(this.images)) && (await this.uploadImages(images)) : (this.form.value as Project).images;
    if (result === false) return;
    super.update({ ...this.form.value, images: result } as Project);
  }
  private deleteImages = async (images: string) => {
    if (images === "") return true;
    const timestamp: string = Math.round(new Date().getTime() / 1000).toString();
    let promises: Promise<boolean>[] = [];
    const cloudinary = (await this.cloudinary())!;
    for (let image of images.split(";")) {
      const formdata = new FormData();
      formdata.append("public_id", "nicolasPaillard/" + image);
      formdata.append("signature", sha1.hash(new URLSearchParams({ public_id: "nicolasPaillard/" + image, timestamp: timestamp }).toString().replace("%2F", "/") + cloudinary.api_secret));
      formdata.append("api_key", cloudinary.api_key);
      formdata.append("timestamp", timestamp);
      promises.push(
        fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/destroy`, { method: "POST", body: formdata })
          .then(async response => {
            const data = JSON.parse(await response.text());
            if (["ok", "not found"].includes(data.result)) return true;
            console.error(data);
            return false;
          })
          .catch(error => {
            console.error(error);
            return false;
          }),
      );
    }
    return !(await Promise.all(promises)).includes(false);
  };
  private uploadImages = async (files: File[]) => {
    if (!files.length) return "";
    const timestamp: string = Math.round(new Date().getTime() / 1000).toString();
    let promises: Promise<boolean | string>[] = [];
    const cloudinary = (await this.cloudinary())!;
    for (let file of files) {
      const formData: FormData = new FormData();
      formData.append("file", file);
      formData.append("api_key", cloudinary.api_key);
      formData.append("upload_preset", "ml_default");
      formData.append("timestamp", timestamp);
      formData.append("signature", sha1.hash(new URLSearchParams({ folder: "nicolasPaillard", timestamp: timestamp, upload_preset: "ml_default" }).toString() + cloudinary.api_secret));
      formData.append("folder", "nicolasPaillard");
      promises.push(
        fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, { method: "POST", body: formData })
          .then(async response => {
            const data = JSON.parse(await response.text());
            if (data.public_id) return data.public_id.split("/")[1];
            console.error(data);
            return false;
          })
          .catch(error => {
            console.error(error);
            return false;
          }),
      );
    }
    const responses = await Promise.all(promises);
    return responses.includes(false) ? false : responses.join(";");
  };
}
