import { animate, group, query, style, transition, trigger } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { NavigationEnd, NavigationStart, Route, Router, RouterModule, RouterOutlet, Routes } from "@angular/router";
import { AnimationComponent } from "@components/animation/animation.component";
import { AuthGuard } from "@helpers/auth.guard";
import { usePreset } from "@primeng/themes";
import { AuthService } from "@services/auth.service";
import { DesignerService } from "@services/designer.service";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { ToastModule } from "primeng/toast";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { TooltipModule } from "primeng/tooltip";
import { aura } from "src/themes/aura.preset";
import { matrix } from "src/themes/matrix.preset";

export const routes: Routes = [
  { path: "", title: "Nicolas Paillard", loadComponent: () => import("@routes/home/home.component").then((m) => m.HomeComponent), data: { animation: 0 } },
  { path: "about", title: "Présentation", loadComponent: () => import("@routes/about/about.component").then((m) => m.AboutComponent), data: { animation: 1 } },
  { path: "career", title: "Carrière", loadComponent: () => import("@routes/career/career.component").then((m) => m.CareerComponent), data: { animation: 2 } },
  { path: "skills", title: "Compétences", loadComponent: () => import("@routes/skills/skills.component").then((m) => m.SkillsComponent), data: { animation: 3 } },
  { path: "projects", title: "Projets", loadComponent: () => import("@routes/projects/projects.component").then((m) => m.ProjectsComponent), data: { animation: 4 } },
  { path: "designer", title: "Designer", loadComponent: () => import("@routes/designer/designer.component").then((m) => m.DesignerComponent), data: { animation: 5 } },
  { path: "applications", title: "Candidatures", loadComponent: () => import("@routes/applications/applications.component").then((m) => m.ApplicationsComponent), data: { animation: 6, role: "admin" }, canActivate: [AuthGuard] },
  { path: "cv", children: [] },
  { path: "**", redirectTo: "" },
];

@Component({
  selector: "app-root",
  animations: [trigger("routeAnimations", [transition(":increment", slideTo("right")), transition(":decrement", slideTo("left"))])],
  imports: [CommonModule, RouterModule, RouterOutlet, TooltipModule, ReactiveFormsModule, ButtonModule, DialogModule, ToastModule, ConfirmDialogModule, ToggleSwitchModule, InputTextModule, PasswordModule, AnimationComponent, ProgressSpinnerModule],
  templateUrl: "./app.component.html",
})
export class AppComponent {
  isSignupShown: boolean = false;
  isSigninShown: boolean = false;
  isTransitioning: boolean = false;
  user: any = null;
  routes: Route[] = routes.filter((route) => route.path && route.data);
  formSignup = new FormGroup(
    {
      password: new FormControl("", [Validators.required, Validators.minLength(8)]),
      passwordrepeat: new FormControl("", [Validators.required]),
      email: new FormControl("", { validators: [Validators.required, Validators.email] }),
    },
    {
      validators: CustomValidators.matchPassword(),
    },
  );
  formSignin = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required]),
  });
  matrixEnabled: boolean = false;
  constructor(
    private router: Router,
    private authService: AuthService,
    private designerService: DesignerService,
  ) {
    if (location.pathname.split("/").pop() === "cv") this.designerService.downloadPDF({ editing: false, replace: true });
    this.authService.user().subscribe((user) => (this.user = user));
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isTransitioning = true;
        document.getElementById("router-container")!.scrollTop = 0;
        setTimeout(() => (this.isTransitioning = false), 600);
      }
      if (event instanceof NavigationEnd) {
      }
    });
  }

  downloadCV = () => this.designerService.downloadPDF({ editing: false, replace: true });

  switchPreset = () => {
    this.matrixEnabled = !this.matrixEnabled;
    if (this.matrixEnabled) usePreset(matrix);
    else usePreset(aura);
    this.matrix();
  };
  private interval: NodeJS.Timeout | undefined;
  matrix = () => {
    let canvas: HTMLCanvasElement = document.querySelector("canvas")!;
    let context: CanvasRenderingContext2D = canvas.getContext("2d")!;
    context.reset();
    clearInterval(this.interval);
    if (!this.matrixEnabled) return;
    let drops: number[] = [];
    let fontSize: number = 10;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    for (let i = 0; i < canvas.width / fontSize; i++) drops[i] = canvas.height + 1;
    this.interval = setInterval(() => drawLetter(drops), 33);
    let letters: string[] = "ABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZ".split("");
    function drawLetter(drp: number[]) {
      context.fillStyle = "rgba(0, 0, 0, .03)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < drp.length; i++) {
        let text = letters[Math.floor(Math.random() * letters.length)];
        context.fillStyle = "rgba(0,200,0,0.8)";
        context.fillText(text, i * fontSize, drp[i] * fontSize);
        drp[i]++;
        if (drp[i] * fontSize > canvas.height && Math.random() > 0.99) drp[i] = 0;
      }
    }
  };
  prepareRoute = (outlet: RouterOutlet) => outlet && outlet.activatedRouteData && outlet.activatedRouteData["animation"];

  signup = () =>
    this.authService.signup(this.formSignup.value.email!, this.formSignup.value.password!).then(() => {
      this.formSignin.setValue({ email: this.formSignup.value.email!, password: this.formSignup.value.password! });
      this.isSignupShown = false;
      this.isSigninShown = true;
    });
  signin = () => this.authService.signin(this.formSignin.value.email!, this.formSignin.value.password!).then(() => (this.isSigninShown = false));
  signout = () => this.authService.signout();
}
function slideTo(direction: any) {
  const optional = { optional: true };
  return [
    query(
      ":enter, :leave",
      [
        style({
          position: "absolute",
          width: "100%",
          height: "100%",
          [direction]: 0,
        }),
      ],
      optional,
    ),
    query(":enter", [style({ [direction]: "-100%" })]),
    group([query(":leave", [animate("600ms ease", style({ [direction]: "100%" }))], optional), query(":enter", [animate("600ms ease", style({ [direction]: "0%" }))])]),
  ];
}
export class CustomValidators {
  static matchPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get("password")?.value;
      const passwordrepeat = control.get("passwordrepeat")?.value;
      if (password && passwordrepeat && password != passwordrepeat) control.get("passwordrepeat")?.setErrors({ notmatching: true });
      return null;
    };
  }
}
