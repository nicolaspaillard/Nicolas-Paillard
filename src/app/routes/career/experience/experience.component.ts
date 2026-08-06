import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { User } from "@angular/fire/auth";
import { AuthService } from "@app/shared/services/auth.service";
import { Experience } from "@classes/experience";
import { ButtonModule } from "@openng/optimus-ui/button";
import { TagModule } from "@openng/optimus-ui/tag";

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
  user = signal<{ admin: boolean; user: User } | undefined>(undefined);
  constructor(private authService: AuthService) {
    this.authService
      .user()
      .pipe(takeUntilDestroyed())
      .subscribe(user => this.user.set(user ? { ...user } : undefined));
  }
}
