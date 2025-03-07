import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { AuthService } from "@services/auth.service";
import { DesignerService } from "@services/designer.service";
import { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { FileUploadHandlerEvent, FileUploadModule } from "primeng/fileupload";
import { SplitButton } from "primeng/splitbutton";

@Component({
  selector: "app-designer",
  imports: [ButtonModule, FileUploadModule, SplitButton, CommonModule],
  templateUrl: "./designer.component.html",
})
export class DesignerComponent implements OnInit, OnDestroy {
  isAdmin: boolean = false;
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
      command: () => (document.querySelector("#upload-model button")! as HTMLElement).click(),
    },
    {
      label: "Importer template",
      icon: "pi pi-upload",
      command: () => (document.querySelector("#upload-template button")! as HTMLElement).click(),
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
  constructor(
    private authService: AuthService,
    private designerService: DesignerService,
  ) {
    this.authService.admin().subscribe((isAdmin) => (this.isAdmin = isAdmin));
  }
  ngOnInit() {
    this.load();
  }
  ngOnDestroy() {
    this.designerService.destroy();
  }
  load = () => this.designerService.init("container");
  save = () => this.designerService.save();
  clear = () => this.designerService.clear();
  importTemplate = (event: FileUploadHandlerEvent) => this.designerService.importTemplate(event.files[0]);
  exportTemplate = () => this.designerService.exportTemplate();
  import = (event: FileUploadHandlerEvent) => this.designerService.import(event.files[0]);
  export = () => this.designerService.export({ editing: true, replace: false });
}
