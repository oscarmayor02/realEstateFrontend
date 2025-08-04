import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Property } from '../../services/property';
import { environment } from '../../../../enviroments/environment';

@Component({
  selector: 'app-host-properties',
  imports: [CommonModule, RouterModule],
  templateUrl: './host-properties.html',
  styleUrl: './host-properties.css',
})
export class HostProperties {
  properties: any[] = [];
  hostId: string | null = null;
  private apiUrl = `${environment.apiBaseUrl}/properties`;
  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private propertyService: Property,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.hostId = localStorage.getItem('idUser');
    if (this.hostId) {
      this.fetchPropertiesByOwner(this.hostId);
    }
    this.cdr.detectChanges();
  }

  fetchPropertiesByOwner(ownerId: string) {
    this.http
      .get<any[]>(`${this.apiUrl}/owner/${ownerId}`)
      .subscribe((data) => {
        this.properties = data;
        this.cdr.detectChanges(); // Solución al error NG0100
      });
  }

  getAvailabilityText(avail: boolean): string {
    return avail ? 'DISPONIBLE' : 'EN ALQUILER';
  }

  deleteProperty(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la propiedad permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.propertyService.deleteProperty(id).subscribe({
          next: () => {
            Swal.fire(
              'Eliminado',
              'La propiedad ha sido eliminada.',
              'success'
            );
            this.fetchPropertiesByOwner(this.hostId!);
            this.router
              .navigateByUrl('/', { skipLocationChange: true })
              .then(() => {
                this.router.navigate(['/host/properties']);
              });
          },
          error: (err) => {
            Swal.fire('Error', 'No se pudo eliminar la propiedad.', 'error');
            console.error(err);
          },
        });
        this.cdr.detectChanges();
      }
    });
  }
}
