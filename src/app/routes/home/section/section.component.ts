import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { AuthService } from "@app/shared/services/auth.service";
import { Section } from "@app/shared/services/sections.service";
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
  user: any = null;
  constructor(private authService: AuthService) {
    this.authService.user().subscribe((user) => (this.user = user));
  }
}
