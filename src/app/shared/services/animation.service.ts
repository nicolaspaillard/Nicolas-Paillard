import { Injectable } from "@angular/core";
import { filter, Observable, Subject } from "rxjs";

export class Animation {
  id?: string;
  sections: { route?: string; lines: string[] }[];
  callback: Function;
}

@Injectable({
  providedIn: "root",
})
export class AnimationService {
  private _animations = new Subject<Animation>();
  animations = (id: string = "animation-main"): Observable<Animation> => this._animations.asObservable().pipe(filter((animation) => animation && animation.id === id));
  animate = (animation: Animation) => (animation.id = animation.id || "animation-main") && this._animations.next(animation);
}
