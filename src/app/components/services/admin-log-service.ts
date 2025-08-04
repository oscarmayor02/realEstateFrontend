import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AdminLog } from '../../models/AdminLog.model';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminLogService {
  // private apiUrl = 'http://localhost:8080/api/admin/logs';
  private apiUrl = `${environment.apiBaseUrl}/admin/logs`;
  constructor(private http: HttpClient) {}

  getLogs(): Observable<AdminLog[]> {
    return this.http.get<AdminLog[]>(this.apiUrl);
  }
}
