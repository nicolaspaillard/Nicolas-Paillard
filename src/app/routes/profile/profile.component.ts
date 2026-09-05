import { NgOptimizedImage } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { Profile } from "@classes/profile";
import { CrudComponent } from "@components/crud.component";
import { sha1 } from "@helpers/sha1";
import { ButtonModule } from "@openng/optimus-ui/button";
import { FileUpload, FileUploadHandlerEvent } from "@openng/optimus-ui/fileupload";
import { InputTextModule } from "@openng/optimus-ui/inputtext";
import { AuthService } from "@services/auth.service";
import { ConfirmService } from "@services/confirm.service";
import { CrudService } from "@services/crud.service";
import { ToastService } from "@services/toast.service";

@Component({
  selector: "app-profile",
  imports: [FileUpload, ReactiveFormsModule, ButtonModule, NgOptimizedImage, InputTextModule],
  templateUrl: "./profile.component.html",
  styles: ``,
})
export class ProfileComponent extends CrudComponent<Profile> {
  isUpdating = false;
  private toastService = inject(ToastService);

  constructor() {
    const crudService = inject<CrudService<Profile>>(CrudService);
    const authService = inject(AuthService);
    const confirmService = inject(ConfirmService);

    // crudService
    //   .items()
    //   .pipe(takeUntilDestroyed())
    //   .subscribe(items => {
    //     if (items().length) this.form.setValue(new Profile(items[0]));
    //   });
    super(crudService, authService, confirmService);
    if (this.items().length) this.form.setValue(this.items()[0]);
  }
  // override async create() {}
  // override delete() {}
  // override open() {}
  override async update() {
    this.isUpdating = true;
    try {
      await super.update(this.form.value as Profile);
      this.toastService.success("Succès", "Profil mis à jour avec succès");
    } catch {
      this.toastService.error("Erreur", "Erreur lors de la mise à jour du profil");
    } finally {
      this.isUpdating = false;
    }
  }
  updatePhoto = async (event: FileUploadHandlerEvent) => {
    const timestamp: string = Math.round(new Date().getTime() / 1000).toString();
    const cloudinary = (await this.getCloudinary())!;
    const formData: FormData = new FormData();
    const photo = new File([await event.files[0].arrayBuffer()], "profile");
    formData.append("public_id", "profile");
    formData.append("file", photo);
    formData.append("invalidate", "true");
    formData.append("api_key", cloudinary.api_key);
    formData.append("upload_preset", "ml_default");
    formData.append("timestamp", timestamp);
    formData.append("signature", sha1(new URLSearchParams({ folder: "nicolasPaillard", invalidate: "true", public_id: "profile", timestamp: timestamp, upload_preset: "ml_default" }).toString() + cloudinary.api_secret));
    formData.append("folder", "nicolasPaillard");
    fetch(`https://api.cloudinary.com/v1_1/dsuvd32up/image/upload`, { method: "POST", body: formData })
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
