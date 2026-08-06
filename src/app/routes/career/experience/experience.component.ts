import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { User } from "@angular/fire/auth";
import { AuthService } from "@app/shared/services/auth.service";
import { Experience } from "@classes/experience";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";

@Component({
  selector: "app-experience",
  imports: [CommonModule, ButtonModule, TagModule],

  templateUrl: "./experience.component.html",
})
export class ExperienceComponent {
  @Input() experience: Experience;
  @Output() onExperienceEdit = new EventEmitter<Experience>();
  @Output() onExperienceRemoved = new EventEmitter<Experience>();
  @Input() right: boolean;
  user: { admin: boolean; user: User } | undefined;

  private authService = inject(AuthService);

  constructor() {
    this.authService.user().subscribe(user => (this.user = user));
  }
}
