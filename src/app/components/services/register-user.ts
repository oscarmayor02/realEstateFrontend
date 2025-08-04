import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../../models/User.model';
import { map, Observable } from 'rxjs';
import { environment } from '../../../enviroments/environment';
import { UpdateProfileRequest } from '../../models/UpdateProfileRequest.model';
import { ChangePasswordRequest } from '../../models/ChangePasswordRequest.model';

@Injectable({
  providedIn: 'root',
})
export class RegisterUser {
  private apiUrl1 = `${environment.apiBaseUrl}/auth`;
  private apiUrl2 = `${environment.apiBaseUrl}/users`;

  constructor(private http: HttpClient) {}

  register(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl1}/register`, user);
  }

  getUserById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl2}/id/${id}`);
  }

  getUserByEmail(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl2}/${email}`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl2).pipe(
      map((users) =>
        users.map((u) => ({
          ...u,
          createdAt: u.createdAt ? new Date(u.createdAt as any) : null,
        }))
      )
    );
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl2}/${id}`);
  }

  updateUser(id: number, data: UpdateProfileRequest): Observable<any> {
    return this.http.put(`${this.apiUrl2}/${id}`, data);
  }

  changePassword(id: number, data: ChangePasswordRequest): Observable<any> {
    return this.http.put(`${this.apiUrl2}/${id}/password`, data, {
      responseType: 'text',
    });
  }

  updateUserRole(id: number, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl2}/${id}/role?role=${role}`, { role });
  }
}
