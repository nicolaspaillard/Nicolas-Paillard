import { createEnvironmentInjector, EnvironmentInjector, inject, Injectable } from "@angular/core";
import { PreloadingStrategy, Route } from "@angular/router";
import { Base } from "@classes/base";
import { CrudService, ServiceConfig } from "@services/crud.service";
import { catchError, forkJoin, Observable, of, take, timeout } from "rxjs";

@Injectable({ providedIn: "root" })
export class PreloadWithDataStrategy implements PreloadingStrategy {
  private parentInjector = inject(EnvironmentInjector);
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    const shouldPreload = route.data?.["preload"] !== false && (route.data?.["preload"] === true || !!route.data?.["preloadConfigs"] || !!route.providers);
    if (!shouldPreload) return of(null);

    const sources: Observable<unknown>[] = [load()];

    if (route.data?.["preloadConfigs"]) {
      for (const config of route.data["preloadConfigs"] as ServiceConfig<Base>[]) {
        sources.push(
          CrudService.forCollection(this.parentInjector, config)
            .items()
            .pipe(
              take(1),
              timeout(5000),
              catchError(() => of(null)),
            ),
        );
      }
    }

    if (route.providers) {
      const injector = createEnvironmentInjector(route.providers, this.parentInjector);
      const service = injector.get(CrudService, null);
      if (service) {
        sources.push(
          service.items().pipe(
            take(1),
            timeout(5000),
            catchError(() => of(null)),
          ),
        );
      }
    }

    return forkJoin(sources);
  }
}
