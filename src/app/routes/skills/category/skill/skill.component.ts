import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { AuthService } from "@app/layout/services/auth.service";
import { Skill } from "@classes/skill";
import { ButtonModule } from "@openng/optimus-ui/button";

@Component({
  selector: "app-skill",
  imports: [CommonModule, ButtonModule],
  templateUrl: "./skill.component.html",
})
export class SkillComponent {
  @Output() edit = new EventEmitter<Skill>();
  @Output() remove = new EventEmitter<Skill>();
  @Input() right: boolean;
  @Input() skill: Skill;
  readonly user = inject(AuthService).user;
}
