/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Component, inject, signal } from "@angular/core";
import { SafeUrl } from "@angular/platform-browser";
import { ButtonModule } from "@openng/optimus-ui/button";
import { PdfmakeService } from "@services/pdfmake.service";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.addVirtualFileSystem(pdfFonts);

@Component({
  selector: "app-pdfmake",
  imports: [ButtonModule],
  templateUrl: "./pdfmake.component.html",
  styles: ``,
})
export class PdfmakeComponent {
  resume = signal<SafeUrl>("");
  private pdfmakeService = inject<PdfmakeService>(PdfmakeService);
  constructor() {
    this.pdfmakeService
      .generate()
      .then(result => this.resume.set(result.url))
      .catch(err => console.error(err));
  }
}
