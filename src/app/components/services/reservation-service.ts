import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReservationRequest } from '../../models/ReservationRequest.model';
import { Observable } from 'rxjs';
import { ReservationResponse } from '../../models/ReservationResponse.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private apiUrl = 'http://localhost:8080/api/reservations';

  constructor(private http: HttpClient) {}

  createReservation(reservation: ReservationRequest): Observable<any> {
    return this.http.post(this.apiUrl, reservation);
  }

  getAllReservations(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Método para obtener reservas de un host específico
  obtenerReservasParaHost(hostId: number): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(
      `${this.apiUrl}/host/${hostId}`
    );
  }

  obtenerReservasParaCliente(
    clientId: number
  ): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(
      `${this.apiUrl}/client/${clientId}`
    );
  }

  // Si quieres agregar método para actualizar estado reserva
  actualizarEstadoReserva(reservaId: number, nuevoEstado: string) {
    return this.http.patch<ReservationResponse>(
      `${this.apiUrl}/${reservaId}/status?status=${nuevoEstado}`,
      {}
    );
  }
}
