import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/environment';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  // private apiUrl = 'http://localhost:8080/api/favorites';
  private apiUrl = `${environment.apiBaseUrl}/favorites`;
  constructor(private http: HttpClient) {}

  getFavoritesByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}`);
  }

  addFavorite(userId: number, propertyId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}?userId=${userId}&propertyId=${propertyId}`,
      {}
    );
  }

  removeFavorite(userId: number, propertyId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}?userId=${userId}&propertyId=${propertyId}`
    );
  }
}
