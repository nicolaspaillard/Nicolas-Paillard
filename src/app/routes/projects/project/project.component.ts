import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, input, Output, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { User } from "@angular/fire/auth";
import { RouterLink } from "@angular/router";
import { AuthService } from "@app/shared/services/auth.service";
import { Project } from "@classes/project";
import { Cloudinary } from "@cloudinary/url-gen";
import { scale } from "@cloudinary/url-gen/actions/resize";
import { AccordionModule } from "@openng/optimus-ui/accordion";
import { ButtonModule } from "@openng/optimus-ui/button";
import { CarouselModule } from "@openng/optimus-ui/carousel";
import { ImageModule } from "@openng/optimus-ui/image";

@Component({
  selector: "app-project",
  imports: [CommonModule, ButtonModule, CarouselModule, ImageModule, AccordionModule, RouterLink],
  templateUrl: "./project.component.html",
})
export class ProjectComponent {
  @Output() onProjectEdit = new EventEmitter<Project>();
  @Output() onProjectRemoved = new EventEmitter<Project>();
  cld: Cloudinary = new Cloudinary({ cloud: { cloudName: "dsuvd32up" } });
  experience = input.required<{ id: string; title: string } | undefined>();
  project = input.required<Project>();
  skills = input.required<
    {
      id: string;
      items: { icon: string; id: string; title: string }[];
      title: string;
    }[]
  >();
  user = signal<{ admin: boolean; user: User } | undefined>(undefined);
  constructor() {
    const authService = inject(AuthService);
    authService
      .user()
      .pipe(takeUntilDestroyed())
      .subscribe(user => this.user.set(user ? { ...user } : undefined));
  }
  // prettier-ignore
  getURL = (image: string, thumbnail = true) => this.cld.image("nicolasPaillard/" + image).resize(thumbnail?(scale().height(500)):(scale().width(1500))).toURL();
}
