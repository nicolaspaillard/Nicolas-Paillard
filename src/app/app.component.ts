// import { animate, group, query, style, transition, trigger } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { User } from "@angular/fire/auth";
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ActivatedRoute, Route, Router, RouterModule, RouterOutlet } from "@angular/router";
import { routes } from "@app/app.routes";
import { AnimationComponent } from "@components/animation/animation.component";
import { ResumeComponent } from "@components/resume/resume.component";
import { usePreset } from "@openng/optimus-ui-themes";
import { ButtonModule } from "@openng/optimus-ui/button";
import { ConfirmDialogModule } from "@openng/optimus-ui/confirmdialog";
import { DialogModule } from "@openng/optimus-ui/dialog";
import { InputTextModule } from "@openng/optimus-ui/inputtext";
import { PasswordModule } from "@openng/optimus-ui/password";
import { ProgressSpinnerModule } from "@openng/optimus-ui/progressspinner";
import { SplitButtonModule } from "@openng/optimus-ui/splitbutton";
import { ToastModule } from "@openng/optimus-ui/toast";
import { ToggleSwitchModule } from "@openng/optimus-ui/toggleswitch";
import { TooltipModule } from "@openng/optimus-ui/tooltip";
import { AnimationService } from "@services/animation.service";
import { AuthService } from "@services/auth.service";
import { PdfmakeService } from "@services/pdfmake.service";
import { ToastService } from "@services/toast.service";
import { Amber } from "@themes/amber.preset";
import { Matrix } from "@themes/matrix.preset";

// TODO update content with experiences on projects

