import { EnvironmentInjector, inject, Injectable } from "@angular/core";
import { PreloadingStrategy, Route } from "@angular/router";
import { Base } from "@classes/base";
import { CrudService, SERVICE_CONFIG, ServiceConfig } from "@services/crud.service";
import { catchError, forkJoin, Observable, of, take, timeout } from "rxjs";

@Injectable({ providedIn: "root" })
export class PreloadWithDataStrategy implements PreloadingStrategy {
  private parentInjector = inject(EnvironmentInjector);
  private readonly preloadedCollections = new Set<string>();

  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (route.canActivate?.length) return of(null);

    const sources: Observable<unknown>[] = [load()];

    if (route.data?.["preloadConfigs"]) {
      for (const config of route.data["preloadConfigs"] as ServiceConfig<Base>[]) {
        const source = this.preloadCollection(config);
        if (source) sources.push(source);
      }
    }

    if (route.providers) {
      const providers = route.providers as { provide?: unknown; useValue?: ServiceConfig<Base> }[];
      const collection = providers.find(provider => provider.provide === SERVICE_CONFIG)?.useValue?.collection;

      const config = providers.find(provider => provider.provide === SERVICE_CONFIG)?.useValue;
      if (config && collection) {
        const source = this.preloadCollection(config);
        if (source) sources.push(source);
      }
    }

    return forkJoin(sources);
  }

  private preloadCollection(config: ServiceConfig<Base>): Observable<unknown> | null {
    if (this.preloadedCollections.has(config.collection)) return null;

    this.preloadedCollections.add(config.collection);
    return CrudService.forCollection(this.parentInjector, config)
      .items()
      .pipe(
        take(1),
        timeout(5000),
        catchError(() => {
          this.preloadedCollections.delete(config.collection);
          return of(null);
        }),
      );
  }
}
