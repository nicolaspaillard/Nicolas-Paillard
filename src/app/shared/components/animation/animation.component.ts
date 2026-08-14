import { CommonModule } from "@angular/common";
import { Component, OnDestroy, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { SafeHtmlPipe } from "@helpers/safehtml.pipe";
import { ButtonModule } from "@openng/optimus-ui/button";
import { Animation, AnimationService } from "@services/animation.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-animation",
  imports: [CommonModule, SafeHtmlPipe, ButtonModule],
  templateUrl: "./animation.component.html",
})
export class AnimationComponent implements OnDestroy {
  animationSubscription: Subscription;
  callback?: () => void;
  interval: NodeJS.Timeout;
  isAnimationShown = signal<boolean>(false);
  text = signal<string[]>([]);
  private router = inject(Router);

  constructor() {
    const animationService = inject(AnimationService);
    this.animationSubscription = animationService.animations().subscribe(animation => this.animate(animation));
  }
  animate = (animation: Animation) => {
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
      Math.random() * (150 - 100) + 100,
    );
  };
  finish = () => {
    clearInterval(this.interval);
    this.isAnimationShown.set(false);
    if (this.callback) this.callback();
  };
  ngOnDestroy() {
    this.animationSubscription.unsubscribe();
  }
}
