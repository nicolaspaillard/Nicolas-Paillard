// import { animate, group, query, style, transition, trigger } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { User } from "@angular/fire/auth";
import { AuthGuard, AuthPipe, customClaims, loggedIn } from "@angular/fire/auth-guard";
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { ActivatedRoute, NavigationStart, Params, Route, Router, RouterModule, RouterOutlet, Routes } from "@angular/router";
import { AnimationComponent } from "@components/animation/animation.component";
import { usePreset } from "@openng/optimus-ui-themes";
import { ButtonModule } from "@openng/optimus-ui/button";
import { ConfirmDialogModule } from "@openng/optimus-ui/confirmdialog";
import { DialogModule } from "@openng/optimus-ui/dialog";
import { InputTextModule } from "@openng/optimus-ui/inputtext";
import { PasswordModule } from "@openng/optimus-ui/password";
import { ProgressSpinnerModule } from "@openng/optimus-ui/progressspinner";
import { ToastModule } from "@openng/optimus-ui/toast";
import { ToggleSwitchModule } from "@openng/optimus-ui/toggleswitch";
import { TooltipModule } from "@openng/optimus-ui/tooltip";
import { AnimationService } from "@services/animation.service";
import { AuthService } from "@services/auth.service";
import { DesignerService } from "@services/designer.service";
import { ToastService } from "@services/toast.service";
import { Amber } from "@themes/amber.preset";
import { Matrix } from "@themes/matrix.preset";
import { forkJoin, map, mergeMap, of, pipe } from "rxjs";

const combined: AuthPipe = pipe(
  mergeMap(user => forkJoin([loggedIn(of(user)), customClaims(of(user!))])),
  map(([isLoggedIn, claims]) => (isLoggedIn && claims["admin"] ? true : "")),
);

export const routes: Routes = [
  {
    path: "",
    title: "Nicolas Paillard",
    loadComponent: () => import("@routes/home/home.component").then(m => m.HomeComponent),
    data: { animation: 0 },
  },
  {
    path: "career",
    title: "Carrière",
    loadComponent: () => import("@routes/career/career.component").then(m => m.CareerComponent),
    data: { animation: 1 },
  },
  {
    path: "skills",
    title: "Compétences",
    loadComponent: () => import("@routes/skills/skills.component").then(m => m.SkillsComponent),
    data: { animation: 2 },
  },
  {
    path: "projects",
    title: "Projets",
    loadComponent: () => import("@routes/projects/projects.component").then(m => m.ProjectsComponent),
    data: { animation: 3 },
  },
  {
    path: "designer",
    title: "Designer",
    loadComponent: () => import("@routes/designer/designer.component").then(m => m.DesignerComponent),
    data: { animation: 4 },
  },
  {
    path: "applications",
    title: "Candidatures",
    loadComponent: () => import("@routes/applications/applications.component").then(m => m.ApplicationsComponent),
    canActivate: [AuthGuard],
    data: { animation: 5, authGuardPipe: () => combined },
  },
  {
    path: "profile",
    title: "Profil",
    loadComponent: () => import("@routes/profile/profile.component").then(m => m.ProfileComponent),
    canActivate: [AuthGuard],
    data: { animation: 6, authGuardPipe: () => combined },
  },
  { path: "cv", children: [] },
  { path: "**", redirectTo: "" },
];

