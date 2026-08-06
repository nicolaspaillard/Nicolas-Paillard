import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { User } from "@angular/fire/auth";
import { AuthService } from "@app/shared/services/auth.service";
import { Project } from "@classes/project";
import { Cloudinary } from "@cloudinary/url-gen";
import { scale } from "@cloudinary/url-gen/actions/resize";
import { ButtonModule } from "@openng/optimus-ui/button";
import { CarouselModule } from "@openng/optimus-ui/carousel";
import { ImageModule } from "@openng/optimus-ui/image";

@Component({
  selector: "app-project",
  imports: [CommonModule, ButtonModule, CarouselModule, ImageModule],
  templateUrl: "./project.component.html",
})
export class ProjectComponent {
  @Output() onProjectEdit = new EventEmitter<Project>();
  @Output() onProjectRemoved = new EventEmitter<Project>();
  @Input() project: Project;
  cld: Cloudinary = new Cloudinary({
    cloud: {
      cloudName: "dsuvd32up",
    },
  });
  user = signal<{ admin: boolean; user: User } | undefined>(undefined);
  constructor(private authService: AuthService) {
    this.authService
      .user()
      .pipe(takeUntilDestroyed())
      .subscribe(user => this.user.set(user ? { ...user } : undefined));
  }
  // prettier-ignore
  getURL = (image: string, thumbnail: boolean = true) => this.cld.image("nicolasPaillard/" + image).resize(thumbnail?(scale().height(500)):(scale().width(1500))).toURL();
}
