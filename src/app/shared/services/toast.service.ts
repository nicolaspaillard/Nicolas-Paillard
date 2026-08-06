import { Injectable, inject } from "@angular/core";
import { MessageService } from "@openng/optimus-ui/api";

@Injectable({
  providedIn: "root",
})
export class ToastService {
  private messageService = inject(MessageService);

  success(title: string, message?: string) {
    this.messageService.add({
      severity: "success",
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
  warn(title: string, message?: string) {
    this.messageService.add({
      severity: "warn",
      summary: title,
      detail: message,
    });
    return;
  }
  error(title: string, message?: string) {
    this.messageService.add({
      severity: "error",
      summary: title,
      detail: message,
    });
    return;
  }
}
