import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import Swal from 'sweetalert2';
import { Auth } from '../components/services/auth';

@Injectable({ providedIn: 'root' })
export class roleGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router, private authService: Auth) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return this.checkRole(route, state);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return this.checkRole(route, state);
  }

  private checkRole(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const token = this.authService.getToken();

    // Permitir acceso público al detalle de propiedad cliente sin login
    if (state.url.startsWith('/client/propiedad/')) {
      return true;
    }

    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: 'Acceso restringido',
        text: 'Debes iniciar sesión para acceder a esta sección.',
        confirmButtonText: 'Iniciar sesión',
      }).then(() => this.router.navigate(['/login']));
      return false;
    }

    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      const userRole = decoded.role;

      const allowedRoles = route.data['roles'] as string[] | undefined;

      if (allowedRoles && !allowedRoles.includes(userRole)) {
        Swal.fire({
          icon: 'error',
          title: 'Acceso denegado',
          text: 'No tienes permisos para acceder a esta sección.',
          confirmButtonText: 'Volver',
        }).then(() => this.router.navigate(['/unauthorized']));
        return false;
      }

      return true;
    } catch (error) {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
