import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { User } from "@angular/fire/auth";
import { ReactiveFormsModule } from "@angular/forms";
import { AuthService } from "@app/shared/services/auth.service";
import { Skill } from "@classes/skill";
import { ButtonModule } from "primeng/button";
import { SkillComponent } from "./skill/skill.component";

@Component({
  selector: "app-category",
  imports: [CommonModule, ReactiveFormsModule, SkillComponent, ButtonModule],
  templateUrl: "./category.component.html",
})
export class CategoryComponent {
  @Input() title: string;
  @Input() skills: Skill[];
  @Output() onCategoryRemoved = new EventEmitter<string>();
  @Output() onCategoryEdit = new EventEmitter<string>();
  @Output() onSkillRemoved = new EventEmitter<Skill>();
  @Output() onSkillEdit = new EventEmitter<Skill>();
  user: { user: User; admin: boolean } | undefined;
  constructor(private authService: AuthService) {
    this.authService.user().subscribe((user) => (this.user = user));
  }
}
