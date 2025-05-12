import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
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
  @Input() right: boolean;
  @Output() onExperienceRemoved = new EventEmitter<Experience>();
  @Output() onExperienceEdit = new EventEmitter<Experience>();
  user: { user: User; admin: boolean } | undefined;
  constructor(private authService: AuthService) {
    this.authService.user().subscribe((user) => (this.user = user));
  }
}
