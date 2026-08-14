import { Component, inject, input, model, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormGroup, ɵInternalFormsSharedModule } from "@angular/forms";
import { ApiError } from "@google/genai";
import { ButtonModule } from "@openng/optimus-ui/button";
import { DialogModule } from "@openng/optimus-ui/dialog";
import { InputGroupModule } from "@openng/optimus-ui/inputgroup";
import { InputTextModule } from "@openng/optimus-ui/inputtext";
import { SelectModule } from "@openng/optimus-ui/select";
import { AuthService } from "@services/auth.service";
import { PromptService } from "@services/prompt.service";

@Component({
  selector: "app-prompt",
  imports: [DialogModule, InputTextModule, InputGroupModule, ButtonModule, SelectModule, ɵInternalFormsSharedModule],
  templateUrl: "./prompt.component.html",
  styles: ``,
})
export class PromptComponent {
  chat = signal<{ ai: boolean; message: string; model?: string }[]>([]);
  field = input<string>("");
  form = model<FormGroup>();
  isPrompting = model<boolean>(false);
  isThinking = false;
  models: string[] = [];

  private promptService = inject(PromptService);
  constructor() {
    const authService = inject(AuthService);
    authService
      .user()
      .pipe(takeUntilDestroyed())
      .subscribe(user => {
        if (user?.admin) {
          this.promptService
            .getModels()
            .then(models => (this.models = models))
            .catch(err => console.error(err));
        }
      });
  }
  pick = (message: string) => {
    this.form.update(current => {
      current?.patchValue({ [this.field()]: message });
      return current;
    });
    this.isPrompting.update(() => false);
  };
  prompt = async (prompt: string) => {
    const conversation = document.getElementById("conversation")!;
    const scroll = () =>
      setTimeout(() => {
        conversation.scrollTop = conversation.scrollHeight;
      }, 100);
    this.chat.set([...this.chat(), { ai: false, message: prompt }]);
    this.isThinking = true;
    scroll();
    await this.promptService
      .prompt(prompt)
      .then(response => this.chat.set([...this.chat(), { ai: true, message: response.text, model: response.model }]))
      .catch(error => this.chat.set([...this.chat(), { ai: true, message: (error as ApiError).message }]))
      .finally(() => {
        this.isThinking = false;
        scroll();
      });
  };
}
