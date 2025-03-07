import { inject, Injectable } from "@angular/core";
import { Auth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, User, validatePassword } from "@angular/fire/auth";
import { Observable, ReplaySubject, Subject } from "rxjs";
import { ToastService } from "./frontend/toast.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private auth = inject(Auth);
  private _user: Subject<{ user: User; roles: string[] } | undefined> = new ReplaySubject(1);
  private _admin: Subject<boolean> = new ReplaySubject(1);
  constructor(private toastService: ToastService) {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        // prettier-ignore
        user.getIdTokenResult().then((idTokenResult) => {
          console.log(idTokenResult.claims);
          this._admin.next(idTokenResult.claims["admin"] ? true : false);
        this._user.next({user:user,roles:idTokenResult.claims["admin"]?["admin"]:[]});

        }).catch(error=>console.error(error));
      } else {
        this._admin.next(false);
        this._user.next(undefined);
      }
    });
  }
  user = (): Observable<{ user: User; roles: string[] } | undefined> => this._user.asObservable();
  admin = (): Observable<boolean> => this._admin.asObservable();

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
      .then(() => this._user.next(undefined))
      .catch((error) => console.error(error));
}
