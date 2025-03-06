import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { AuthService } from "@app/shared/services/auth.service";
import { Experience } from "@services/old/career.service";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-experience",
  imports: [CommonModule, ButtonModule],
  templateUrl: "./experience.component.html",
})
export class ExperienceComponent {
  @Input() experience: Experience;
  @Input() right: boolean;
  @Output() onExperienceRemoved = new EventEmitter<Experience>();
  @Output() onExperienceEdit = new EventEmitter<Experience>();
  user: any = null;
  constructor(private authService: AuthService) {
    this.authService.user().subscribe((user) => (this.user = user));
  }
}
