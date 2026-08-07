import { inject, Injectable } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Auth, confirmPasswordReset, createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, User, validatePassword, verifyPasswordResetCode } from "@angular/fire/auth";
import { Observable, ReplaySubject, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private _user: Subject<{ admin: boolean; user: User } | undefined> = new ReplaySubject(1);
  private auth = inject(Auth);
  constructor() {
    onAuthStateChanged(this.auth, user => {
      if (user)
        user
          .getIdTokenResult()
          .then(idTokenResult => this._user.next({ user: user, admin: !!idTokenResult.claims["admin"] }))
          .catch(error => console.error(error));
      else this._user.next(undefined);
    });
  }
  reset = (code: string, password: string) =>
    verifyPasswordResetCode(this.auth, code)
      .then(() =>
        confirmPasswordReset(this.auth, code, password)
          .then(() => true)
          .catch(error => console.error(error)),
      )
      .catch(error => console.error(error));
  send = (email: string) =>
    sendPasswordResetEmail(this.auth, email)
      .then(() => true)
      .catch(error => console.error(error));

  signin = async (email: string, password: string) =>
    signInWithEmailAndPassword(this.auth, email, password)
      .then(() => true)
      .catch(error => {
        console.error(error);
        return false;
      });

  signout = () =>
    signOut(this.auth)
      .then(() => true)
      .catch(error => console.error(error));

  signup = async (email: string, password: string): Promise<boolean | ["password", { maxlength: boolean; minlength: boolean; pattern: boolean }] | ["email", { inuse: boolean }]> => {
    const status = await validatePassword(this.auth, password);
    if (!status.isValid) {
      const ret = { maxlength: false, minlength: false, pattern: false };
      if (!status.containsLowercaseLetter) ret.pattern = true;
      else if (!status.containsUppercaseLetter) ret.pattern = true;
      else if (!status.containsNonAlphanumericCharacter) ret.pattern = true;
      else if (!status.containsNumericCharacter) ret.pattern = true;
      if (!status.meetsMaxPasswordLength) ret.maxlength = true;
      if (!status.meetsMinPasswordLength) ret.minlength = true;
      return ["password", ret];
    } else
      return createUserWithEmailAndPassword(this.auth, email, password)
        .then(userCredentials =>
          sendEmailVerification(userCredentials.user)
            .then(() => true)
            .catch(error => {
              console.error(error);
              return true;
            }),
        )
        .catch(error => {
          console.error(error);
          return ["email", { inuse: true }];
        });
  };
  user = (): Observable<{ admin: boolean; user: User } | undefined> => this._user.pipe(takeUntilDestroyed());
}
