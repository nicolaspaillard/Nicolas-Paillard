import { CommonModule } from "@angular/common";
import { Component, OnDestroy, inject } from "@angular/core";
import { Router } from "@angular/router";
import { SafeHtmlPipe } from "@helpers/safehtml.pipe";
import { Animation, AnimationService } from "@services/animation.service";
import { ButtonModule } from "@openng/optimus-ui/button";
import { Subscription } from "rxjs";

@Component({
  selector: "app-animation",
  imports: [CommonModule, SafeHtmlPipe, ButtonModule],
  templateUrl: "./animation.component.html",
})
export class AnimationComponent implements OnDestroy {
  private animationService = inject(AnimationService);
  private router = inject(Router);

  animationSubscription: Subscription;
  callback?: Function;
  interval: NodeJS.Timeout;
  isAnimationShown = false;
  text: string[] = [];
  constructor() {
    this.animationSubscription = this.animationService
      .animations()
      .subscribe((animation) => this.animate(animation));
  }
  animate = (animation: Animation) => {
    this.callback = animation.callback;
    this.isAnimationShown = true;
    this.text = [];
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
          if (
            animation.steps[step].route &&
            line === 0 &&
            this.router.url != "/designer"
          )
            this.router.navigate([animation.steps[step].route]);
          if (line === 0 && step > 0) this.text.push("<br>");
          this.text.push(animation.steps[step].lines[line]);
          document.getElementById("animation-main")!.scrollTop = 99999999;
          line++;
        }
      },
      Math.random() * (150 - 100) + 100,
    );
  };
  finish = () => {
    clearInterval(this.interval);
    this.isAnimationShown = false;
    if (this.callback) this.callback();
  };
  ngOnDestroy() {
    this.animationSubscription.unsubscribe();
  }
}
