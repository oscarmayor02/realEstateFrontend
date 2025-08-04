import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Property } from '../services/property';
import { PropertyState } from '../services/property-state';
import { Location } from '../services/location';
import { CommonModule } from '@angular/common';
import { PropertyFilters } from '../properties/property-filters/property-filters';

@Component({
  selector: 'app-hero-search',
  imports: [ReactiveFormsModule, CommonModule, PropertyFilters],
  templateUrl: './hero-search.html',
  styleUrl: './hero-search.css',
})
export class HeroSearch {
  departamentos: any[] = [];
  ciudades: string[] = [];
  constructor(
    private propertyService: Property,
    private propertyState: PropertyState,
    private locationService: Location
  ) {}

  ngOnInit(): void {
    this.locationService.getDepartamentosYMunicipios().subscribe((data) => {
      this.departamentos = data;
      console.log('Departamentos y ciudades cargados:', this.departamentos);
    });
  }

  onSearch(filtros: any) {
    // Aquí puedes llamar al servicio y actualizar el estado global
    this.propertyService.searchProperties(filtros).subscribe((properties) => {
      console.log('Propiedades encontradas:', properties);
      this.propertyState.setProperties(properties);
    });
  }
}
