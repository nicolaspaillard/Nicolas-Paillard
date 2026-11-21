import { NgClass, NgTemplateOutlet } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { routes } from "@app/app.routes";
import { AuthService } from "@app/layout/services/auth.service";
import { ButtonModule } from "@openng/optimus-ui/button";
import { SplitButtonModule } from "@openng/optimus-ui/splitbutton";
import { ToggleSwitchModule } from "@openng/optimus-ui/toggleswitch";
import { TooltipModule } from "@openng/optimus-ui/tooltip";
import { ResumeService } from "@services/resume.service";
import { BackgroundService } from "../background/background.service";
import { DialogsService } from "../dialogs/dialogs.service";

@Component({
  host: { class: "sticky top-0 z-20 mx-auto block container" },
  imports: [NgClass, NgTemplateOutlet, RouterLink, RouterLinkActive, ButtonModule, SplitButtonModule, ToggleSwitchModule, TooltipModule],
  selector: "app-navbar",
  templateUrl: "./navbar.html",
})
export class Navbar {
  readonly dialogs = inject(DialogsService);
  readonly isMenuShown = signal<boolean>(false);
  readonly resumeButtonItems = [{ label: "Customiser", icon: "pi pi-pen-to-square", command: () => this.resumeService.isGeneratorShown.set(true) }];
  readonly user = computed(() => this.authService.user());
  readonly visibleRoutes = computed(() => navbarRoutes.filter(route => !route.canActivate || this.user()?.admin));
  protected readonly backgroundService = inject(BackgroundService);
  protected readonly resumeService = inject(ResumeService);
  private authService = inject(AuthService);
  private router = inject(Router);
  signout = () => this.authService.signout().then(() => this.router.navigate([""]));
}

const navbarRoutes = routes.filter(route => route.path && route.data);
