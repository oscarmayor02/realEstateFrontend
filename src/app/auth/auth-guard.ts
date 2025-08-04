import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: '🔒 ¡Acceso solo para miembros!',
        html: `
          <b>Inicia sesión</b> para descubrir todos los detalles de esta propiedad.<br>
          <span style="color:#0d6efd;">¡Encuentra tu lugar ideal hoy!</span>
        `,
        confirmButtonText: 'Iniciar sesión',
        background: '#f8f9fa',
        customClass: {
          title: 'fw-bold text-primary',
        },
      }).then(() => {
        this.router.navigate(['/']); // O a /login si existe
      });
      return false;
    }
    return true;
  }
}
