import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { Auth } from './auth';

export const TokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const authService = inject(Auth);
  const token = authService.getToken();

  // Lista de rutas públicas a las que NO se debe enviar el token
  const publicEndpoints = [
    '/api/properties/available',
    '/api/properties/filter',
    '/api/auth',
    'https://raw.githubusercontent.com/proyecto26/colombia/master/departments.json',
    'https://raw.githubusercontent.com/proyecto26/colombia/master/cities.json',
  ];

  // Verifica si la URL actual contiene alguna de las rutas públicas
  const isPublic = publicEndpoints.some((publicUrl) =>
    req.url.includes(publicUrl)
  );

  // Si hay token y la ruta no es pública, añadir el token al header
  if (token && !isPublic) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  // Si la ruta es pública o no hay token, seguir sin modificar la request
  return next(req);
};
