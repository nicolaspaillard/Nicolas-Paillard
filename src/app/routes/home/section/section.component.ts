import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { User } from "@angular/fire/auth";
import { AuthService } from "@app/shared/services/auth.service";
import { Section } from "@classes/section";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-section",
  imports: [CommonModule, ButtonModule],
  templateUrl: "./section.component.html",
})
export class SectionComponent {
  @Input() section: Section;
  @Output() onSectionRemoved = new EventEmitter<Section>();
  @Output() onSectionEdit = new EventEmitter<Section>();
  user: { user: User; admin: boolean } | undefined;
  constructor(private authService: AuthService) {
    this.authService.user().subscribe((user) => (this.user = user));
  }
}
