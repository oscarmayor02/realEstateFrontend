import { Injectable } from '@angular/core'; // Permite que la clase sea inyectable como servicio en Angular
import { HttpClient } from '@angular/common/http'; // Servicio de Angular para hacer peticiones HTTP
import { Observable } from 'rxjs'; // Permite trabajar con datos asíncronos (peticiones HTTP)
import { environment } from '../../../enviroments/environment'; // Importa las variables de entorno (por ejemplo, la URL base de la API)

@Injectable({
  providedIn: 'root' // Hace que el servicio esté disponible en toda la aplicación (singleton)
})
export class Property {

  // URL base para las peticiones relacionadas con propiedades disponibles
  private apiUrl = `${environment.apiBaseUrl}/properties/available`;

  // Constructor que inyecta el servicio HttpClient para hacer peticiones HTTP
  constructor(private http: HttpClient) { }
  
  // Obtiene todas las propiedades disponibles (GET)
  getAllProperties(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Obtiene una propiedad específica por su ID (GET)
  getPropertyById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Busca propiedades según un query (GET con parámetros)
  searchProperties(query: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search`, { params: query });
  }

  // Crea una nueva propiedad enviando un FormData (POST)
  createProperty(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }
}