import { importProvidersFrom, NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { roleGuard } from './auth/role-guard';
import { AuthGuard } from './auth/auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home').then((m) => m.Home),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/user/registerUsers/register').then(
        (m) => m.RegisterComponent
      ),
  },

  // ADMIN
  {
    path: 'admin',
    loadComponent: () =>
      import('./components/admin/admin').then((m) => m.Admin),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/admin/admin-dashboard/admin-dashboard').then(
            (m) => m.AdminDashboard
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./components/admin/admin-users/admin-users').then(
            (m) => m.AdminUsers
          ),
      },
      {
        path: 'properties',
        loadComponent: () =>
          import('./components/admin/admin-properties/admin-properties').then(
            (m) => m.AdminProperties
          ),
      },
      {
        path: 'reservations',
        loadComponent: () =>
          import(
            './components/admin/admin-reservations/admin-reservations'
          ).then((m) => m.AdminReservations),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./components/admin/admin-settings/admin-settings').then(
            (m) => m.AdminSettings
          ),
      },
    ],
  },

  // HOST
  {
    path: 'host',
    loadComponent: () =>
      import('./components/host/host-component/host-component').then(
        (m) => m.HostComponent
      ),
    canActivate: [roleGuard],
    data: { roles: ['HOST'] },
    children: [
      { path: '', redirectTo: 'properties', pathMatch: 'full' },
      {
        path: 'properties',
        loadComponent: () =>
          import('./components/host/host-properties/host-properties').then(
            (m) => m.HostProperties
          ),
      },
      {
        path: 'mis-propiedades/nueva',
        loadComponent: () =>
          import('./components/host/property-create/property-create').then(
            (m) => m.PropertyCreate
          ),
      },
      {
        path: 'mis-propiedades/editar/:id',
        loadComponent: () =>
          import('./components/host/property-create/property-create').then(
            (m) => m.PropertyCreate
          ),
      },
      {
        path: 'reservas',
        loadComponent: () =>
          import('./components/host/host-reservas/host-reservas').then(
            (m) => m.HostReservas
          ),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import(
            './components/client/configuracion-perfil-component/configuracion-perfil-component'
          ).then((m) => m.ConfiguracionPerfilComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'mensajes',
        loadComponent: () =>
          import('./components/chat/chat').then((m) => m.Chat),
      },
      {
        path: 'mensajes/:receiverId',
        loadComponent: () =>
          import('./components/chat/chat').then((m) => m.Chat),
      },
    ],
  },

  // CLIENT
  {
    path: 'client',
    loadComponent: () =>
      import('./components/client/client-component/client-component').then(
        (m) => m.ClientComponent
      ),
    canActivate: [roleGuard],
    data: { roles: ['CLIENT'] },
    children: [
      { path: '', redirectTo: 'listado', pathMatch: 'full' },
      {
        path: 'listado',
        loadComponent: () =>
          import(
            './components/client/client-properties-list/client-properties-list'
          ).then((m) => m.ClientPropertiesList),
      },
      {
        path: 'mis-reservas',
        loadComponent: () =>
          import('./components/client/my-reservation/my-reservations').then(
            (m) => m.MyReservationsComponent
          ),
      },
      {
        path: 'favoritos',
        loadComponent: () =>
          import('./components/client/favorite-component/favorites').then(
            (m) => m.Favorites
          ),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import(
            './components/client/configuracion-perfil-component/configuracion-perfil-component'
          ).then((m) => m.ConfiguracionPerfilComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'propiedad/:id',
        loadComponent: () =>
          import(
            './components/properties/property-detail/property-detail'
          ).then((m) => m.PropertyDetail),
      },
      {
        path: 'mensajes',
        loadComponent: () =>
          import('./components/chat/chat').then((m) => m.Chat),
      },
      {
        path: 'mensajes/:receiverId',
        loadComponent: () =>
          import('./components/chat/chat').then((m) => m.Chat),
      },
    ],
  },

  // Ruta no encontrada (opcional)
  {
    path: '**',
    redirectTo: '',
  },
];

export const appRoutingProviders = [
  importProvidersFrom(
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      onSameUrlNavigation: 'reload',
      preloadingStrategy: PreloadAllModules,
    })
  ),
];
