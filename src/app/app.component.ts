import { animate, group, query, style, transition, trigger } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { User } from "@angular/fire/auth";
import { AuthGuard, AuthPipe, customClaims, loggedIn } from "@angular/fire/auth-guard";
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { ActivatedRoute, NavigationEnd, NavigationStart, Route, Router, RouterModule, RouterOutlet, Routes } from "@angular/router";
import { AnimationComponent } from "@components/animation/animation.component";
import { usePreset } from "@primeuix/themes";
import { AnimationService } from "@services/animation.service";
import { AuthService } from "@services/auth.service";
import { DesignerService } from "@services/designer.service";
import { ToastService } from "@services/toast.service";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { ToastModule } from "primeng/toast";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { TooltipModule } from "primeng/tooltip";
import { forkJoin, map, mergeMap, of, pipe } from "rxjs";
import { Amber } from "src/themes/amber.preset";
import { Matrix } from "src/themes/matrix.preset";

const combined: AuthPipe = pipe(
  mergeMap(user => forkJoin([loggedIn(of(user)), customClaims(of(user!))])),
  map(([isLoggedIn, claims]) => (isLoggedIn && claims["admin"] ? true : "")),
);

export const routes: Routes = [
  { path: "", title: "Nicolas Paillard", loadComponent: () => import("@routes/home/home.component").then(m => m.HomeComponent), data: { animation: 0 } },
  { path: "career", title: "Carrière", loadComponent: () => import("@routes/career/career.component").then(m => m.CareerComponent), data: { animation: 1 } },
  { path: "skills", title: "Compétences", loadComponent: () => import("@routes/skills/skills.component").then(m => m.SkillsComponent), data: { animation: 2 } },
  { path: "projects", title: "Projets", loadComponent: () => import("@routes/projects/projects.component").then(m => m.ProjectsComponent), data: { animation: 3 } },
  { path: "designer", title: "Designer", loadComponent: () => import("@routes/designer/designer.component").then(m => m.DesignerComponent), data: { animation: 4 } },
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
  animations: [trigger("routeAnimations", [transition(":increment", slideTo("right")), transition(":decrement", slideTo("left"))])],
  imports: [CommonModule, RouterModule, RouterOutlet, TooltipModule, ReactiveFormsModule, ButtonModule, DialogModule, ToastModule, ConfirmDialogModule, ToggleSwitchModule, InputTextModule, PasswordModule, AnimationComponent, ProgressSpinnerModule],
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  enableMatrix: boolean = false;
  formReset = new FormGroup(
    {
      password: new FormControl("", [Validators.required, Validators.minLength(8), Validators.maxLength(4096), Validators.pattern(/(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*?[#?!@$ %^&*-])/)]),
      passwordrepeat: new FormControl("", [Validators.required]),
    },
    { validators: CustomValidators.matchFields("password", "passwordrepeat") },
  );
  formSignin = new FormGroup({ email: new FormControl("", [Validators.required, Validators.email]), password: new FormControl("", [Validators.required]) });
  formSignup = new FormGroup(
    {
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [Validators.required, Validators.minLength(8), Validators.maxLength(4096), Validators.pattern(/(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*?[#?!@$ %^&*-])/)]),
      passwordrepeat: new FormControl("", [Validators.required]),
    },
    { validators: CustomValidators.matchFields("password", "passwordrepeat") },
  );
  isResetShown: boolean = false;
  isResetting: boolean = false;
  isResumeShown: boolean = false;
  isSending: boolean = false;
  isSigninShown: boolean = false;
  isSigningIn: boolean = false;
  isSigningUp: boolean = false;
  isSignupShown: boolean = false;
  isTransitioning: boolean = false;
  params: any = {};
  resume: SafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl("");
  routes: Route[] = routes.filter(route => route.path && route.data);
  user: { admin: boolean; user: User } | undefined;
  // private enableDarkMode: boolean = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  private interval: NodeJS.Timeout;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private designerService: DesignerService,
    private toastService: ToastService,
    private sanitizer: DomSanitizer,
    private animationService: AnimationService,
  ) {
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
    // window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => (this.enableDarkMode = e.matches));
    this.authService.user().subscribe(user => (this.user = user));
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isTransitioning = true;
        document.getElementById("router-container")!.scrollTop = 0;
        setTimeout(() => (this.isTransitioning = false), 600);
      }
      if (event instanceof NavigationEnd) {
      }
    });
  }
  animate = () => {
    clearInterval(this.interval);
    if (this.enableMatrix) {
      let canvas: HTMLCanvasElement = document.querySelector("canvas")!;
      let context: CanvasRenderingContext2D = canvas.getContext("2d")!;
      context.reset();
      let drops: number[] = [];
      let fontSize: number = 10;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      for (let i = 0; i < canvas.width / fontSize; i++) drops[i] = canvas.height + 1;
      this.interval = setInterval(() => {
        let letters: string[] = "ABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZ".split("");
        context.fillStyle = "rgba(0, 0, 0, .18)";
        context.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < drops.length; i++) {
          let text = letters[Math.floor(Math.random() * letters.length)];
          context.fillStyle = "rgba(0,200,0,0.8)";
          context.fillText(text, i * fontSize, drops[i] * fontSize);
          drops[i]++;
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.99) drops[i] = 0;
        }
      }, 60);
    } else {
      if (document.querySelectorAll("#animation>span").length) return;
      for (let i = 0; i < 15; i++) {
        let shape = document.createElement("span");
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
      if (res.steps.length) this.animationService.animate({ steps: res.steps, callback: () => (this.isResumeShown = true) });
    });
  };
  ngOnInit() {
    this.animate();
  }
  prepareRoute = (outlet: RouterOutlet) => outlet && outlet.activatedRouteData && outlet.activatedRouteData["animation"];
  reset = () => {
    this.isResetting = true;
    this.authService.reset(this.params.oobCode, this.formReset.controls.password.value!).then(result => {
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
function slideTo(direction: any) {
  const optional = { optional: true };
  return [query(":enter, :leave", [style({ position: "absolute", width: "100%", height: "100%", [direction]: 0 })], optional), query(":enter", [style({ [direction]: "-100%" })]), group([query(":leave", [animate("600ms ease", style({ [direction]: "100%" }))], optional), query(":enter", [animate("600ms ease", style({ [direction]: "0%" }))])])];
}
class CustomValidators {
  static matchFields(a: string, b: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.get(a)!.value && control.get(b)!.value && control.get(a)!.value != control.get(b)!.value) control.get(b)!.setErrors({ notmatching: true });
      return null;
    };
  }
}
