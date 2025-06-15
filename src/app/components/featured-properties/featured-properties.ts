import { CommonModule } from '@angular/common'; // Importa CommonModule para usar directivas comunes de Angular (ngIf, ngFor, etc.)
import { Component } from '@angular/core'; // Importa el decorador Component para definir el componente
import { Property } from '../services/property'; // Importa el servicio Property para obtener datos de propiedades

@Component({
  standalone: true, // Indica que este componente es standalone (no necesita estar en un NgModule)
  selector: 'app-featured-properties', // Nombre del selector para usar este componente en HTML
  imports: [
    CommonModule // Importa CommonModule para usar directivas estructurales en la plantilla
  ],
  templateUrl: './featured-properties.html', // Ruta al archivo de plantilla HTML del componente
  styleUrl: './featured-properties.css' // Ruta al archivo de estilos CSS del componente
})
export class FeaturedProperties {
  properties: any[] = []; // Arreglo para almacenar las propiedades destacadas

  constructor(private propertyService: Property) {
    this.loadProperties(); // Llama al método para cargar las propiedades al inicializar el componente
  } // Inyecta el servicio Property para acceder a los métodos de API

  // Método para cargar las propiedades destacadas desde el servicio
  loadProperties(): void {
    this.propertyService.getAllProperties().subscribe({
      next: (res) => this.properties = res, // Asigna la respuesta al arreglo properties
      complete: () => console.log('Properties loaded successfully', this.properties), // Mensaje cuando termina la carga
      error: (err) => console.error('Error loading properties', err) // Muestra error si ocurre
    });
  }
}