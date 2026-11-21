import { NgOptimizedImage } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ToastService } from "@app/layout/services/toast.service";
import { Profile } from "@classes/profile";
import { Crud } from "@components/crud.component";
import { sha1 } from "@helpers/sha1";
import { ButtonModule } from "@openng/optimus-ui/button";
import { FileUpload, FileUploadHandlerEvent } from "@openng/optimus-ui/fileupload";
import { InputTextModule } from "@openng/optimus-ui/inputtext";

@Component({
  selector: "app-profile",
  imports: [FileUpload, ReactiveFormsModule, ButtonModule, NgOptimizedImage, InputTextModule],
  templateUrl: "./profile.component.html",
  styles: ``,
})
export class ProfileComponent extends Crud<Profile> {
  isUpdating = false;
  private toastService = inject(ToastService);

  constructor() {
    super();
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
  updatePhoto = async (event: FileUploadHandlerEvent): Promise<void> => {
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
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/dsuvd32up/image/upload`, { method: "POST", body: formData });
      const data: unknown = JSON.parse(await response.text()) as unknown;
      if (typeof data === "object" && data !== null && "public_id" in data && typeof data.public_id === "string") {
        return;
      }
      console.error(data);
    } catch (error) {
      console.error(error);
    }
  };
}
