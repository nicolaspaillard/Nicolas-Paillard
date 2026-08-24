import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, Output, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { User } from "@angular/fire/auth";
import { AuthService } from "@app/shared/services/auth.service";
import { Skill } from "@classes/skill";
import { ButtonModule } from "@openng/optimus-ui/button";

@Component({
  selector: "app-skill",
  imports: [CommonModule, ButtonModule],
  templateUrl: "./skill.component.html",
})
export class SkillComponent {
  @Output() onEdit = new EventEmitter<Skill>();
  @Output() onRemove = new EventEmitter<Skill>();
  @Input() right: boolean;
  @Input() skill: Skill;
  user = signal<{ admin: boolean; user: User } | undefined>(undefined);

  constructor() {
    const authService = inject(AuthService);
    authService
      .user()
      .pipe(takeUntilDestroyed())
      .subscribe(user => this.user.set(user ? { ...user } : undefined));
  }
  getDotsString = (value: number): string => {
    const clamped = Math.max(0, Math.min(5, Math.round(value * 2) / 2));
    let result = "";
    for (let i = 0; i < 5; i++) {
      const fillLevel = clamped - i;
      if (fillLevel >= 1) result += "●";
      else if (fillLevel >= 0.5) result += "◐";
      else result += "○";
    }
    return result;
  };
}
