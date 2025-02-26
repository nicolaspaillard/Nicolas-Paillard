import { animate, group, query, style, transition, trigger } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { NavigationEnd, NavigationStart, Route, Router, RouterModule, RouterOutlet } from "@angular/router";
import { AnimationComponent } from "@components/animation/animation.component";
import { AuthService } from "@services/auth.service";
import { DesignerService } from "@services/designer.service";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { ToastModule } from "primeng/toast";
import { routes } from "src/main";

export const slide = trigger("routeAnimations", [transition(":increment", slideTo("right")), transition(":decrement", slideTo("left"))]);
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

@Component({
  selector: "app-root",
  animations: [slide],
  imports: [CommonModule, RouterModule, RouterOutlet, ReactiveFormsModule, ButtonModule, DialogModule, ToastModule, ConfirmDialogModule, InputTextModule, PasswordModule, AnimationComponent],
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
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
  ngOnInit() {
    this.matrix();
  }

  downloadCV = () => this.designerService.downloadPDF({ editing: false, replace: true });

  prepareRoute = (outlet: RouterOutlet) => outlet && outlet.activatedRouteData && outlet.activatedRouteData["animation"];
  interval: any;
  matrix() {
    let canvas: HTMLCanvasElement = document.querySelector("canvas")!;
    let context: CanvasRenderingContext2D = canvas.getContext("2d")!;
    context.reset();
    let letters: string[] = "ABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZ".split("");
    let fontSize: number = 10;
    let drops: number[] = [];
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    for (let i = 0; i < canvas.width / fontSize; i++) {
      drops[i] = canvas.height + 1;
    }
    clearInterval(this.interval);
    this.interval = setInterval(() => interval(drops), 33);
    function interval(drp: number[]) {
      context.fillStyle = "rgba(0, 0, 0, .03)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < drp.length; i++) {
        let text = letters[Math.floor(Math.random() * letters.length)];
        context.fillStyle = "#00ff00";
        context.fillText(text, i * fontSize, drp[i] * fontSize);
        drp[i]++;
        if (drp[i] * fontSize > canvas.height && Math.random() > 0.99) {
          drp[i] = 0;
        }
      }
    }
  }
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
