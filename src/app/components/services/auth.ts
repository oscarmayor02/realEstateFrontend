import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../enviroments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http
      .post(
        `${environment.apiBaseUrl}/auth/login?email=${email}&password=${password}`,
        {},
        { responseType: 'text' }
      )
      .pipe(
        tap((token: string) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            try {
              const payload = token.split('.')[1];
              const decoded = JSON.parse(atob(payload));
              if (decoded && decoded.idUser) {
                localStorage.setItem('idUser', decoded.idUser);
              }
            } catch (error) {
              console.error('Error al decodificar token:', error);
            }
          }
        })
      );
  }

  getUserInfoFromToken(): any | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const user = this.getUserInfoFromToken();
    if (!user || !user.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return user.exp < now;
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('idUser');
    }
  }

  isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  getRoles(): string[] {
    const user = localStorage.getItem('user');
    if (!user) return [];

    try {
      const parsed = JSON.parse(user);
      return parsed.roles || [];
    } catch (error) {
      return [];
    }
  }
}
