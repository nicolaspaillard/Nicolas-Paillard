import { Component, OnDestroy, OnInit, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { User } from "@angular/fire/auth";
import { MenuItem } from "@openng/optimus-ui/api";
import { ButtonModule } from "@openng/optimus-ui/button";
import {
  FileUploadHandlerEvent,
  FileUploadModule,
} from "@openng/optimus-ui/fileupload";
import { SplitButton } from "@openng/optimus-ui/splitbutton";
import { AuthService } from "@services/auth.service";
import { DesignerService } from "@services/designer.service";

@Component({
  selector: "app-designer",
  imports: [ButtonModule, FileUploadModule, SplitButton],
  templateUrl: "./designer.component.html",
})
export class DesignerComponent implements OnInit, OnDestroy {
  menuItems: MenuItem[] = [
    {
      label: "Réinitialiser",
      icon: "pi pi-trash",
      command: () => this.clear(),
    },
    {
      label: "Recharger",
      icon: "pi pi-refresh",
      command: () => this.load(),
    },
    {
      label: "Importer modèle",
      icon: "pi pi-upload",
      command: () =>
        (
          document.querySelector("#upload-model button")! as HTMLElement
        ).click(),
    },
    {
      label: "Importer template",
      icon: "pi pi-upload",
      command: () =>
        (
          document.querySelector("#upload-template button")! as HTMLElement
        ).click(),
    },
    {
      label: "Télécharger",
      icon: "pi pi-download",
      command: () => this.exportTemplate(),
    },
    {
      label: "Générer",
      icon: "pi pi-file-pdf",
      command: () => this.export(),
    },
  ];
  user = signal<{ admin: boolean; user: User } | undefined>(undefined);
  constructor(
    private authService: AuthService,
    private designerService: DesignerService,
  ) {
    this.authService
      .user()
      .pipe(takeUntilDestroyed())
      .subscribe((user) => this.user.set(user ? { ...user } : undefined));
  }
  clear = () => this.designerService.clear();
  export = () => this.designerService.export({ editing: true });
  exportTemplate = () => this.designerService.exportTemplate();
  import = (event: FileUploadHandlerEvent) =>
    this.designerService.import(event.files[0]);
  importTemplate = (event: FileUploadHandlerEvent) =>
    this.designerService.importTemplate(event.files[0]);
  load = () => this.designerService.init("container");
  ngOnDestroy() {
    this.designerService.destroy();
  }
  ngOnInit() {
    this.load();
  }
  save = () => this.designerService.save();
}
