import { Injectable } from "@angular/core";
import { Confirmation, ConfirmationService } from "primeng/api";

@Injectable({
  providedIn: "root",
})
export class ConfirmService {
  constructor(private confirmationService: ConfirmationService) {}
  confirm(confirmation: Confirmation) {
    this.confirmationService.confirm({
      header: confirmation.header || "Confirmation",
      message: confirmation.message || "Êtes-vous sûr(e) ?",
      acceptLabel: confirmation.acceptLabel || "Oui",
      rejectLabel: confirmation.rejectLabel || "Non",
      accept: confirmation.accept,
    });
  }
}
