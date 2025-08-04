import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ReservationService } from '../../services/reservation-service';
import { ReservationResponse } from '../../../models/ReservationResponse.model';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-host-reservas',
  standalone: true, // <----- Esto es obligatorio para usar `imports` aquí

  imports: [CommonModule, RouterModule],
  templateUrl: './host-reservas.html',
  styleUrls: ['./host-reservas.css'],
})
export class HostReservas implements OnInit, OnDestroy {
  reservas: ReservationResponse[] = [];
  loading: boolean = true;

  private routerSubscription!: Subscription;

  idString: any = localStorage.getItem('idUser');
  userId: number = this.idString !== null ? +this.idString : 0;

  constructor(
    private reservaService: ReservationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarReservas();

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.urlAfterRedirects.includes('/host/reservas-recibidas')) {
          this.cargarReservas();
          this.cdr.detectChanges();
        }
      }
    });
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  cargarReservas() {
    this.loading = true;
    this.reservaService.obtenerReservasParaHost(this.userId).subscribe({
      next: (data) => {
        this.reservas = data.map((r: any) => ({
          ...r,
          startDate: this.convertirFecha(r.startDate),
          endDate: this.convertirFecha(r.endDate),
        }));
        this.cdr.detectChanges();

        console.log('Reservas cargadas:', this.reservas);
        setTimeout(() => {
          this.loading = false;
        });
      },
      error: (err) => {
        console.error('Error cargando reservas:', err);
        setTimeout(() => {
          this.loading = false;
        });
      },
    });
  }

  aceptarReserva(reservaId: number) {
    this.reservaService
      .actualizarEstadoReserva(reservaId, 'CONFIRMED')
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '¡Reserva aceptada!',
            timer: 1500,
            showConfirmButton: false,
          });
          this.cargarReservas(); // recarga las reservas después del alert
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al aceptar la reserva',
            text: err.message || 'Intenta de nuevo',
          });
        },
      });
  }

  rechazarReserva(reservaId: number) {
    this.reservaService
      .actualizarEstadoReserva(reservaId, 'CANCELLED')
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Reserva rechazada',
            timer: 1500,
            showConfirmButton: false,
          });
          this.cargarReservas(); // recarga las reservas después del alert
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al rechazar la reserva',
            text: err.message || 'Intenta de nuevo',
          });
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
