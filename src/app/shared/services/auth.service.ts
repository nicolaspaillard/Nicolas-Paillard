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
  signup = async (email: string, password: string) => {
    const status = await validatePassword(this.auth, password);
    if (!status.isValid) {
      this.toastService.error("Erreur", "Mot de passe invalide");
      console.error(status);
    } else {
      createUserWithEmailAndPassword(this.auth, email, password).catch((error) => console.error(error));
    }
  };
  signin = async (email: string, password: string) => signInWithEmailAndPassword(this.auth, email, password).catch((error) => console.error(error));
  signout = () =>
    signOut(this.auth)
      .then(() => {
        this._user.next(undefined);
        this.router.navigate([""]);
      })
      .catch((error) => console.error(error));
}
