import { Component, inject, signal } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { Category } from "@classes/category";
import { Experience } from "@classes/experience";
import { formProject, Project } from "@classes/project";
import { Skill } from "@classes/skill";
import { CrudComponent } from "@components/crud.component";
import { PromptButtonComponent } from "@components/prompt-button/prompt-button.component";
import { PromptComponent } from "@components/prompt/prompt.component";
import { sha1 } from "@helpers/helpers";
import { ButtonModule } from "@openng/optimus-ui/button";
import { DatePickerModule } from "@openng/optimus-ui/datepicker";
import { DialogModule } from "@openng/optimus-ui/dialog";
import { FileUploadModule } from "@openng/optimus-ui/fileupload";
import { InputGroupModule } from "@openng/optimus-ui/inputgroup";
import { InputTextModule } from "@openng/optimus-ui/inputtext";
import { MultiSelectModule } from "@openng/optimus-ui/multiselect";
import { Select, SelectModule } from "@openng/optimus-ui/select";
import { TextareaModule } from "@openng/optimus-ui/textarea";
import { TooltipModule } from "@openng/optimus-ui/tooltip";
import { AuthService } from "@services/auth.service";
import { ConfirmService } from "@services/confirm.service";
import { CrudService, SERVICE_CONFIG, ServiceConfig } from "@services/crud.service";
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
  imports: [ReactiveFormsModule, ProjectComponent, ButtonModule, DialogModule, TooltipModule, MultiSelectModule, SelectModule, InputGroupModule, DatePickerModule, InputTextModule, TextareaModule, FileUploadModule, PromptComponent, PromptButtonComponent, Select],
  templateUrl: "./projects.component.html",
  providers: [CrudService<Project>, { provide: SERVICE_CONFIG, useValue: SERVICE_VARIABLE }],
})
export class ProjectsComponent extends CrudComponent<Project> {
  activities: string[] = [];
  categories: Category[] = [];
  experiences: Experience[] = [];
  experiencesOptions: { label: string; value: string }[] = [];
  // TODO remove useless "images"
  images: string;
  imagesFiles: File[] = [];
  skills: Skill[] = [];
  skillsGroups = signal<{ items: { icon: string; label: string; value: string }[]; label: string; value: string }[]>([]);
  constructor() {
    const crudService = inject<CrudService<Project>>(CrudService);
    const authService = inject(AuthService);
    const confirmService = inject(ConfirmService);
    super(crudService, authService, confirmService);
    Promise.all([crudService.getData(Experience, "experiences", ["start", "desc"]), crudService.getData(Skill, "skills", ["title"]), crudService.getData(Category, "categories", ["title"])])
      .then(([experiences, skills, categories]) => {
        this.experiences = experiences;
        this.experiencesOptions = experiences.map(experience => ({ value: experience.id, label: experience.company + " - " + experience.title }));
        this.skills = skills;
        this.categories = categories;
        skills.map(skill => {
          const skillGroup = this.skillsGroups().find(sg => sg.value === skill.category);
          if (skillGroup) {
            const updatedGroup = { ...skillGroup, items: [...skillGroup.items, { label: skill.title, value: skill.id, icon: skill.icon }] };
            this.skillsGroups.update(groups => groups.map(group => (group === skillGroup ? updatedGroup : group)));
          } else {
            const newcat = categories.find(category => category.id === skill.category);
            this.skillsGroups.update(groups => [...groups, { label: newcat!.title, value: newcat!.id, items: [{ label: skill.title, value: skill.id, icon: skill.icon }] }]);
          }
        });
      })
      .catch(err => console.error(err));
  }
  add = (activity: string) => {
    this.activities.push(activity);
    this.form.patchValue({ activities: this.activities.join(";") });
  };
  // TODO update corresponding experience, add project
  override async create() {
    const result = this.imagesFiles.length ? await this.uploadImages(this.imagesFiles) : "";
    if (result === false) return;
    await super.create({ ...this.form.value, images: result } as Project);
  }
  getExperience = (project: Project) => {
    if (!project.experience || !project.experience.length) return;
    return { id: project.experience, title: this.experiences.find(experience => experience.id === project.experience)!.title };
  };
  getSkills = (project: Project) => {
    if (!project.skills || !project.skills.length) return [];
    const categories: { id: string; items: { icon: string; id: string; title: string }[]; title: string }[] = [];
    project.skills.forEach(skillId => {
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
  override open(item?: Project) {
    this.activities = item && item.activities ? item.activities.split(";") : [];
    this.images = item ? item.images : "";
    super.open(item);
  }
  remove = (activity: string) => {
    this.activities = this.activities.filter(act => act != activity);
    this.form.patchValue({ activities: this.activities.join(";") });
  };
  override async update() {
    const result = this.imagesFiles.length ? (await this.deleteImages(this.images)) && (await this.uploadImages(this.imagesFiles)) : (this.form.value as Project).images;
    if (result === false) return;
    await super.update({ ...this.form.value, images: result } as Project);
  }
  private deleteImages = async (images: string) => {
    if (images === "") return true;
    const timestamp: string = Math.round(new Date().getTime() / 1000).toString();
    const promises: Promise<boolean>[] = [];
    const cloudinary = (await this.getCloudinary())!;
    for (const image of images.split(";")) {
      const formdata = new FormData();
      formdata.append("public_id", "nicolasPaillard/" + image);
      formdata.append(
        "signature",
        sha1.hash(
          new URLSearchParams({
            public_id: "nicolasPaillard/" + image,
            timestamp: timestamp,
          })
            .toString()
            .replace("%2F", "/") + cloudinary.api_secret,
        ),
      );
      formdata.append("api_key", cloudinary.api_key);
      formdata.append("timestamp", timestamp);
      promises.push(
        fetch(`https://api.cloudinary.com/v1_1/dsuvd32up/image/destroy`, {
          method: "POST",
          body: formdata,
        })
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
    const promises: Promise<boolean | string>[] = [];
    const cloudinary = (await this.getCloudinary())!;
    for (const file of files) {
      const formData: FormData = new FormData();
      formData.append("file", file);
      formData.append("api_key", cloudinary.api_key);
      formData.append("upload_preset", "ml_default");
      formData.append("timestamp", timestamp);
      formData.append(
        "signature",
        sha1.hash(
          new URLSearchParams({
            folder: "nicolasPaillard",
            timestamp: timestamp,
            upload_preset: "ml_default",
          }).toString() + cloudinary.api_secret,
        ),
      );
      formData.append("folder", "nicolasPaillard");
      promises.push(
        fetch(`https://api.cloudinary.com/v1_1/dsuvd32up/image/upload`, {
          method: "POST",
          body: formData,
        })
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