@Component({
  selector: "app-root",
  // animations: [trigger("routeAnimations", [transition(":increment", slideTo("right")), transition(":decrement", slideTo("left"))])],
  imports: [CommonModule, RouterModule, RouterOutlet, SplitButtonModule, TooltipModule, ReactiveFormsModule, ButtonModule, DialogModule, ToastModule, ConfirmDialogModule, ToggleSwitchModule, InputTextModule, PasswordModule, AnimationComponent, ProgressSpinnerModule, ResumeComponent],
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  cvButtonItems = [{ label: "Customiser", icon: "pi pi-pen-to-square", command: () => this.isResumeGeneratorShown.set(true) }];
  enableMatrix = signal<boolean>(false);
  formReset = new FormGroup(
    {
      password: new FormControl("", [control => Validators.required(control), Validators.minLength(8), Validators.maxLength(4096), Validators.pattern(/(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*?[#?!@$ %^&*-])/)]),
      passwordrepeat: new FormControl("", [control => Validators.required(control)]),
    },
    { validators: CustomValidators.matchFields("password", "passwordrepeat") },
  );
  formSignin = new FormGroup({
    email: new FormControl("", [control => Validators.required(control), control => Validators.email(control)]),
    password: new FormControl("", [control => Validators.required(control)]),
  });
  formSignup = new FormGroup(
    {
      email: new FormControl("", [control => Validators.required(control), control => Validators.email(control)]),
      password: new FormControl("", [control => Validators.required(control), Validators.minLength(8), Validators.maxLength(4096), Validators.pattern(/(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*?[#?!@$ %^&*-])/)]),
      passwordrepeat: new FormControl("", [control => Validators.required(control)]),
    },
    { validators: CustomValidators.matchFields("password", "passwordrepeat") },
  );
  isGeneratingCV = signal<boolean>(false);
  isResetShown = signal<boolean>(false);
  isResetting = signal<boolean>(false);
  isResumeGeneratorShown = signal<boolean>(false);
  isResumeShown = signal<boolean>(false);
  isSending = signal<boolean>(false);
  isSigninShown = signal<boolean>(false);
  isSigningIn = signal<boolean>(false);
  isSigningUp = signal<boolean>(false);
  isSignupShown = signal<boolean>(false);
  resume = signal<SafeResourceUrl>(inject(DomSanitizer).bypassSecurityTrustResourceUrl(""));
  routes: Route[] = routes.filter(route => route.path && route.data);
  user = signal<{ admin: boolean; user: User } | undefined>(undefined);
  private animationService = inject(AnimationService);
  private authService = inject(AuthService);
  private interval: ReturnType<typeof setInterval> | undefined;
  private pdfmakeService = inject(PdfmakeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);
  constructor() {
    switch (location.pathname.split("/").pop()) {
      case "cv":
        this.downloadCV();
        break;
      case "login":
        this.isSigninShown.set(true);
        break;
      case "reset":
        this.isResetShown.set(true);
        break;
    }
    this.authService
      .user()
      .pipe(takeUntilDestroyed())
      .subscribe(user => this.user.set(user ? { ...user } : undefined));
  }
  clearMatrixAnimation = () => {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  };
  clearDecorativeShapes = () => {
    const container = document.getElementById("animation");
    if (container) container.replaceChildren();
  };
  animate = () => {
    this.clearMatrixAnimation();
    if (this.enableMatrix()) {
      const canvas = document.querySelector("#matrix") as HTMLCanvasElement | null;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      this.clearDecorativeShapes();
      context.reset();
      const drops: number[] = [];
      const fontSize = 10;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      for (let i = 0; i < canvas.width / fontSize; i++) drops[i] = canvas.height + 1;

      this.interval = setInterval(() => {
        const letters: string[] = "ABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZ".split("");
        context.fillStyle = "rgba(0, 0, 0, .18)";
        context.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < drops.length; i++) {
          const text = letters[Math.floor(Math.random() * letters.length)];
          context.fillStyle = "rgba(0,200,0,0.8)";
          context.fillText(text, i * fontSize, drops[i] * fontSize);
          drops[i]++;
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.99) drops[i] = 0;
        }
      }, 60);
      return;
    }

    const animationRoot = document.getElementById("animation");
    if (!animationRoot || animationRoot.querySelectorAll("span").length) return;

    for (let i = 0; i < 15; i++) {
      const shape = document.createElement("span");
      shape.classList.add("border-primary", "border", "border-2", "absolute", "animate-slide", "rounded-lg");
      shape.style.animationDelay = Math.random() * 3 + "s";
      shape.style.animationDuration = Math.random() * 4 + 4 + "s";
      shape.style.setProperty("--slide-distance", (Math.random() < 0.5 ? "" : "-") + Math.random() * 100 + 50 + "px");
      shape.style.width = Math.random() * 250 + 50 + "px";
      shape.style.height = Math.random() * 250 + 50 + "px";
      shape.style.left = Math.random() * 100 + "%";
      shape.style.top = Math.random() * 100 + "%";
      shape.style.opacity = Math.random() * 0.4 + 0.1 + "";
      animationRoot.append(shape);
    }
  };
  applyPreset = () => {
    usePreset(this.enableMatrix() ? Matrix : Amber);
    this.animate();
  };
  downloadCV = () => {
    this.isGeneratingCV.set(true);
    this.pdfmakeService
      .generate()
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
  ngOnInit() {
    // Keep the app shell lightweight on first render. The decorative animation only starts when the user activates it.
  }

  ngOnDestroy() {
    this.clearMatrixAnimation();
    this.clearDecorativeShapes();
  }
  reset = () => {
    this.isResetting.set(true);
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe(params => {
      this.authService
        .reset(params["oobCode"] as string, this.formReset.controls.password.value!)
        .then(result => {
          this.isResetting.set(false);
          if (result) {
            this.toastService.success("Réinitialisation réussie", "Votre mot de passe à bien été réinitialisé, vous pouvez à présent vous connecter");
            this.formSignin.controls.password.setValue(this.formReset.controls.password.value);
            this.isResetShown.set(false);
            this.isSigninShown.set(true);
          } else this.toastService.error("Échec de la réinitialisation", "Une erreur est survenue lors de la réinitialisation du mot de passe");
        })
        .catch(err => console.error(err));
    });
  };
  send = () => {
    if (!this.formSignin.controls.email.invalid) {
      this.isSending.set(true);
      this.authService
        .send(this.formSignin.controls.email.value!)
        .then(result => {
          this.isSending.set(false);
          if (result) this.toastService.success("Envoi effectué", `Le lien de réinitialisation de votre mot de passe vient de vous être envoyé`);
          else this.toastService.error("Échec de l'envoi", `Une erreur est survenue lors de l'envoi`);
        })
        .catch(err => console.error(err));
    } else {
      this.formSignin.controls.email.markAsTouched();
      this.formSignin.controls.email.setErrors({ required: true });
    }
  };
  signin = () => {
    this.isSigningIn.set(true);
    this.authService
      .signin(this.formSignin.value.email!, this.formSignin.value.password!)
      .then((valid: boolean) => {
        if (!valid) this.formSignin.setErrors({ invalid: true });
        else this.isSigninShown.set(false);
        this.isSigningIn.set(false);
      })
      .catch(err => console.error(err));
  };
  signout = () => this.authService.signout().then(() => this.router.navigate([""]));
  signup = () => {
    this.isSigningUp.set(true);
    this.authService
      .signup(this.formSignup.value.email!, this.formSignup.value.password!)
      .then(result => {
        if (typeof result === "boolean") this.isSignupShown.set(false);
        else {
          this.formSignup.controls[result[0]].markAsTouched();
          this.formSignup.controls[result[0]].markAsDirty();
          this.formSignup.controls[result[0]].setErrors(result[1]);
        }
        this.isSigningUp.set(false);
      })
      .catch(err => console.error(err));
  };
}

class CustomValidators {
  static matchFields(a: string, b: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.get(a)!.value && control.get(b)!.value && control.get(a)!.value != control.get(b)!.value) control.get(b)!.setErrors({ notmatching: true });
      return null;
    };
  }
}
