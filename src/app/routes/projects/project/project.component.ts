import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, input, Output } from "@angular/core";
import { User } from "@angular/fire/auth";
import { AuthService } from "@app/shared/services/auth.service";
import { Project } from "@classes/project";
import { Cloudinary } from "@cloudinary/url-gen";
import { scale } from "@cloudinary/url-gen/actions/resize";
import { ButtonModule } from "primeng/button";
import { CarouselModule } from "primeng/carousel";
import { ImageModule } from "primeng/image";

@Component({
  selector: "app-project",
  imports: [CommonModule, ButtonModule, CarouselModule, ImageModule],

  templateUrl: "./project.component.html",
})
export class ProjectComponent {
  @Output() onProjectEdit = new EventEmitter<Project>();
  @Output() onProjectRemoved = new EventEmitter<Project>();
  cld: Cloudinary = new Cloudinary({
    cloud: {
      cloudName: "dsuvd32up",
    },
  });
  project = input.required<Project>();
  user: { admin: boolean; user: User } | undefined;

  private authService = inject(AuthService);

  constructor() {
    this.authService.user().subscribe(user => (this.user = user));
  }
  // prettier-ignore
  getURL = (image: string, thumbnail = true) => this.cld.image("nicolasPaillard/" + image).resize(thumbnail?(scale().height(500)):(scale().width(1500))).toURL();
}
