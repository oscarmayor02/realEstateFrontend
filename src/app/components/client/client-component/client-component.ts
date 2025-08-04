import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarCliente } from '../sidebar-cliente/sidebar-cliente';
import { PrivateNavbar } from '../../private-navbar/private-navbar';
import { PropertyFilters } from '../../properties/property-filters/property-filters';
import { FeaturedProperties } from '../../properties/featured-properties/featured-properties';
import { Property } from '../../services/property';
import { PropertyState } from '../../services/property-state';
import { Location } from '../../services/location';
import { PropertyMap } from '../../properties/property-map/property-map';

@Component({
  selector: 'app-client-component',
  imports: [
    CommonModule, // Importa CommonModule para usar directivas comunes de Angular (ngIf, ngFor, etc.)
    RouterModule,
    SidebarCliente,
  ], // 👈 AGREGA RouterModule aquí
  templateUrl: './client-component.html',
  styleUrl: './client-component.css',
})
export class ClientComponent {
  departamentos: any[] = [];
  ciudades: string[] = [];
  isMenuOpen = false;
  window: number = window.innerWidth;
  onToggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  constructor(
    private propertyService: Property,
    private propertyState: PropertyState,
    private locationService: Location
  ) {}
}
