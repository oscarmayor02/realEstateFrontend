import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalParameter } from '../../models/GlobalParameter.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminParameterService {
  private apiUrl = 'http://localhost:8080/api/admin/parameters';

  constructor(private http: HttpClient) {}

  getParameters(): Observable<GlobalParameter> {
    return this.http.get<GlobalParameter>(this.apiUrl);
  }

  updateParameters(params: GlobalParameter): Observable<GlobalParameter> {
    return this.http.put<GlobalParameter>(this.apiUrl, params);
  }
}
