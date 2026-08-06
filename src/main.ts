import { provideCloudinaryLoader } from "@angular/common";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from "@angular/fire/analytics";
import { getApp, initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { initializeAppCheck, provideAppCheck, ReCaptchaEnterpriseProvider } from "@angular/fire/app-check";
import { getAuth, provideAuth } from "@angular/fire/auth";
import { getFirestore, provideFirestore } from "@angular/fire/firestore";
import { bootstrapApplication } from "@angular/platform-browser";
import { PreloadAllModules, provideRouter, withComponentInputBinding, withInMemoryScrolling, withPreloading, withViewTransitions } from "@angular/router";
import { ConfirmationService, MessageService } from "@openng/optimus-ui/api";
import { provideOptimus } from "@openng/optimus-ui/config";
import { AppComponent, routes } from "./app/app.component";
import { Amber } from "./themes/amber.preset";

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withComponentInputBinding(),
      withViewTransitions(),
      withInMemoryScrolling({
        scrollPositionRestoration: "enabled",
        anchorScrolling: "enabled",
      }),
    ),
    provideHttpClient(withInterceptorsFromDi()),
    provideOptimus({
      theme: { preset: Amber },
      ripple: true,
      overlayAppendTo: "body",
    }),
    ConfirmationService,
    MessageService,
    provideCloudinaryLoader("https://res.cloudinary.com/dsuvd32up"),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: "AIzaSyCK63FPXXdZiLhcEAno8bx3dRnn3TkzZ0A",
        authDomain: "nicolas-paillard.firebaseapp.com",
        databaseURL: "https://nicolas-paillard-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "nicolas-paillard",
        storageBucket: "nicolas-paillard.firebasestorage.app",
        messagingSenderId: "95010764775",
        appId: "1:95010764775:web:e31ecc087cb7e98d5bef42",
        measurementId: "G-TP7L771J2P",
      }),
    ),
    provideAuth(() => getAuth()),
    provideAnalytics(() => getAnalytics()),
    ScreenTrackingService,
    UserTrackingService,
    provideAppCheck(() =>
      initializeAppCheck(getApp(), {
        provider: new ReCaptchaEnterpriseProvider("6Lcwe_kqAAAAAA9b5kizgsjvlZNp1_stQSEc5iSs"),
        isTokenAutoRefreshEnabled: true,
      }),
    ),
    provideFirestore(() => getFirestore()),
  ],
}).catch(err => console.error(err));
