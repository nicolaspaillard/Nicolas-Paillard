import { Injectable } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { filter, Observable, Subject } from "rxjs";

export class Animation {
  callback: Function;
  id?: string;
  steps: { lines: string[]; route?: string }[];
}

@Injectable({
  providedIn: "root",
})
export class AnimationService {
  private _animations = new Subject<Animation>();
  animate = (animation: Animation) => (animation.id = animation.id || "animation-main") && this._animations.next(animation);
  animations = (id: string = "animation-main"): Observable<Animation> => this._animations.pipe(takeUntilDestroyed()).pipe(filter((animation) => animation && animation.id === id));
}
