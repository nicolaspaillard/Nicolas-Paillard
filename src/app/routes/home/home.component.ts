import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { formSection, Section } from "@classes/section";
import { CrudComponent } from "@components/crud.component";
import { AuthService } from "@services/auth.service";
import { ConfirmService } from "@services/confirm.service";
import { CrudService, SERVICE_CONFIG, ServiceConfig } from "@services/crud.service";
import { NgxTypedJsModule } from "ngx-typed-js";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { FileUpload } from "primeng/fileupload";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { TextareaModule } from "primeng/textarea";
import { SectionComponent } from "./section/section.component";

const SERVICE_VARIABLE: ServiceConfig<Section> = {
  type: Section,
  form: formSection,
  collection: "sections",
  order: ["rank"],
  compareFn: (a, b) => a.rank - b.rank,
};

@Component({
  selector: "app-home",
  imports: [CommonModule, NgxTypedJsModule, ButtonModule, FileUpload, NgOptimizedImage, CommonModule, SectionComponent, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, TextareaModule, InputNumberModule],
  templateUrl: "./home.component.html",
  providers: [CrudService<Section>, { provide: SERVICE_CONFIG, useValue: SERVICE_VARIABLE }],
})
export class HomeComponent extends CrudComponent<Section> {
  strings: string[] = ["Web", "Backend", "Frontend", "FullStack", "SQL", "TypeScript", ".NET", "Angular", "Java", "Python"];
  constructor(crudService: CrudService<Section>, authService: AuthService, confirmService: ConfirmService) {
    super(crudService, authService, confirmService);
  }
  // moveSections = (rank: number) => {
  //   let previousRank: number = rank;
  //   this.items.slice(rank).forEach((section) => {
  //     if (section.rank > previousRank) return;
  //     this.items[this.items.indexOf(section)].rank++;
  //     this.update({ ...section, rank: section.rank + 1 });
  //   });
  // };
  // override open(item?: Section): void {
  //   this.form.controls["rank"].setValue(item ? item.rank : this.items[this.items.length - 1].rank + 1);
  //   super.open(item);
  // }
}
