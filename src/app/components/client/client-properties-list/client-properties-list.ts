import { ChangeDetectorRef, Component } from '@angular/core';
import { PropertyMap } from '../../properties/property-map/property-map';
import { FeaturedProperties } from '../../properties/featured-properties/featured-properties';
import { PropertyFilters } from '../../properties/property-filters/property-filters';
import { Property } from '../../services/property';
import { PropertyState } from '../../services/property-state';
import { Location } from '../../services/location';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-properties-list',
  standalone: true,
  imports: [PropertyMap, FeaturedProperties, PropertyFilters, CommonModule],
  templateUrl: './client-properties-list.html',
  styleUrls: ['./client-properties-list.css'],
})
export class ClientPropertiesList {
  departamentos: any[] = [];
  ciudades: string[] = [];

  departamentoSeleccionado: string | null = null;
  ciudadSeleccionada: string | null = null;

  ubicacionSeleccionada: string = '';

  constructor(
    private propertyService: Property,
    private propertyState: PropertyState,
    private locationService: Location,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.locationService.getDepartamentosYMunicipios().subscribe((data) => {
      this.departamentos = data;
      this.cdr.detectChanges();
      console.log('Departamentos y ciudades cargados:', this.departamentos);
    });

    this.onSearch({});
  }

  onSearch(filtros: any) {
    this.propertyService.searchProperties(filtros).subscribe((properties) => {
      console.log('Propiedades encontradas:', properties);
      this.propertyState.setProperties(properties);
      this.cdr.detectChanges();
    });
  }

  moverMapa(ubicacion: string) {
    this.ubicacionSeleccionada = ubicacion;

    // Verificar si ubicacion es departamento o ciudad
    const deptoEncontrado = this.departamentos.find(
      (d) => d.departamento === ubicacion
    );
    if (deptoEncontrado) {
      this.departamentoSeleccionado = ubicacion;
      this.ciudadSeleccionada = null;
      this.ciudades = deptoEncontrado.ciudades || [];
    } else if (this.departamentoSeleccionado) {
      // Si es ciudad dentro del departamento seleccionado
      if (this.ciudades.includes(ubicacion)) {
        this.ciudadSeleccionada = ubicacion;
      } else {
        this.ciudadSeleccionada = null;
      }
    } else {
      this.departamentoSeleccionado = null;
      this.ciudadSeleccionada = null;
    }

    this.cdr.detectChanges();
  }

  irAPublicarPropiedad() {
    this.router.navigate(['/client/publicar-propiedad']);
  }
}
