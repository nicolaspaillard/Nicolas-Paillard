import { Component, effect, inject, Injector, signal } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { CONFIG_SKILLS } from "@app/shared/route.configs";
import { Category } from "@classes/category";
import { formSkill, Skill } from "@classes/skill";
import { CrudComponent } from "@components/crud.component";
import { ButtonModule } from "@openng/optimus-ui/button";
import { DialogModule } from "@openng/optimus-ui/dialog";
import { InputNumberModule } from "@openng/optimus-ui/inputnumber";
import { InputTextModule } from "@openng/optimus-ui/inputtext";
import { SelectModule } from "@openng/optimus-ui/select";
import { AuthService } from "@services/auth.service";
import { ConfirmService } from "@services/confirm.service";
import { CrudService } from "@services/crud.service";
import { CategoryComponent } from "./category/category.component";

@Component({
  selector: "app-skills",
  imports: [ReactiveFormsModule, CategoryComponent, ButtonModule, DialogModule, InputTextModule, InputNumberModule, SelectModule, InputNumberModule],
  templateUrl: "./skills.component.html",
})
export class SkillsComponent extends CrudComponent<Category> {
  devIcons: string[] = [];

  private async loadDevIcons(): Promise<void> {
    try {
      const response = await fetch("/assets/dev-icons.json", { cache: "force-cache" });
      if (!response.ok) throw new Error(`Failed to load icons (${response.status})`);
      this.devIcons = (await response.json()) as string[];
    } catch (error) {
      console.error("Unable to load developer icons", error);
    }
  }

  formSkill: FormGroup = formSkill;
  isEditingSkill = signal(false);
  isShownSkill = signal(false);
  skills = signal<Skill[]>([]);
  private crudServiceSkills = inject<CrudService<Skill>>(CrudService);

  constructor() {
    const crudService = inject<CrudService<Category>>(CrudService);
    const authService = inject(AuthService);
    const confirmService = inject(ConfirmService);

    super(crudService, authService, confirmService);
    effect(() => {
      if (this.isShownSkill()) void this.loadDevIcons();
    });
    this.crudServiceSkills = CrudService.forCollection(inject(Injector), CONFIG_SKILLS);
    this.crudServiceSkills.items().subscribe(skills => this.skills.set([...skills]));
  }
  // TODO override create to implement rank
  createCategory = async () =>
    !this.items().some(category => category.id === formSkill.get("category")?.value)
      ? formSkill.get("category")?.setValue(
          await this.create({
            id: "",
            rank: 0,
            title: formSkill.get("category")?.value as string,
          }),
        )
      : null;
  createSkill = async () => this.createCategory().then(() => this.crudServiceSkills.create(formSkill.value as Skill));
  deleteSkill = (skill: Skill) =>
    this.confirmService.confirm({
      message: `Voulez-vous vraiment supprimer ${skill.title}`,
      accept: () => this.crudServiceSkills.delete(skill),
    });
  filter = (category: Category) => (skill: Skill) => skill.category === category.id;
  updateSkill = async () => this.createCategory().then(() => this.crudServiceSkills.update(formSkill.value as Skill));
}
