import { CommonModule } from "@angular/common";
import { Component, OnDestroy, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { AnimationService } from "@app/layout/components/animation/animation.service";
import { SafeHtmlPipe } from "@app/layout/components/animation/safehtml.pipe";
import { ButtonModule } from "@openng/optimus-ui/button";
import { Subscription } from "rxjs";
import { Animation as AnimationData } from "./animation.service";

@Component({
  selector: "app-animation",
  imports: [CommonModule, SafeHtmlPipe, ButtonModule],
  templateUrl: "./animation.component.html",
})
export class Animation implements OnDestroy {
  animationSubscription: Subscription;
  callback?: () => void;
  interval?: ReturnType<typeof setInterval>;
  isAnimationShown = signal<boolean>(false);
  text = signal<string[]>([]);
  private router = inject(Router);

  constructor() {
    const animationService = inject(AnimationService);
    this.animationSubscription = animationService.animations().subscribe(animation => this.animate(animation));
  }
  animate = (animation: AnimationData) => {
    this.callback = animation.callback;
    this.isAnimationShown.set(true);
    this.text.set([]);
    let step = 0,
      line = 0;
    this.interval = setInterval(
      () => {
        if (step >= animation.steps.length) {
          this.finish();
          return;
        } else if (line == animation.steps[step].lines.length) {
          step++;
          line = 0;
        } else {
          if (animation.steps[step].route && line === 0 && this.router.url != "/designer") this.router.navigate([animation.steps[step].route]).catch(err => console.error(err));
          if (line === 0 && step > 0) this.text.set([...this.text(), "<br>"]);
          this.text.set([...this.text(), animation.steps[step].lines[line]]);
          document.getElementById("animation-main")!.scrollTop = 99999999;
          line++;
        }
      },
      Math.random() * (200 - 100) + 100,
    );
  };
  finish = () => {
    clearInterval(this.interval);
    this.isAnimationShown.set(false);
    if (this.callback) this.callback();
  };
  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
    this.animationSubscription.unsubscribe();
  }
}
