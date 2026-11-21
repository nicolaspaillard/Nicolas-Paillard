import { inject, Injector, Service, signal } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { AnimationService } from "@app/layout/animation/animation.service";

@Service()
export class ResumeService {
  readonly isGenerating = signal<boolean>(false);
  readonly isGeneratorShown = signal<boolean>(false);
  readonly isShown = signal<boolean>(false);
  readonly url = signal<SafeResourceUrl>(inject(DomSanitizer).bypassSecurityTrustResourceUrl(""));
  private animationService = inject(AnimationService);
  private injector = inject(Injector);

  download = async () => {
    this.isGenerating.set(true);
    const { PdfmakeService } = await import("@services/pdfmake.service");
    this.injector
      .get(PdfmakeService)
      .generate()
      .then(res => {
        this.url.set(res.url);
        this.animationService.animate({
          steps: res.steps,
          callback: () => {
            this.isShown.set(true);
            this.isGenerating.set(false);
          },
        });
      })
      .catch(err => console.error(err));
  };
}
