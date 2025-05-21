import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
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
  @Input() category: Category;
  @Output() onEdit = new EventEmitter<Category>();
  @Output() onRemove = new EventEmitter<Category>();
  @Output() onSkillAdd = new EventEmitter<Category>();
  @Output() onSkillEdit = new EventEmitter<Skill>();
  @Output() onSkillRemove = new EventEmitter<Skill>();
  @Input() skills: Skill[] = [];
  user: { admin: boolean; user: User } | undefined;
  constructor(private authService: AuthService) {
    this.authService.user().subscribe((user) => (this.user = user));
  }
  // ngOnInit() {
  //   getDocs(query(collection(this.db, "data", "skills", "skills"), orderBy("title"), where("category", "==", this.category.id))).then((items) => {
  //     items.docs.forEach((doc) => this.skills.push(new Skill({ ...doc.data(), id: doc.id } as Skill)));
  //   });
  // }
}
