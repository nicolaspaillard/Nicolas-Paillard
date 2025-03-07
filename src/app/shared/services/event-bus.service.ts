import { Injectable } from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { filter, map } from "rxjs/operators";

export class Event {
  name: string;
  value?: any;
  constructor(name: string, value?: any) {
    this.name = name;
    this.value = value;
  }
}

@Injectable({
  providedIn: "root",
})
export class EventBusService {
  private subject = new Subject<Event>();
  constructor() {}
  emit = (event: Event) => this.subject.next(event);
  // prettier-ignore
  on = (eventName: string, action: any): Subscription => this.subject.pipe(filter((e:Event) => e.name === eventName),map((e:Event) => e["value"])).subscribe(action);
}
