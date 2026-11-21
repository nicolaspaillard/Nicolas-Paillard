import { inject, Service } from "@angular/core";
import { MessageService } from "@openng/optimus-ui/api";

@Service()
export class ToastService {
  private messageService = inject(MessageService);

  error(title: string, message?: string) {
    this.messageService.add({
      severity: "error",
      summary: title,
      detail: message,
    });
    return;
  }
  info(title: string, message?: string) {
    this.messageService.add({
      severity: "info",
      summary: title,
      detail: message,
    });
    return;
  }
  success(title: string, message?: string) {
    this.messageService.add({
      severity: "success",
      summary: title,
      detail: message,
    });
    return;
  }
  warn(title: string, message?: string) {
    this.messageService.add({
      severity: "warn",
      summary: title,
      detail: message,
    });
    return;
  }
}
