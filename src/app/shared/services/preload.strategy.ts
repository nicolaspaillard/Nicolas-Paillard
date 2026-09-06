import { createEnvironmentInjector, EnvironmentInjector, inject, Injectable } from "@angular/core";
import { PreloadingStrategy, Route } from "@angular/router";
import { Base } from "@classes/base";
import { CrudService, SERVICE_CONFIG, ServiceConfig } from "@services/crud.service";
import { catchError, forkJoin, Observable, of, take, timeout } from "rxjs";

@Injectable({ providedIn: "root" })
export class PreloadWithDataStrategy implements PreloadingStrategy {
  private parentInjector = inject(EnvironmentInjector);
  private readonly preloadedCollections = new Set<string>();

  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    const sources: Observable<unknown>[] = [load()];

    if (route.data?.["preloadConfigs"]) {
      for (const config of route.data["preloadConfigs"] as ServiceConfig<Base>[]) {
        if (this.preloadedCollections.has(config.collection)) continue;

        this.preloadedCollections.add(config.collection);
        sources.push(
          CrudService.forCollection(this.parentInjector, config)
            .items()
            .pipe(
              take(1),
              timeout(5000),
              catchError(() => {
                this.preloadedCollections.delete(config.collection);
                return of(null);
              }),
            ),
        );
      }
    }

    if (route.providers) {
      const providers = route.providers as { provide?: unknown; useValue?: ServiceConfig<Base> }[];
      const collection = providers.find(provider => provider.provide === SERVICE_CONFIG)?.useValue?.collection;

      if (collection && !this.preloadedCollections.has(collection)) {
        this.preloadedCollections.add(collection);

        const injector = createEnvironmentInjector(route.providers, this.parentInjector);
        const service = injector.get(CrudService, null);

        if (service) {
          sources.push(
            service.items().pipe(
              take(1),
              timeout(5000),
              catchError(() => {
                this.preloadedCollections.delete(collection);
                return of(null);
              }),
            ),
          );
        }
      }
    }

    return forkJoin(sources);
  }
}
