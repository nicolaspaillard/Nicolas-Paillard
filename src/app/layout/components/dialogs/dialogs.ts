import { NgClass, NgTemplateOutlet } from "@angular/common";
import { Component, effect, inject, Injector, signal } from "@angular/core";
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { AnimationService } from "@app/layout/components/animation/animation.service";
import { AuthService } from "@app/layout/services/auth.service";
import { ToastService } from "@app/layout/services/toast.service";
import { Category } from "@classes/category";
import { Experience } from "@classes/experience";
import { Profile } from "@classes/profile";
import { Section } from "@classes/section";
import { Skill } from "@classes/skill";
import { ButtonModule } from "@openng/optimus-ui/button";
import { CheckboxModule } from "@openng/optimus-ui/checkbox";
import { DialogModule } from "@openng/optimus-ui/dialog";
import { InputTextModule } from "@openng/optimus-ui/inputtext";
import { MultiSelectModule } from "@openng/optimus-ui/multiselect";
import { PasswordModule } from "@openng/optimus-ui/password";
import { TooltipModule } from "@openng/optimus-ui/tooltip";
import { CONFIG_CATEGORIES, CONFIG_EXPERIENCES, CONFIG_PROFILES, CONFIG_SECTIONS, CONFIG_SKILLS } from "@routes/route.configs";
import { CrudService } from "@services/crud.service";
import { ResumeService } from "@services/resume.service";
import { firstValueFrom } from "rxjs";
import { DialogsService } from "./dialogs.service";

