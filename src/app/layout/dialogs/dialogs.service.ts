import { Service, signal } from "@angular/core";

@Service()
export class DialogsService {
  readonly isResetShown = signal<boolean>(false);
  readonly isSigninShown = signal<boolean>(false);
  readonly isSignupShown = signal<boolean>(false);
}
