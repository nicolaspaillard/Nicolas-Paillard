import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { AuthService } from "@app/shared/services/auth.service";
import { Skill } from "@services/old/skills.service";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-skill",
  imports: [CommonModule, ButtonModule],
  templateUrl: "./skill.component.html",
})
export class SkillComponent {
  @Input() skill: Skill;
  @Input() right: boolean;
  @Output() onSkillRemoved = new EventEmitter<Skill>();
  @Output() onSkillEdit = new EventEmitter<Skill>();
  bootstrapDefs =
    '<defs><linearGradient id="a" x1="76.079" x2="523.48" y1="10.798" y2="365.95" gradientTransform="translate(1.11 14.613) scale(.24566)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#9013fe"></stop><stop offset="1" stop-color="#6610f2"></stop></linearGradient><linearGradient id="b" x1="193.51" x2="293.51" y1="109.74" y2="278.87" gradientTransform="translate(0 52)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"></stop><stop offset="1" stop-color="#f1e5fc"></stop></linearGradient><filter id="c" width="197" height="249" x="161.9" y="135.46" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="4"></feOffset><feGaussianBlur stdDeviation="8"></feGaussianBlur><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"></feColorMatrix><feBlend in2="BackgroundImageFix" result="effect1_dropShadow"></feBlend><feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape"></feBlend></filter></defs>';
  user: any = null;
  constructor(private authService: AuthService) {
    this.authService.user().subscribe((user) => (this.user = user));
  }
}
