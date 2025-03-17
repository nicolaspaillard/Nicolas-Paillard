import { inject, Injectable } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Auth, confirmPasswordReset, createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, User, validatePassword, verifyPasswordResetCode } from "@angular/fire/auth";
import { handleError } from "@helpers/helpers";
import { Observable, ReplaySubject, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private auth = inject(Auth);
  private _user: Subject<{ user: User; admin: boolean } | undefined> = new ReplaySubject(1);
  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      if (user)
        user
          .getIdTokenResult()
          .then((idTokenResult) => this._user.next({ user: user, admin: !!idTokenResult.claims["admin"] }))
          .catch((error) => handleError(error));
      else this._user.next(undefined);
    });
  }
  user = (): Observable<{ user: User; admin: boolean } | undefined> => this._user.pipe(takeUntilDestroyed());
  signup = async (email: string, password: string): Promise<boolean | [string, any]> => {
    return validatePassword(this.auth, password).then((status) => {
      if (!status.isValid) {
        let ret: any;
        if (!status.containsLowercaseLetter) ret.pattern = true;
        else if (!status.containsUppercaseLetter) ret.pattern = true;
        else if (!status.containsNonAlphanumericCharacter) ret.pattern = true;
        else if (!status.containsNumericCharacter) ret.pattern = true;
        if (!status.meetsMaxPasswordLength) ret.maxlength = true;
        if (!status.meetsMinPasswordLength) ret.minlength = true;
        return ["password", ret];
      } else
        return createUserWithEmailAndPassword(this.auth, email, password)
          .then((userCredentials) =>
            sendEmailVerification(userCredentials.user)
              .then(() => true)
              .catch((error) => handleError(error)),
          )
          .catch((error) => handleError(error, ["email", { inuse: true }]));
    });
  };
  signin = async (email: string, password: string) =>
    signInWithEmailAndPassword(this.auth, email, password)
      .then(() => true)
      .catch((error) => handleError(error));

  signout = () =>
    signOut(this.auth)
      .then(() => true)
      .catch((error) => handleError(error));

  send = (email: string) =>
    sendPasswordResetEmail(this.auth, email)
      .then(() => true)
      .catch((error) => handleError(error));

  reset = (code: string, password: string) =>
    verifyPasswordResetCode(this.auth, code)
      .then(() =>
        confirmPasswordReset(this.auth, code, password)
          .then(() => true)
          .catch((error) => handleError(error)),
      )
      .catch((error) => handleError(error));
}
