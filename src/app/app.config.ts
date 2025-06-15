import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core'; 
// Importa tipos y funciones para configurar la aplicación Angular, manejo global de errores y detección de cambios sin zone.js

import { provideRouter } from '@angular/router'; 
// Permite configurar el sistema de rutas de Angular

import { routes } from './app.routes'; 
// Importa las rutas definidas para la aplicación

import { provideClientHydration, withEventReplay } from '@angular/platform-browser'; 
// Funciones para soportar la rehidratación del lado del cliente (SSR/SSG) y reenvío de eventos

import { provideHttpClient } from '@angular/common/http'; 
// Proveedor para habilitar HttpClient en la aplicación

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), // Maneja errores globales en el navegador
    provideHttpClient(),                  // Habilita el servicio HttpClient para peticiones HTTP
    provideZonelessChangeDetection(),     // Usa detección de cambios sin zone.js para mejor rendimiento
    provideRouter(routes),                // Configura el sistema de rutas con las rutas importadas
    provideClientHydration(withEventReplay()) // Habilita la rehidratación del cliente y reenvío de eventos (SSR/SSG)
  ]
};