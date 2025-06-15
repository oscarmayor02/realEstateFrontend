import { Injectable } from '@angular/core'; // Permite que la clase sea inyectable como servicio en Angular
import { environment } from '../../../enviroments/environment'; // Importa las variables de entorno (por ejemplo, la URL base de la API)
import { HttpClient } from '@angular/common/http'; // Servicio de Angular para hacer peticiones HTTP
import { Observable, tap } from 'rxjs'; // Observable para manejar respuestas asíncronas y tap para ejecutar efectos secundarios

@Injectable({
  providedIn: 'root' // Hace que el servicio esté disponible en toda la aplicación (singleton)
})
export class Auth {

  constructor(private http: HttpClient) { } // Inyecta el servicio HttpClient para hacer peticiones HTTP

  // Método para iniciar sesión. Recibe email y password, retorna un Observable de la respuesta.
  login(email: string, password: string): Observable<any> {
    // Hace una petición POST a la API de login, enviando email y password.
    // Espera que la respuesta tenga un campo 'token'.
    return this.http.post<{ token: string }>(`${environment.apiBaseUrl}/auth/login`, { email, password })
      .pipe(
        // Cuando recibe la respuesta, guarda el token en localStorage.
        tap(response => {
          localStorage.setItem('token', response.token);
        })
      );
  }

  // Método para cerrar sesión. Elimina el token del localStorage.
  logout() {
    localStorage.removeItem('token');
  }

  // Método para obtener el token almacenado en localStorage.
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Método para saber si el usuario está logueado (si existe un token).
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}