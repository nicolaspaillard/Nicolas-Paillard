import { Injectable } from "@angular/core";
import { MessageService } from "primeng/api";

@Injectable({
  providedIn: "root",
})
export class ToastService {
  constructor(private messageService: MessageService) {}
  success(title: string, message?: string) {
    this.messageService.add({ severity: "success", summary: title, detail: message });
    return;
  }
  info(title: string, message?: string) {
    this.messageService.add({ severity: "info", summary: title, detail: message });
    return;
  }
  warn(title: string, message?: string) {
    this.messageService.add({ severity: "warn", summary: title, detail: message });
    return;
  }
  error(title: string, message?: string) {
    this.messageService.add({ severity: "error", summary: title, detail: message });
    return;
  }
}
