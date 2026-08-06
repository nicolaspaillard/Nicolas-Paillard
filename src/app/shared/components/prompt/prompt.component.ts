import { Component, inject, input, model } from "@angular/core";
import { FormGroup, ɵInternalFormsSharedModule } from "@angular/forms";
import { PromptService } from "@services/prompt.service";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { InputGroupModule } from "primeng/inputgroup";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";

@Component({
  selector: "app-prompt",
  imports: [DialogModule, InputTextModule, InputGroupModule, ButtonModule, SelectModule, ɵInternalFormsSharedModule],
  templateUrl: "./prompt.component.html",

  styles: ``,
})
export class PromptComponent {
  chat: { ai: boolean; message: string; model?: string }[] = [];
  field = input<string>("");
  form = model<FormGroup>();
  isPrompting = model<boolean>(false);
  isThinking = false;
  models: string[] = [];

  private promptService = inject(PromptService);

  constructor() {
    const promptService = this.promptService;

    promptService.getModels().then(models => (this.models = models));
  }
  pick = async (message: string) => {
    this.form.update(current => {
      current?.patchValue({ [this.field()]: message });
      return current;
    });
    this.isPrompting.update(() => false);
  };
  prompt = async (prompt: string, model?: string) => {
    const conversation = document.getElementById("conversation")!;
    const scroll = () =>
      setTimeout(() => {
        conversation.scrollTop = conversation.scrollHeight;
      }, 100);
    this.chat.push({ ai: false, message: prompt });
    this.isThinking = true;
    scroll();
    await this.promptService
      .prompt(prompt)
      .then(response =>
        this.chat.push({
          ai: true,
          message: response.text,
          model: response.model,
        }),
      )
      .catch(error => this.chat.push({ ai: true, message: error.message }))
      .finally(() => {
        this.isThinking = false;
        scroll();
      });
  };
}
