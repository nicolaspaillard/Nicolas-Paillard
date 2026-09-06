import { isDevMode } from "@angular/core";
import { AuthGuard, AuthPipe, customClaims, loggedIn } from "@angular/fire/auth-guard";
import { Routes } from "@angular/router";
import { CrudService, SERVICE_CONFIG } from "@services/crud.service";
import { forkJoin, map, mergeMap, Observable, of, pipe } from "rxjs";
import { CONFIG_APPLICATIONS, CONFIG_CATEGORIES, CONFIG_EXPERIENCES, CONFIG_PROFILES, CONFIG_PROJECTS, CONFIG_SECTIONS, CONFIG_SKILLS } from "./shared/route.configs";

const combined: AuthPipe = pipe(
  mergeMap(user => (user ? forkJoin([loggedIn(of(user)) as Observable<boolean>, customClaims(of(user)) as Observable<{ admin?: boolean }>]) : of([false, {}] as [boolean, { admin?: boolean }]))),
  map(([isLoggedIn, claims]: [boolean, { admin?: boolean }]) => (isLoggedIn && claims.admin ? true : false)),
);

export const routes: Routes = [
  {
    path: "",
    title: "Nicolas Paillard",
    loadComponent: () => import("@routes/home/home.component").then(m => m.HomeComponent),
    providers: [CrudService, { provide: SERVICE_CONFIG, useValue: CONFIG_SECTIONS }],
    data: { animation: 0 },
  },
  {
    path: "career",
    title: "Carrière",
    loadComponent: () => import("@routes/career/career.component").then(m => m.CareerComponent),
    providers: [CrudService, { provide: SERVICE_CONFIG, useValue: CONFIG_EXPERIENCES }],
    data: { animation: 1 },
  },
  {
    path: "skills",
    title: "Compétences",
    loadComponent: () => import("@routes/skills/skills.component").then(m => m.SkillsComponent),
    providers: [CrudService, { provide: SERVICE_CONFIG, useValue: CONFIG_CATEGORIES }],
    data: { animation: 2, preloadConfigs: [CONFIG_SKILLS] },
  },
  {
    path: "projects",
    title: "Projets",
    loadComponent: () => import("@routes/projects/projects.component").then(m => m.ProjectsComponent),
    providers: [CrudService, { provide: SERVICE_CONFIG, useValue: CONFIG_PROJECTS }],
    data: { animation: 3 },
  },
  ...(isDevMode()
    ? [
        {
          path: "pdfmake",
          title: "PdfMake",
          loadComponent: () => import("@routes/pdfmake/pdfmake.component").then(m => m.PdfmakeComponent),
          canActivate: [AuthGuard],
          data: { animation: 4, authGuardPipe: () => combined },
        },
      ]
    : []),
  {
    path: "applications",
    title: "Candidatures",
    loadComponent: () => import("@routes/applications/applications.component").then(m => m.ApplicationsComponent),
    providers: [CrudService, { provide: SERVICE_CONFIG, useValue: CONFIG_APPLICATIONS }],
    canActivate: [AuthGuard],
    data: { animation: 5, authGuardPipe: () => combined },
  },
  {
    path: "profile",
    title: "Profil",
    loadComponent: () => import("@routes/profile/profile.component").then(m => m.ProfileComponent),
    providers: [CrudService, { provide: SERVICE_CONFIG, useValue: CONFIG_PROFILES }],
    canActivate: [AuthGuard],
    data: { animation: 6, authGuardPipe: () => combined },
  },
  { path: "cv", children: [] },
  { path: "**", redirectTo: "" },
];
