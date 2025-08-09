import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Property } from '../../services/property';
import { CommonModule } from '@angular/common';
import { PropertyMap } from '../property-map/property-map';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ReservationService } from '../../services/reservation-service';
import { ReservationRequest } from '../../../models/ReservationRequest.model';
import { Auth } from '../../services/auth';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

declare var bootstrap: any; // para evitar error de TS con bootstrap global

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    PropertyMap,
    NgbModalModule,
    NgbTooltipModule, // <--- Agrega aquí
  ],
  templateUrl: './property-detail.html',
  styleUrls: ['./property-detail.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyDetail implements OnInit, OnDestroy {
  property: any;
  currentImageIndex = 0;
  imageInterval: any;

  @ViewChild('modalReserva') modalReserva!: TemplateRef<any>; // referencia al modal HTML
  selectedSlot: any = null;

  amenitiesList = [
    { key: 'wifi', label: 'Wi-Fi' },
    { key: 'tv', label: 'TV' },
    { key: 'parking', label: 'Parqueadero' },
    { key: 'pool', label: 'Piscina' },
    { key: 'airConditioning', label: 'Aire acondicionado' },
    { key: 'kitchen', label: 'Cocina' },
    { key: 'pets', label: 'Mascotas permitidas' },
    { key: 'balcony', label: 'Balcón' },
  ];

  constructor(
    private route: ActivatedRoute,
    private propertyService: Property,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private serviceReservation: ReservationService,
    private router: Router,
    private auth: Auth // <--- Inyectar aquí
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log(`Cargando propiedad con ID: ${id}`);

    if (id) {
      this.propertyService.getPropertyById(+id).subscribe((res) => {
        console.log('Propiedad cargada:', res);

        this.property = res;
        this.currentImageIndex = 0;
        this.startImageCarousel();
        this.cdr.detectChanges();
      });
    }
  }
  get isLoggedIn(): boolean {
    return this.auth.getToken() !== null;
  }
  ngAfterViewInit(): void {
    // Forzar actualización luego del primer renderizado
    this.cdr.detectChanges();
    // Inicializar tooltips de bootstrap en todos los elementos con data-bs-toggle="tooltip"
    const tooltipTriggerList = Array.from(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );

    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  startImageCarousel(): void {
    if (!this.property?.images?.length) return;
    this.imageInterval = setInterval(() => {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.property.images.length;
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.imageInterval) clearInterval(this.imageInterval);
  }

  hacerReserva(): void {
    if (!this.isLoggedIn) {
      Swal.fire({
        icon: 'warning',
        title: 'Necesitas iniciar sesión',
        text: 'Debes iniciar sesión para poder hacer una reserva.',
        confirmButtonText: 'Iniciar sesión',
      }).then(() => this.router.navigate(['/login']));
      return;
    }

    if (
      !this.property.availabilityList ||
      this.property.availabilityList.length === 0
    ) {
      Swal.fire({
        icon: 'info',
        title: 'Sin disponibilidad',
        text: 'El propietario no tiene disponibilidad registrada, comunícate por chat.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    this.modalService.open(this.modalReserva, { size: 'lg' });
    this.selectedSlot = null;
    this.cdr.markForCheck();
  }

  abrirChat() {
    if (!this.isLoggedIn) {
      Swal.fire({
        icon: 'warning',
        title: 'Necesitas iniciar sesión',
        text: 'Debes iniciar sesión para poder chatear con el propietario.',
        confirmButtonText: 'Iniciar sesión',
      }).then(() => this.router.navigate(['/login']));
      return;
    }

    const currentUserId = localStorage.getItem('idUser');
    const hostId = this.property.host.id;

    if (currentUserId && hostId) {
      this.router.navigate(['/client/mensajes', hostId]);
    }
  }

  seleccionarDisponibilidad(slot: any): void {
    setTimeout(() => {
      this.selectedSlot = slot;
      this.cdr.markForCheck();
    }, 0);
  }

  getAmenidadesActivas(): string[] {
    if (!this.property) return [];
    return this.amenitiesList
      .filter((item) => this.property[item.key])
      .map((item) => item.label);
  }
  confirmarReserva(modal: any): void {
    if (!this.selectedSlot) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona una disponibilidad',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    const idString = localStorage.getItem('idUser');
    const idUser = idString !== null ? +idString : 0; // o null si prefieres // Construir las fechas completas en formato ISO (ejemplo usando la fecha actual + hora del slot)
    // Aquí deberías ajustar según cómo manejes fechas y horas en tu app
    // Ejemplo simple, suponiendo que solo usas startTime y endTime como strings HH:mm para hoy:
    const today = new Date();
    const startDate = new Date(
      today.toDateString() + ' ' + this.selectedSlot.startTime
    ).toISOString();
    const endDate = new Date(
      today.toDateString() + ' ' + this.selectedSlot.endTime
    ).toISOString();

    const reservationRequest: ReservationRequest = {
      userId: idUser,
      propertyId: this.property.id,
      startDate: startDate,
      endDate: endDate,
      status: 'PENDING', // Al crear, normalmente queda pendiente hasta que el host confirme
    };

    // Simulando llamada al backend (ajusta a tu servicio real)
    this.serviceReservation.createReservation(reservationRequest).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Reserva confirmada',
          text: `Has reservado el día ${this.selectedSlot.dayOfWeek} de ${this.selectedSlot.startTime} a ${this.selectedSlot.endTime}`,
          confirmButtonText: 'Perfecto',
        });
        modal.close();
        this.selectedSlot = null;
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al reservar',
          text: 'Intenta nuevamente más tarde',
          confirmButtonText: 'Cerrar',
        });
        console.error('Error al hacer reserva:', err);
      },
    });
  }
  dayNames: { [key: number]: string } = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo',
  };

  getDayName(dayNumber: number): string {
    return this.dayNames[dayNumber] || String(dayNumber);
  }
}
