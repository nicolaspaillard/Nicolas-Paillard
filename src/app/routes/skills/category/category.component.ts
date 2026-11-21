import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { AuthService } from "@app/layout/services/auth.service";
import { Category } from "@classes/category";
import { Skill } from "@classes/skill";
import { ButtonModule } from "@openng/optimus-ui/button";
import { SkillComponent } from "./skill/skill.component";

@Component({
  selector: "app-category",
  imports: [ReactiveFormsModule, SkillComponent, ButtonModule],
  templateUrl: "./category.component.html",
})
export class CategoryComponent {
  @Output() addSkill = new EventEmitter<Category>();
  @Input() category: Category;
  @Output() edit = new EventEmitter<Category>();
  @Output() editSkill = new EventEmitter<Skill>();
  @Output() remove = new EventEmitter<Category>();
  @Output() removeSkill = new EventEmitter<Skill>();
  @Input() skills: Skill[] = [];
  readonly user = inject(AuthService).user;

  // ngOnInit() {
  //   getDocs(query(collection(this.db, "data", "skills", "skills"), orderBy("title"), where("category", "==", this.category.id))).then((items) => {
  //     items().docs.forEach((doc) => this.skills.push(new Skill({ ...doc.data(), id: doc.id } as Skill)));
  //   });
  // }
}
