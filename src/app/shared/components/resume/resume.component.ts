import { Component, inject, Injector, model, signal } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { CONFIG_CATEGORIES, CONFIG_EXPERIENCES, CONFIG_PROFILES, CONFIG_SECTIONS, CONFIG_SKILLS } from "@app/shared/route.configs";
import { Category } from "@classes/category";
import { Experience } from "@classes/experience";
import { Profile } from "@classes/profile";
import { Section } from "@classes/section";
import { Skill } from "@classes/skill";
import { ButtonModule } from "@openng/optimus-ui/button";
import { CheckboxModule } from "@openng/optimus-ui/checkbox";
import { DialogModule } from "@openng/optimus-ui/dialog";
import { MultiSelectModule } from "@openng/optimus-ui/multiselect";
import { TooltipModule } from "@openng/optimus-ui/tooltip";
import { AnimationService } from "@services/animation.service";
import { CrudService } from "@services/crud.service";
import { PdfmakeService } from "@services/pdfmake.service";
import { firstValueFrom } from "rxjs";

@Component({
  imports: [DialogModule, MultiSelectModule, ButtonModule, FormsModule, CheckboxModule, TooltipModule, ReactiveFormsModule],
  selector: "app-resume",
  styles: ``,
  templateUrl: "./resume.component.html",
})
export class ResumeComponent {
  categories = signal<Category[]>([]);
  experiences = signal<Experience[]>([]);
  isGeneratingCV = signal<boolean>(false);
  isResumeShown = signal<boolean>(false);
  pdfmakeService = inject<PdfmakeService>(PdfmakeService);
  profiles = signal<Profile[]>([]);
  resume = signal<SafeResourceUrl>(inject(DomSanitizer).bypassSecurityTrustResourceUrl(""));
  sections = signal<Section[]>([]);
  selectedExperiences = signal<string[]>([]);
  selectedSkills = signal<string[]>([]);
  skills = signal<Skill[]>([]);
  skillsGroups = signal<{ items: { icon: string; label: string; value: string }[]; label: string; value: string }[]>([]);
  visible = model<boolean>(false);
  private animationService = inject(AnimationService);
  private ready: Promise<void>;
  constructor() {
    const injector = inject(Injector);
    const sectionsService = CrudService.forCollection(injector, CONFIG_SECTIONS);
    const experiencesService = CrudService.forCollection(injector, CONFIG_EXPERIENCES);
    const categoriesService = CrudService.forCollection(injector, CONFIG_CATEGORIES);
    const skillsService = CrudService.forCollection(injector, CONFIG_SKILLS);
    const profileService = CrudService.forCollection(injector, CONFIG_PROFILES);

    this.ready = Promise.all([firstValueFrom(sectionsService.items()), firstValueFrom(experiencesService.items()), firstValueFrom(categoriesService.items()), firstValueFrom(skillsService.items()), firstValueFrom(profileService.items())])
      .then(([sections, experiences, categories, skills, profiles]) => {
        this.sections.set(sections);
        this.experiences.set(experiences);
        this.categories.set(categories);
        this.skills.set(skills);
        this.profiles.set(profiles);
        skills.map(skill => {
          const skillGroup = this.skillsGroups().find(sg => sg.value === skill.category);
          if (skillGroup) {
            const updatedGroup = {
              ...skillGroup,
              items: [...skillGroup.items, { label: skill.title, value: skill.id, icon: skill.icon }],
            };
            this.skillsGroups.update(groups => groups.map(group => (group === skillGroup ? updatedGroup : group)));
          } else {
            const newcat = categories.find(category => category.id === skill.category);
            this.skillsGroups.update(groups => [
              ...groups,
              {
                label: newcat!.title,
                value: newcat!.id,
                items: [{ label: skill.title, value: skill.id, icon: skill.icon }],
              },
            ]);
          }
        });
      })
      .catch(err => console.error(err));
  }
  downloadCV = () => {
    const selectedSkills = this.skills().filter(skill => this.selectedSkills().includes(skill.id));
    const categories = [...new Set(selectedSkills.map(skill => skill.category))];
    const selectedCategories = this.categories().filter(category => categories.includes(category.id));
    const selectedExperiences = this.experiences().filter(experience => this.selectedExperiences().includes(experience.id));
    this.isGeneratingCV.set(true);
    this.visible.set(false);
    this.pdfmakeService
      .generate(this.sections(), selectedExperiences, selectedCategories, selectedSkills, this.profiles()[0])
      .then(res => {
        this.resume.set(res.url);
        this.animationService.animate({
          steps: res.steps,
          callback: () => {
            this.isResumeShown.set(true);
            this.isGeneratingCV.set(false);
          },
        });
      })
      .catch(err => console.error(err));
  };
  isGroupFullySelected(group: { items: { value: string }[] }): boolean {
    return group.items.length > 0 && group.items.every(i => this.selectedSkills().includes(i.value));
  }
  isGroupPartiallySelected(group: { items: { value: string }[] }): boolean {
    const someSelected = group.items.some(i => this.selectedSkills().includes(i.value));
    return someSelected && !this.isGroupFullySelected(group);
  }
  toggleGroup(group: { items: { value: string }[]; label: string }) {
    const groupValues = group.items.map(i => i.value);
    const allSelected = groupValues.every(v => this.selectedSkills().includes(v));
    const updated = allSelected ? this.selectedSkills().filter(v => !groupValues.includes(v)) : [...new Set([...this.selectedSkills(), ...groupValues])];
    this.selectedSkills.set([...updated]);
  }
}
