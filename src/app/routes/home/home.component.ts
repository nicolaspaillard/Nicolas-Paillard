import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { Profile } from "@classes/profile";
import { formSection, Section } from "@classes/section";
import { CrudComponent } from "@components/crud.component";
import { PromptButtonComponent } from "@components/prompt-button/prompt-button.component";
import { PromptComponent } from "@components/prompt/prompt.component";
import { PIcon } from "@primeicons/angular/p-icon";
import { AuthService } from "@services/auth.service";
import { ConfirmService } from "@services/confirm.service";
import { CrudService, SERVICE_CONFIG, ServiceConfig } from "@services/crud.service";
import { NgxTypedJsModule } from "ngx-typed-js";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
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
  imports: [CommonModule, NgxTypedJsModule, PIcon, ButtonModule, NgOptimizedImage, CommonModule, SectionComponent, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, TextareaModule, InputNumberModule, PromptComponent, PromptButtonComponent],
  templateUrl: "./home.component.html",
  providers: [CrudService<Section>, { provide: SERVICE_CONFIG, useValue: SERVICE_VARIABLE }],
})
export class HomeComponent extends CrudComponent<Section> {
  profile = signal<Profile[]>([]);
  strings: string[] = ["Web", "Backend", "Frontend", "FullStack", "SQL", "TypeScript", ".NET", "Angular", "Java", "Python"];

  constructor() {
    const crudService = inject<CrudService<Section>>(CrudService);
    const authService = inject(AuthService);
    const confirmService = inject(ConfirmService);
    super(crudService, authService, confirmService);
    crudService
      .getData(Profile, "profile", ["lastName"])
      .then(profile => this.profile.set([...profile]))
      .catch(err => console.error(err));
  }

  // testGPT = async () => {
  //   const openai = (await this.getOpenai())!;
  //   const client = new OpenAI({ apiKey: openai.api_key, dangerouslyAllowBrowser: true });
  //   const response = await client.responses.create({
  //     model: "gpt-3.5-turbo",
  //     input: "Write a one-sentence bedtime story about a unicorn.",
  //   });
  //   console.log(response.output_text);
  // };
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
