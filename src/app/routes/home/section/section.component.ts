import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { AuthService } from "@app/layout/services/auth.service";
import { Section } from "@classes/section";
import { ButtonModule } from "@openng/optimus-ui/button";

@Component({
  selector: "app-section",
  imports: [ButtonModule],
  templateUrl: "./section.component.html",
})
export class SectionComponent {
  @Output() edit = new EventEmitter<Section>();
  @Output() remove = new EventEmitter<Section>();
  @Input() section: Section;
  user = inject(AuthService).user;
}
