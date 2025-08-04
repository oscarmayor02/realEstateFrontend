import { Injectable } from '@angular/core'; // Permite que la clase sea inyectable como servicio en Angular
import { HttpClient } from '@angular/common/http'; // Servicio de Angular para hacer peticiones HTTP
import { map, Observable } from 'rxjs'; // Permite trabajar con datos asíncronos (peticiones HTTP)
import { environment } from '../../../enviroments/environment'; // Importa las variables de entorno (por ejemplo, la URL base de la API)
import { PropertyResponse } from '../../models/PropertyResponse.model';

@Injectable({
  providedIn: 'root', // Hace que el servicio esté disponible en toda la aplicación (singleton)
})
export class Property {
  // URL base para las peticiones relacionadas con propiedades disponibles
  private apiUrl = `${environment.apiBaseUrl}/properties`;

  // Constructor que inyecta el servicio HttpClient para hacer peticiones HTTP
  constructor(private http: HttpClient) {}

  // Obtiene todas las propiedades disponibles (GET)

  getAllProperties(): Observable<PropertyResponse[]> {
    return this.http.get<PropertyResponse[]>(`${this.apiUrl}/available`).pipe(
      map((properties) =>
        properties.map((p) => ({
          ...p,
          createdAt: p.createdAt ? new Date(p.createdAt as any) : null,
        }))
      )
    );
  }
  // Obtiene una propiedad específica por su ID (GET)
  getPropertyById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Busca propiedades según un query (GET con parámetros)
  searchProperties(query: any): Observable<any[]> {
    console.log(query);

    return this.http.get<any[]>(`${this.apiUrl}/filter`, { params: query });
  }

  // Crea una nueva propiedad enviando un FormData (POST)
  saveProperty(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  updateProperty(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  deleteProperty(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
