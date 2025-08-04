import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map } from 'rxjs';

interface Dept {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
  departmentId: number;
}

@Injectable({
  providedIn: 'root',
})
export class Location {
  private deptUrl =
    'https://raw.githubusercontent.com/proyecto26/colombia/master/departments.json';
  private cityUrl =
    'https://raw.githubusercontent.com/proyecto26/colombia/master/cities.json';

  constructor(private http: HttpClient) {}

  getDepartamentosYMunicipios() {
    return forkJoin({
      depts: this.http.get<any>(this.deptUrl),
      cities: this.http.get<any>(this.cityUrl),
    }).pipe(
      map(({ depts, cities }) => {
        const departamentos = Array.isArray(depts.data) ? depts.data : depts;
        const ciudades = Array.isArray(cities.data) ? cities.data : cities;
        return departamentos.map((d: any) => ({
          departamento: d.name,
          ciudades: ciudades
            .filter((c: any) => c.departmentId === d.id)
            .map((c: any) => c.name)
            .sort(),
        }));
      })
    );
  }
}
