import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { ReservationResponse } from '../../../models/ReservationResponse.model';
import { ReservationService } from '../../services/reservation-service';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-reservations.html',
  styleUrls: ['./my-reservations.css'],
})
export class MyReservationsComponent implements OnInit {
  reservas: ReservationResponse[] = [];
  loading: boolean = true;

  idString: any = localStorage.getItem('idUser');
  clientId: number = this.idString !== null ? +this.idString : 0;

  constructor(
    private reservaService: ReservationService,
    private cdr: ChangeDetectorRef // <--- inyectar
  ) {}

  ngOnInit(): void {
    this.cargarReservas();
    this.cdr.detectChanges(); // <--- forzar actualización
  }

  cargarReservas() {
    this.loading = true;
    this.reservaService.obtenerReservasParaCliente(this.clientId).subscribe({
      next: (data) => {
        console.log(data);

        this.reservas = data.map((r: any) => ({
          ...r,
          startDate: this.convertirFecha(r.startDate),
          endDate: this.convertirFecha(r.endDate),
        }));
        this.cdr.detectChanges(); // <--- forzar actualización
      },
      error: (err) => {
        console.error('Error cargando reservas del cliente:', err);
        setTimeout(() => (this.loading = false));
      },
    });
  }

  convertirFecha(fecha: any): Date | null {
    if (!fecha) return null;
    if (Array.isArray(fecha)) {
      return new Date(fecha[0], fecha[1] - 1, fecha[2], fecha[3], fecha[4]);
    }
    return new Date(fecha);
  }

  esFechaValida(fecha: any): boolean {
    return fecha instanceof Date && !isNaN(fecha.getTime());
  }
}