const PASSWORD_PATTERN = /(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*?[#?!@$ %^&*-])/;

const EMAIL_ERRORS: Record<string, string> = {
  required: "L'email est requis",
  email: "L'email doit être de la forme xxxx@gmail.com",
  inuse: "Cette adresse est déjà utilisée",
  unknown: "Erreur inconnue, voir la console",
};

const PASSWORD_ERRORS: Record<string, string> = {
  required: "Le mot de passe est requis",
  pattern: "Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial",
  minlength: "Le mot de passe doit faire de 8 à 4096 caractères",
  maxlength: "Le mot de passe doit faire de 8 à 4096 caractères",
};

const PASSWORD_REPEAT_ERRORS: Record<string, string> = {
  required: "Le mot de passe est requis",
  notmatching: "Les mots de passe doivent être identiques",
};

const matchFields =
  (a: string, b: string): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    const first = control.get(a)!;
    const second = control.get(b)!;
    if (first.value && second.value && first.value != second.value) second.setErrors({ notmatching: true });
    return null;
  };

@Component({
  selector: "app-dialogs",
  imports: [NgClass, NgTemplateOutlet, FormsModule, ReactiveFormsModule, ButtonModule, CheckboxModule, DialogModule, InputTextModule, MultiSelectModule, PasswordModule, TooltipModule],
  templateUrl: "./dialogs.html",
})
export class Dialogs {
  categories = signal<Category[]>([]);
  readonly dialogsService = inject(DialogsService);
  readonly emailErrors = EMAIL_ERRORS;
  experiences = signal<Experience[]>([]);
  formReset = new FormGroup(
    {
      password: new FormControl("", [control => Validators.required(control), Validators.minLength(8), Validators.maxLength(4096), Validators.pattern(PASSWORD_PATTERN)]),
      passwordrepeat: new FormControl("", [control => Validators.required(control)]),
    },
    { validators: matchFields("password", "passwordrepeat") },
  );
  formSignin = new FormGroup({
    email: new FormControl("", [control => Validators.required(control), control => Validators.email(control)]),
    password: new FormControl("", [control => Validators.required(control)]),
  });
  formSignup = new FormGroup(
    {
      email: new FormControl("", [control => Validators.required(control), control => Validators.email(control)]),
      password: new FormControl("", [control => Validators.required(control), Validators.minLength(8), Validators.maxLength(4096), Validators.pattern(PASSWORD_PATTERN)]),
      passwordrepeat: new FormControl("", [control => Validators.required(control)]),
    },
    { validators: matchFields("password", "passwordrepeat") },
  );
  isGeneratingResume = signal<boolean>(false);
  isResetting = signal<boolean>(false);
  isSending = signal<boolean>(false);
  isSigningIn = signal<boolean>(false);
  isSigningUp = signal<boolean>(false);
  readonly passwordErrors = PASSWORD_ERRORS;
  readonly passwordRepeatErrors = PASSWORD_REPEAT_ERRORS;
  profiles = signal<Profile[]>([]);
  sections = signal<Section[]>([]);
  selectedExperiences = signal<string[]>([]);
  selectedSkills = signal<string[]>([]);
  skills = signal<Skill[]>([]);
  skillsGroups = signal<{ items: { icon: string; label: string; value: string }[]; label: string; value: string }[]>([]);
  protected readonly authService = inject(AuthService);
  protected readonly resumeService = inject(ResumeService);
  private animationService = inject(AnimationService);
  private injector = inject(Injector);
  private isResumeDataLoaded = false;
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  constructor() {
    effect(() => {
      if (this.resumeService.isGeneratorShown() && !this.isResumeDataLoaded) {
        this.isResumeDataLoaded = true;
        void this.loadResumeData();
      }
    });
  }

  downloadResume = async () => {
    const selectedSkills = this.skills().filter(skill => this.selectedSkills().includes(skill.id));
    const categories = [...new Set(selectedSkills.map(skill => skill.category))];
    const selectedCategories = this.categories().filter(category => categories.includes(category.id));
    const selectedExperiences = this.experiences().filter(experience => this.selectedExperiences().includes(experience.id));
    this.isGeneratingResume.set(true);
    this.resumeService.isGeneratorShown.set(false);
    try {
      const { PdfmakeService } = await import("@services/pdfmake.service");
      const res = await this.injector.get(PdfmakeService).generate(this.sections(), selectedExperiences, selectedCategories, selectedSkills, this.profiles()[0]);
      this.resumeService.url.set(res.url);
      this.animationService.animate({
        steps: res.steps,
        callback: () => {
          this.resumeService.isShown.set(true);
          this.isGeneratingResume.set(false);
        },
      });
    } catch (err) {
      console.error(err);
      this.isGeneratingResume.set(false);
    }
  };

  errorMessages = (control: AbstractControl, messages: Record<string, string>): string[] => (this.hasError(control) ? Object.keys(control.errors ?? {}).flatMap(key => messages[key] ?? []) : []);

  hasError = (control: AbstractControl): boolean => control.invalid && (control.dirty || control.touched);

  isGroupFullySelected(group: { items: { value: string }[] }): boolean {
    return group.items.length > 0 && group.items.every(i => this.selectedSkills().includes(i.value));
  }

  isGroupPartiallySelected(group: { items: { value: string }[] }): boolean {
    const someSelected = group.items.some(i => this.selectedSkills().includes(i.value));
    return someSelected && !this.isGroupFullySelected(group);
  }

  reset = async () => {
    this.isResetting.set(true);
    try {
      const result = await this.authService.reset(this.route.snapshot.queryParams["oobCode"] as string, this.formReset.controls.password.value!);
      if (result) {
        this.toastService.success("Réinitialisation réussie", "Votre mot de passe à bien été réinitialisé, vous pouvez à présent vous connecter");
        this.formSignin.controls.password.setValue(this.formReset.controls.password.value);
        this.dialogsService.isResetShown.set(false);
        this.dialogsService.isSigninShown.set(true);
      } else this.toastService.error("Échec de la réinitialisation", "Une erreur est survenue lors de la réinitialisation du mot de passe");
    } catch (err) {
      console.error(err);
    } finally {
      this.isResetting.set(false);
    }
  };

  send = async () => {
    const email = this.formSignin.controls.email;
    if (email.invalid) {
      email.markAsTouched();
      email.setErrors({ required: true });
      return;
    }
    this.isSending.set(true);
    try {
      if (await this.authService.send(email.value!)) this.toastService.success("Envoi effectué", "Le lien de réinitialisation de votre mot de passe vient de vous être envoyé");
      else this.toastService.error("Échec de l'envoi", "Une erreur est survenue lors de l'envoi");
    } catch (err) {
      console.error(err);
    } finally {
      this.isSending.set(false);
    }
  };

  signin = async () => {
    this.isSigningIn.set(true);
    try {
      const valid = await this.authService.signin(this.formSignin.value.email!, this.formSignin.value.password!);
      if (valid) this.dialogsService.isSigninShown.set(false);
      else this.formSignin.setErrors({ invalid: true });
    } catch (err) {
      console.error(err);
    } finally {
      this.isSigningIn.set(false);
    }
  };

  signup = async () => {
    this.isSigningUp.set(true);
    try {
      const result = await this.authService.signup(this.formSignup.value.email!, this.formSignup.value.password!);
      if (typeof result === "boolean") this.dialogsService.isSignupShown.set(false);
      else {
        const control = this.formSignup.controls[result[0]];
        control.markAsTouched();
        control.markAsDirty();
        control.setErrors(result[1]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.isSigningUp.set(false);
    }
  };

  toggleGroup(group: { items: { value: string }[]; label: string }) {
    const groupValues = group.items.map(i => i.value);
    const allSelected = groupValues.every(v => this.selectedSkills().includes(v));
    const updated = allSelected ? this.selectedSkills().filter(v => !groupValues.includes(v)) : [...new Set([...this.selectedSkills(), ...groupValues])];
    this.selectedSkills.set([...updated]);
  }

  private async loadResumeData() {
    try {
      const [sections, experiences, categories, skills, profiles] = await Promise.all([
        firstValueFrom(CrudService.forCollection(this.injector, CONFIG_SECTIONS).items()),
        firstValueFrom(CrudService.forCollection(this.injector, CONFIG_EXPERIENCES).items()),
        firstValueFrom(CrudService.forCollection(this.injector, CONFIG_CATEGORIES).items()),
        firstValueFrom(CrudService.forCollection(this.injector, CONFIG_SKILLS).items()),
        firstValueFrom(CrudService.forCollection(this.injector, CONFIG_PROFILES).items()),
      ]);
      this.sections.set(sections);
      this.experiences.set(experiences);
      this.categories.set(categories);
      this.skills.set(skills);
      this.profiles.set(profiles);
      this.skillsGroups.set(
        categories
          .map(category => ({
            label: category.title,
            value: category.id,
            items: skills.filter(skill => skill.category === category.id).map(skill => ({ label: skill.title, value: skill.id, icon: skill.icon })),
          }))
          .filter(group => group.items.length > 0),
      );
    } catch (err) {
      console.error(err);
    }
  }
}
