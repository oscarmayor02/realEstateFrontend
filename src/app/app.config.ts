import {
  ApplicationConfig,
  importProvidersFrom,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
// Importa tipos y funciones para configurar la aplicación Angular, manejo global de errores y detección de cambios sin zone.js

import { provideRouter } from '@angular/router';
// Permite configurar el sistema de rutas de Angular

import { routes } from './app.routes';
// Importa las rutas definidas para la aplicación

import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
// Funciones para soportar la rehidratación del lado del cliente (SSR/SSG) y reenvío de eventos

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TokenInterceptor } from './components/services/token.interceptor';
import { NgChartsModule } from 'ng2-charts';

// Proveedor para habilitar HttpClient en la aplicación

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), // Maneja errores globales en el navegador
    provideHttpClient(), // Habilita el servicio HttpClient para peticiones HTTP
    provideZonelessChangeDetection(), // Usa detección de cambios sin zone.js para mejor rendimiento
    provideRouter(routes), // Configura el sistema de rutas con las rutas importadas
    provideClientHydration(withEventReplay()), // Habilita la rehidratación del cliente y reenvío de eventos (SSR/SSG)
    provideHttpClient(withInterceptors([TokenInterceptor])),
    importProvidersFrom(NgChartsModule), // ✅ importante si la app es 100% standalone

    { provide: LOCALE_ID, useValue: 'es' },
    // Proporciona el idioma local para la aplicación
  ],
};
