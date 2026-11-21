import { Component, inject, signal } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ButtonModule } from "@openng/optimus-ui/button";
import { PdfmakeService } from "@services/pdfmake.service";

@Component({
  selector: "app-pdfmake",
  imports: [ButtonModule],
  templateUrl: "./pdfmake.component.html",
  styles: ``,
})
export class PdfmakeComponent {
  resume = signal<SafeResourceUrl>(inject(DomSanitizer).bypassSecurityTrustResourceUrl(""));
  constructor() {
    inject<PdfmakeService>(PdfmakeService)
      .generate()
      .then(result => this.resume.set(result.url))
      .catch(err => console.error(err));
  }
}
