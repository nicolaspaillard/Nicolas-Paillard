import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, input, Output, signal } from "@angular/core";
import { User } from "@angular/fire/auth";
import { ReactiveFormsModule } from "@angular/forms";
import { AuthService } from "@app/shared/services/auth.service";
import { Category } from "@classes/category";
import { Skill } from "@classes/skill";
import { ButtonModule } from "primeng/button";
import { SkillComponent } from "./skill/skill.component";

@Component({
  selector: "app-category",
  imports: [CommonModule, ReactiveFormsModule, SkillComponent, ButtonModule],
  templateUrl: "./category.component.html",
})
export class CategoryComponent {
  @Output() onEdit = new EventEmitter<Category>();
  @Output() onRemove = new EventEmitter<Category>();
  @Output() onSkillAdd = new EventEmitter<Category>();
  @Output() onSkillEdit = new EventEmitter<Skill>();
  @Output() onSkillRemove = new EventEmitter<Skill>();
  category = input.required<Category>();
  skills = input.required<Skill[]>();
  user = signal<{ admin: boolean; user: User } | undefined>(undefined);

  constructor() {
    const authService = inject(AuthService);
    authService.user().subscribe(user => this.user.set(user ? { ...user } : undefined));
  }
}
