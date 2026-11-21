import { inject, Service } from "@angular/core";
import { ToastService } from "@app/layout/services/toast.service";

@Service()
export class ClipboardService {
  private toastService = inject(ToastService);

  copy = (text: string) =>
    navigator.clipboard
      .writeText(text)
      .then(() => this.toastService.success("Success", `Copied "${text}"`))
      .catch(() => this.toastService.error("Error", `Couldn't copy "${text}"`));

  copyWith = (prefix: string) => (text: string) => this.copy(`${prefix}${text}`);
}
