import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component } from "@angular/core";
import { User } from "@angular/fire/auth";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "@services/auth.service";
import { ConfirmService } from "@services/frontend/confirm.service";
import { Section, SectionsService } from "@services/old/sections.service";
import { NgxTypedJsModule } from "ngx-typed-js";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { FileUpload } from "primeng/fileupload";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { TextareaModule } from "primeng/textarea";
import { SectionComponent } from "./section/section.component";

@Component({
  selector: "app-home",
  imports: [CommonModule, NgxTypedJsModule, ButtonModule, FileUpload, NgOptimizedImage, CommonModule, SectionComponent, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, TextareaModule, InputNumberModule],
  templateUrl: "./home.component.html",
})
export class HomeComponent {
  strings: string[] = ["Web", "Backend", "Frontend", "FullStack", "SQL", "TypeScript", ".NET", "Angular", "Java", "Python"];
  user?: User;
  isDialogSectionShown: boolean = false;
  idEdit: string = "";
  formSection = new FormGroup({
    rank: new FormControl(0, [Validators.required]),
    text: new FormControl("", [Validators.required]),
  });
  sections: Section[] = [];

  constructor(
    private authService: AuthService,
    private sectionsService: SectionsService,
    private confirmService: ConfirmService,
  ) {
    this.authService.user().subscribe((user: User) => (this.user = user));
    this.sectionsService.sections().subscribe((sections) => (this.sections = sections));
  }
  openDialog = (section?: Section) => {
    if (section) {
      this.idEdit = section.id!;
      let tmp = new Section(section);
      delete tmp.id;
      this.formSection.setValue(tmp);
    } else {
      this.idEdit = "";
      this.formSection.setValue({ rank: this.sections[this.sections.length - 1].rank + 1, text: "" });
    }
    this.isDialogSectionShown = true;
  };
  createSection = () => this.sectionsService.createSection(this.formSection.value as Section).then(() => (this.isDialogSectionShown = false));
  updateSection = () => {
    let section: Section = this.formSection.value as Section;
    section.id = this.idEdit;
    this.sectionsService.updateSection(section).then(() => (this.isDialogSectionShown = false));
  };
  deleteSection = (section: Section) => {
    this.confirmService.confirm({
      message: `Voulez-vous vraiment supprimer '${section.text}' ?`,
      accept: async () => {
        this.sectionsService.deleteSection(section);
      },
    });
  };
}
