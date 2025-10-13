import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ReactiveFormsModule } from "@angular/forms";
import { formProfile, Profile } from "@classes/profile";
import { CrudComponent } from "@components/crud.component";
import { sha1 } from "@helpers/helpers";
import { AuthService } from "@services/auth.service";
import { ConfirmService } from "@services/confirm.service";
import { CrudService, SERVICE_CONFIG, ServiceConfig } from "@services/crud.service";
import { ToastService } from "@services/toast.service";
import { ButtonModule } from "primeng/button";
import { FileUpload, FileUploadHandlerEvent } from "primeng/fileupload";
import { InputTextModule } from "primeng/inputtext";
import { cloudinaryConfig } from "src/main";

const SERVICE_VARIABLE: ServiceConfig<Profile> = {
  type: Profile,
  form: formProfile,
  collection: "profile",
  order: ["lastName"],
};

@Component({
  selector: "app-profile",
  imports: [CommonModule, FileUpload, ReactiveFormsModule, ButtonModule, NgOptimizedImage, InputTextModule],
  templateUrl: "./profile.component.html",
  styles: ``,
  providers: [CrudService<Profile>, { provide: SERVICE_CONFIG, useValue: SERVICE_VARIABLE }],
})
export class ProfileComponent extends CrudComponent<Profile> {
  isUpdating: boolean = false;
  constructor(
    crudService: CrudService<Profile>,
    authService: AuthService,
    confirmService: ConfirmService,
    private toastService: ToastService,
  ) {
    crudService
      .items()
      .pipe(takeUntilDestroyed())
      .subscribe(items => {
        if (items.length) this.form.setValue(new Profile(items[0]));
      });
    super(crudService, authService, confirmService);
  }
  override async create() {}
  override delete() {}
  override open() {}
  override async update() {
    this.isUpdating = true;
    super
      .update(this.form.value as Profile)
      .then(() => {
        this.toastService.success("Succès", "Profil mis à jour avec succès");
      })
      .catch(() => {
        this.toastService.error("Erreur", "Erreur lors de la mise à jour du profil");
      })
      .finally(() => (this.isUpdating = false));
  }
  updatePhoto = async (event: FileUploadHandlerEvent) => {
    const timestamp: string = Math.round(new Date().getTime() / 1000).toString();
    const cloudinary = (await this.cloudinary())!;
    const formData: FormData = new FormData();
    let photo = new File([(await event.files[0].arrayBuffer()) as BlobPart], "profile");
    formData.append("public_id", "profile");
    formData.append("file", photo);
    formData.append("invalidate", "true");
    formData.append("api_key", cloudinary.api_key);
    formData.append("upload_preset", "ml_default");
    formData.append("timestamp", timestamp);
    formData.append("signature", sha1.hash(new URLSearchParams({ folder: "nicolasPaillard", invalidate: "true", public_id: "profile", timestamp: timestamp, upload_preset: "ml_default" }).toString() + cloudinary.api_secret));
    formData.append("folder", "nicolasPaillard");
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
      });
  };
}
