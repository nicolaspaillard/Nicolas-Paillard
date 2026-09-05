import { NgOptimizedImage } from "@angular/common";
import { Component, inject, Injector, signal } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { CONFIG_PROFILES } from "@app/shared/route.configs";
import { Profile } from "@classes/profile";
import { Section } from "@classes/section";
import { CrudComponent } from "@components/crud.component";
import { PromptButtonComponent } from "@components/prompt-button/prompt-button.component";
import { PromptComponent } from "@components/prompt/prompt.component";
import { ButtonModule } from "@openng/optimus-ui/button";
import { DialogModule } from "@openng/optimus-ui/dialog";
import { InputNumberModule } from "@openng/optimus-ui/inputnumber";
import { InputTextModule } from "@openng/optimus-ui/inputtext";
import { TextareaModule } from "@openng/optimus-ui/textarea";
import { AuthService } from "@services/auth.service";
import { ConfirmService } from "@services/confirm.service";
import { CrudService } from "@services/crud.service";
import { NgxTypedJsModule } from "ngx-typed-js";
import { firstValueFrom } from "rxjs";
import { SectionComponent } from "./section/section.component";

@Component({
  selector: "app-home",
  imports: [NgxTypedJsModule, ButtonModule, NgOptimizedImage, SectionComponent, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, TextareaModule, InputNumberModule, PromptComponent, PromptButtonComponent],
  templateUrl: "./home.component.html",
})
export class HomeComponent extends CrudComponent<Section> {
  profile = signal<Profile | undefined>(undefined);
  strings: string[] = ["Web", "Backend", "Frontend", "FullStack", "SQL", "TypeScript", ".NET", "Angular", "Java", "Python"];
  constructor() {
    const crudService = inject<CrudService<Section>>(CrudService);
    const authService = inject(AuthService);
    const confirmService = inject(ConfirmService);

    super(crudService, authService, confirmService);

    const profileService = CrudService.forCollection(inject(Injector), CONFIG_PROFILES);
    firstValueFrom(profileService.items())
      .then(profile => this.profile.set({ ...profile[0] }))
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
  //   this.items().slice(rank).forEach((section) => {
  //     if (section.rank > previousRank) return;
  //     this.items[this.items().indexOf(section)].rank++;
  //     this.update({ ...section, rank: section.rank + 1 });
  //   });
  // };
  // override open(item?: Section): void {
  //   this.form.controls["rank"].setValue(item ? item.rank : this.items[this.items().length - 1].rank + 1);
  //   super.open(item);
  // }
}
