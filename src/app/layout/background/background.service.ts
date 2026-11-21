import { Service, signal } from "@angular/core";

@Service()
export class BackgroundService {
  readonly enableMatrix = signal<boolean>(false);
}
