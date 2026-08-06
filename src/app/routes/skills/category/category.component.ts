import { Component, EventEmitter, inject, Input, Output, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { User } from "@angular/fire/auth";
import { ReactiveFormsModule } from "@angular/forms";
import { AuthService } from "@app/shared/services/auth.service";
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
  @Input() category: Category;
  @Output() onEdit = new EventEmitter<Category>();
  @Output() onRemove = new EventEmitter<Category>();
  @Output() onSkillAdd = new EventEmitter<Category>();
  @Output() onSkillEdit = new EventEmitter<Skill>();
  @Output() onSkillRemove = new EventEmitter<Skill>();
  @Input() skills: Skill[] = [];
  user = signal<{ admin: boolean; user: User } | undefined>(undefined);
  private authService = inject(AuthService);

  constructor() {
    this.authService
      .user()
      .pipe(takeUntilDestroyed())
      .subscribe(user => this.user.set(user ? { ...user } : undefined));
  }
  // ngOnInit() {
  //   getDocs(query(collection(this.db, "data", "skills", "skills"), orderBy("title"), where("category", "==", this.category.id))).then((items) => {
  //     items().docs.forEach((doc) => this.skills.push(new Skill({ ...doc.data(), id: doc.id } as Skill)));
  //   });
  // }
}
