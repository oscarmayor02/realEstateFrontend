import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { User } from '../../models/User.model';
import { ReservationResponse } from '../../models/ReservationResponse.model';
import { PropertyResponse } from '../../models/PropertyResponse.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`).pipe(
      map((users) =>
        users.map((u) => ({
          ...u,
          createdAt:
            u.createdAt && Array.isArray(u.createdAt)
              ? this.parseLocalDateTimeArray(u.createdAt)
              : null,
        }))
      )
    );
  }
  getProperties(): Observable<PropertyResponse[]> {
    return this.http
      .get<PropertyResponse[]>(`${this.baseUrl}/properties/available`)
      .pipe(
        map((properties) =>
          properties.map((p) => ({
            ...p,
            createdAt: Array.isArray(p.createdAt)
              ? this.parseLocalDateTimeArray(p.createdAt)
              : typeof p.createdAt === 'string'
              ? new Date(p.createdAt)
              : null,
          }))
        )
      );
  }

  getReservations(): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(`${this.baseUrl}/reservations`);
  }

  getDashboardData() {
    return forkJoin({
      users: this.getUsers(),
      properties: this.getProperties(),
      reservations: this.getReservations(),
    }).pipe(
      map(({ users, properties, reservations }) => {
        const propertiesCountByUser = properties.reduce<Record<number, number>>(
          (acc, prop) => {
            const userId = prop.host?.id;
            if (!userId) return acc;
            acc[userId] = (acc[userId] ?? 0) + 1;
            return acc;
          },
          {}
        );

        const approvedReservations = reservations.filter(
          (r) => r.status === 'CONFIRMED'
        );
        const approvalRate = reservations.length
          ? (approvedReservations.length / reservations.length) * 100
          : 0;

        const earningsByUser = approvedReservations.reduce<
          Record<number, number>
        >((acc, res) => {
          const prop = properties.find((p) => p.id === res.propertyId);
          if (!prop || !prop.host?.id) return acc;
          const userId = prop.host.id;
          acc[userId] = (acc[userId] ?? 0) + prop.price;
          return acc;
        }, {});

        const userRolesCount = users.reduce<Record<string, number>>(
          (acc, user) => {
            acc[user.role ?? 'Client'] = (acc[user.role ?? 'Client'] ?? 0) + 1;
            return acc;
          },
          {}
        );

        // Fecha actual y hace 12 meses atrás para filtrar datos
        const now = new Date();
        const startYear = now.getFullYear();
        const startMonth = now.getMonth();

        // Inicializar arreglos para los últimos 12 meses (enero=0)
        const monthlyProperties = new Array(12).fill(0);
        const monthlyReservations = new Array(12).fill(0);

        // Función para obtener índice mes relativo al año actual (0-11)
        const getMonthIndex = (date: Date) => {
          if (date.getFullYear() === startYear) return date.getMonth();
          // Si quieres considerar años anteriores, adapta esto
          return -1; // fuera de rango
        };

        // Contar propiedades por mes basado en createdAt
        for (const prop of properties) {
          console.log('Property createdAt:', prop);

          let createdAt: Date | null = null;

          if (prop.createdAt && Array.isArray(prop.createdAt)) {
            createdAt = this.parseLocalDateTimeArray(prop.createdAt);
          } else if (typeof prop.createdAt === 'string') {
            createdAt = new Date(prop.createdAt);
          } else if (prop.createdAt instanceof Date) {
            createdAt = prop.createdAt;
          }

          console.log('Parsed createdAt:', createdAt);

          if (createdAt && !isNaN(createdAt.getTime())) {
            const idx = getMonthIndex(createdAt);
            console.log(
              `Propiedad creada en ${createdAt.toISOString()}, índice mes: ${idx}`
            );

            if (idx >= 0 && idx < 12) {
              monthlyProperties[idx]++;
            }
          }
        }

        // Contar reservas por mes basado en startDate
        for (const res of reservations) {
          let startDate: Date | null = null;
          if (res.startDate && Array.isArray(res.startDate)) {
            startDate = this.parseLocalDateTimeArray(res.startDate);
          } else if (typeof res.startDate === 'string') {
            startDate = new Date(res.startDate);
          }

          if (startDate) {
            const idx = getMonthIndex(startDate);
            if (idx >= 0 && idx < 12) {
              monthlyReservations[idx]++;
            }
          }
        }

        // Contar usuarios registrados por mes
        const usersPerMonth = new Array(12).fill(0);
        for (const user of users) {
          const createdAt = new Date(user.createdAt ?? '');
          if (!isNaN(createdAt.getTime())) {
            const month = createdAt.getMonth();
            usersPerMonth[month]++;
          }
        }

        return {
          totalUsers: users.length,
          totalProperties: properties.length,
          totalReservations: reservations.length,
          approvedReservations: approvedReservations.length,
          approvalRate,
          propertiesCountByUser,
          earningsByUser,
          users,
          properties,
          reservations,
          userRolesCount,
          monthlyRegistrations: usersPerMonth,
          monthlyProperties,
          monthlyReservations,
          usersPerMonth,
        };
      })
    );
  }

  parseLocalDateTimeArray(arr: number[]): Date {
    if (!arr || !Array.isArray(arr) || arr.length < 7) {
      return null!;
    }
    return new Date(
      arr[0],
      arr[1] - 1,
      arr[2],
      arr[3],
      arr[4],
      arr[5],
      Math.floor(arr[6] / 1_000_000)
    );
  }
}
