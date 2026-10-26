import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // HttpClient para llamar a POST /api/chat; withFetch usa la API fetch del navegador.
    provideHttpClient(withFetch()),
  ],
};
