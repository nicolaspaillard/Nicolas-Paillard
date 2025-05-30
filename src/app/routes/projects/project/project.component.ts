import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { User } from "@angular/fire/auth";
import { AuthService } from "@app/shared/services/auth.service";
import { Project } from "@classes/project";
import { Cloudinary } from "@cloudinary/url-gen";
import { scale } from "@cloudinary/url-gen/actions/resize";
import { ButtonModule } from "primeng/button";
import { CarouselModule } from "primeng/carousel";
import { ImageModule } from "primeng/image";
import { cloudinaryConfig } from "src/main";

@Component({
  selector: "app-project",
  imports: [CommonModule, ButtonModule, CarouselModule, ImageModule],
  templateUrl: "./project.component.html",
})
export class ProjectComponent {
  @Input() project: Project;
  @Output() onProjectRemoved = new EventEmitter<Project>();
  @Output() onProjectEdit = new EventEmitter<Project>();
  cld: Cloudinary = new Cloudinary({
    cloud: {
      cloudName: cloudinaryConfig.cloudName,
    },
  });
  user: { user: User; admin: boolean } | undefined;
  constructor(private authService: AuthService) {
    this.authService.user().subscribe((user) => (this.user = user));
  }
  // prettier-ignore
  getURL = (image: string, thumbnail: boolean = true) => this.cld.image("nicolasPaillard/" + image).resize(thumbnail?(scale().height(500)):(scale().width(1500))).toURL();
}
