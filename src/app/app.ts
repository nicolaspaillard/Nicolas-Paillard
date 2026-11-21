import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Animation } from "@app/layout/components/animation/animation.component";
import { ConfirmDialogModule } from "@openng/optimus-ui/confirmdialog";
import { ToastModule } from "@openng/optimus-ui/toast";
import { ResumeService } from "@services/resume.service";
import { Background } from "./layout/components/background/background";
import { Dialogs } from "./layout/components/dialogs/dialogs";
import { DialogsService } from "./layout/components/dialogs/dialogs.service";
import { Navbar } from "./layout/components/navbar/navbar";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, ToastModule, ConfirmDialogModule, Animation, Background, Dialogs, Navbar],
  templateUrl: "./app.html",
  host: { class: "flex h-full flex-col" },
})
export class App {
  constructor() {
    const dialogsService = inject(DialogsService);
    switch (location.pathname.split("/").pop()) {
      case "cv":
        void inject(ResumeService).download();
        break;
      case "login":
        dialogsService.isSigninShown.set(true);
        break;
      case "reset":
        dialogsService.isResetShown.set(true);
        break;
    }
  }
}