@Component({
  selector: "app-root",
  // animations: [trigger("routeAnimations", [transition(":increment", slideTo("right")), transition(":decrement", slideTo("left"))])],
  imports: [CommonModule, RouterModule, RouterOutlet, TooltipModule, ReactiveFormsModule, ButtonModule, DialogModule, ToastModule, ConfirmDialogModule, ToggleSwitchModule, InputTextModule, PasswordModule, AnimationComponent, ProgressSpinnerModule],
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  enableMatrix = false;
  formReset = new FormGroup(
    {
      password: new FormControl("", [control => Validators.required(control), Validators.minLength(8), Validators.maxLength(4096), Validators.pattern(/(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*?[#?!@$ %^&*-])/)]),
      passwordrepeat: new FormControl("", [control => Validators.required(control)]),
    },
    { validators: CustomValidators.matchFields("password", "passwordrepeat") },
  );
  formSignin = new FormGroup({
    email: new FormControl("", [control => Validators.required(control), Validators.email]),
    password: new FormControl("", [control => Validators.required(control)]),
  });
  formSignup = new FormGroup(
    {
      email: new FormControl("", [control => Validators.required(control), Validators.email]),
      password: new FormControl("", [control => Validators.required(control), Validators.minLength(8), Validators.maxLength(4096), Validators.pattern(/(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*?[#?!@$ %^&*-])/)]),
      passwordrepeat: new FormControl("", [control => Validators.required(control)]),
    },
    { validators: CustomValidators.matchFields("password", "passwordrepeat") },
  );
  isResetShown = false;
  isResetting = false;
  isResumeShown = false;
  isSending = false;
  isSigninShown = false;
  isSigningIn = false;
  isSigningUp = false;
  isSignupShown = false;
  isTransitioning = false;
  params: Params = {};
  resume: SafeUrl;
  routes: Route[] = routes.filter(route => route.path && route.data);
  user = signal<{ admin: boolean; user: User } | undefined>(undefined);
  private animationService = inject(AnimationService);

  private authService = inject(AuthService);
  private designerService = inject(DesignerService);
  private interval: NodeJS.Timeout;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private toastService = inject(ToastService);
  constructor() {
    this.resume = this.sanitizer.bypassSecurityTrustResourceUrl("");
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe(params => (this.params = params));
    switch (location.pathname.split("/").pop()) {
      case "cv":
        this.downloadCV();
        break;
      case "login":
        this.isSigninShown = true;
        break;
      case "reset":
        this.isResetShown = true;
        break;
    }
    this.authService
      .user()
      .pipe(takeUntilDestroyed())
      .subscribe(user => this.user.set(user ? { ...user } : undefined));
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        // this.isTransitioning = true;
        document.getElementById("router-container")!.scrollTop = 0;
        // setTimeout(() => (this.isTransitioning = false), 600);
      }
      // if (event instanceof NavigationEnd) {
      // }
    });
  }
  animate = () => {
    clearInterval(this.interval);
    if (this.enableMatrix) {
      const canvas: HTMLCanvasElement = document.querySelector("canvas")!;
      const context: CanvasRenderingContext2D = canvas.getContext("2d")!;
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
    } else {
      if (document.querySelectorAll("#animation>span").length) return;
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
        document.getElementById("animation")!.append(shape);
      }
    }
  };
  applyPreset = () => {
    usePreset(this.enableMatrix ? Matrix : Amber);
    this.animate();
  };
  downloadCV = () => {
    this.designerService.export({ editing: false }).then(res => {
      this.resume = this.sanitizer.bypassSecurityTrustResourceUrl(res.url);
      if (res.steps.length)
        this.animationService.animate({
          steps: res.steps,
          callback: () => (this.isResumeShown = true),
        });
    });
  };
  ngOnInit() {
    this.animate();
  }
  prepareRoute = (outlet: RouterOutlet) => outlet && outlet.activatedRouteData && outlet.activatedRouteData["animation"];
  reset = () => {
    this.isResetting = true;
    this.authService.reset(this.params["oobCode"], this.formReset.controls.password.value!).then(result => {
      this.isResetting = false;
      if (result) {
        this.toastService.success("Réinitialisation réussie", "Votre mot de passe à bien été réinitialisé, vous pouvez à présent vous connecter");
        this.formSignin.controls.password.setValue(this.formReset.controls.password.value);
        this.isResetShown = false;
        this.isSigninShown = true;
      } else this.toastService.error("Échec de la réinitialisation", "Une erreur est survenue lors de la réinitialisation du mot de passe");
    });
  };
  send = () => {
    if (!this.formSignin.controls.email.invalid) {
      this.isSending = true;
      this.authService.send(this.formSignin.controls.email.value!).then(result => {
        this.isSending = false;
        if (result) this.toastService.success("Envoi effectué", `Le lien de réinitialisation de votre mot de passe vient de vous être envoyé`);
        else this.toastService.error("Échec de l'envoi", `Une erreur est survenue lors de l'envoi`);
      });
    } else {
      this.formSignin.controls.email.markAsTouched();
      this.formSignin.controls.email.setErrors({ required: true });
    }
  };
  signin = () => {
    this.isSigningIn = true;
    this.authService.signin(this.formSignin.value.email!, this.formSignin.value.password!).then((valid: boolean) => {
      if (!valid) this.formSignin.setErrors({ invalid: true });
      else this.isSigninShown = false;
      this.isSigningIn = false;
    });
  };
  signout = () => this.authService.signout().then(() => this.router.navigate([""]));
  signup = () => {
    this.isSigningUp = true;
    this.authService.signup(this.formSignup.value.email!, this.formSignup.value.password!).then(result => {
      if (result === true) this.isSignupShown = false;
      else {
        this.formSignup.controls[result[0]].markAsTouched();
        this.formSignup.controls[result[0]].markAsDirty();
        this.formSignup.controls[result[0]].setErrors(result[1]);
      }
      this.isSigningUp = false;
    });
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
