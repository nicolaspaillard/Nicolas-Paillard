import { inject } from "@angular/core";
import { User } from "@angular/fire/auth";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "@services/auth.service";
import { EventBusService } from "@services/frontend/event-bus.service";
import { ToastService } from "@services/frontend/toast.service";

export const AuthGuard: CanActivateFn = (route, state) => {
  let canActivate: boolean = false;
  inject(AuthService)
    .user()
    .subscribe((user: { user: User; roles: string[] } | undefined) => {
      canActivate = user != null && (!route.data["role"] || user.roles.includes(route.data["role"]));
    });
  if (!canActivate) {
    inject(ToastService).error("Erreur", "Vous devez d'abord vous connecter");
    inject(EventBusService).emit({ name: "signin" });
    inject(Router).navigate([]);
  }
  return canActivate;
};
