import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ReservationService } from '../../services/reservation-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationResponse } from '../../../models/ReservationResponse.model';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-reservations.html',
  styleUrl: './admin-reservations.css',
})
export class AdminReservations implements OnInit {
  reservations: ReservationResponse[] = [];
  filteredReservations: ReservationResponse[] = [];
  searchQuery: string = '';
  filterStatus: string = '';

  stats = [
    { title: 'Total', value: 0 },
    { title: 'Pendientes', value: 0 },
    { title: 'Confirmadas', value: 0 },
    { title: 'Canceladas', value: 0 },
  ];

  constructor(
    private reservationService: ReservationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReservations();
    this.cdr.detectChanges();
  }

  loadReservations(): void {
    this.reservationService.getAllReservations().subscribe((data) => {
      console.log('Reservas cargadas:', data);

      this.reservations = data;
      this.applyFilters();
      this.calculateStats();
      this.cdr.detectChanges();
    });
  }

  applyFilters(): void {
    this.filteredReservations = this.reservations.filter((r) => {
      const search = this.searchQuery.toLowerCase();
      const matchesSearch =
        r.clientName.toLowerCase().includes(search) ||
        r.propertyTitle.toLowerCase().includes(search) ||
        r.propertyAddress.toLowerCase().includes(search);

      const matchesStatus = this.filterStatus
        ? r.status === this.filterStatus
        : true;

      return matchesSearch && matchesStatus;
    });
  }

  calculateStats(): void {
    this.stats[0].value = this.reservations.length;
    this.stats[1].value = this.reservations.filter(
      (r) => r.status === 'PENDING'
    ).length;
    this.stats[2].value = this.reservations.filter(
      (r) => r.status === 'CONFIRMED'
    ).length;
    this.stats[3].value = this.reservations.filter(
      (r) => r.status === 'CANCELLED'
    ).length;
  }

  confirmReservation(id: number) {
    this.reservationService
      .actualizarEstadoReserva(id, 'CONFIRMED')
      .subscribe(() => {
        this.loadReservations();
        this.cdr.detectChanges();
      });
  }

  cancelReservation(id: number) {
    this.reservationService
      .actualizarEstadoReserva(id, 'CANCELLED')
      .subscribe(() => {
        this.loadReservations();
        this.cdr.detectChanges();
      });
  }
}
