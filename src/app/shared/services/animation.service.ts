import { Injectable } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Observable, Subject } from "rxjs";

export interface Step {
  lines: string[];
  route?: string;
}
export interface Animation {
  callback?: Function;
  steps: Step[];
}

@Injectable({
  providedIn: "root",
})
export class AnimationService {
  private _animations = new Subject<Animation>();
  animate = (animation: Animation) => {
    this._animations.next(animation);
  };
  animations = (): Observable<Animation> => this._animations.pipe(takeUntilDestroyed());
}
