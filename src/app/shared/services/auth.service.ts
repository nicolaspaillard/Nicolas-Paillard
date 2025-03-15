import { inject, Injectable } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Auth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, User, validatePassword } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { Observable, ReplaySubject, Subject } from "rxjs";
import { ToastService } from "./toast.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private auth = inject(Auth);
  private _user: Subject<{ user: User; admin: boolean } | undefined> = new ReplaySubject(1);
  constructor(
    private toastService: ToastService,
    private router: Router,
  ) {
    onAuthStateChanged(this.auth, (user) => {
      if (user)
        user
          .getIdTokenResult()
          .then((idTokenResult) => this._user.next({ user: user, admin: !!idTokenResult.claims["admin"] }))
          .catch((error) => console.error(error));
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
          .then((userCredentials) => true)
          .catch((error) => {
            switch (error.code) {
              case "auth/email-already-in-use":
                return ["email", { inuse: true }];
              default:
                console.error(error.code, error.message);
                return ["email", { unknown: true }];
            }
          });
    });
  };
  signin = async (email: string, password: string) =>
    signInWithEmailAndPassword(this.auth, email, password)
      .then(() => true)
      .catch((error) => {
        console.error(error.code);
        // auth/invalid-credential
        return false;
      });
  signout = () =>
    signOut(this.auth)
      .then(() => {
        this._user.next(undefined);
        this.router.navigate([""]);
      })
      .catch((error) => console.error(error));
}
