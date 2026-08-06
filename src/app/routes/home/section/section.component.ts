import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, input, Output, signal } from "@angular/core";
import { User } from "@angular/fire/auth";
import { AuthService } from "@app/shared/services/auth.service";
import { Section } from "@classes/section";
import { PIcon } from "@primeicons/angular/p-icon";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-section",
  imports: [CommonModule, ButtonModule, PIcon],
  templateUrl: "./section.component.html",
})
export class SectionComponent {
  @Output() onEdit = new EventEmitter<Section>();
  @Output() onRemove = new EventEmitter<Section>();
  section = input.required<Section>();
  user = signal<{ admin: boolean; user: User } | undefined>(undefined);

  private authService = inject(AuthService);

  constructor() {
    this.authService.user().subscribe(user => this.user.set(user));
  }
}
