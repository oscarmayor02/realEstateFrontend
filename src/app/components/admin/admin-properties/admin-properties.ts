import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Property } from '../../services/property';
import { PropertyResponse } from '../../../models/PropertyResponse.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

// Declaramos bootstrap para modals y google.maps para mapa
declare const bootstrap: any;
declare const google: any;
@Component({
  selector: 'app-admin-properties',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-properties.html',
  styleUrl: './admin-properties.css',
})
export class AdminProperties implements OnInit {
  properties: PropertyResponse[] = [];
  filteredProperties: PropertyResponse[] = [];
  searchTerm = '';
  Math = Math;
  @ViewChild('imageModal') imageModal: any;

  // Paginación
  currentPage = 1;
  itemsPerPage = 5;

  // Propiedad seleccionada para editar o crear
  selectedProperty: PropertyResponse | null = null;
  selectedImages: { id: number; url: string }[] = [];
  isEditing: boolean = false;

  // Nuevas imágenes seleccionadas (crear o editar)
  newImages: File[] = [];

  // Para mostrar imágenes existentes en edición
  existingImages: { url: string }[] = [];

  // Para Google Maps
  map: google.maps.Map | null = null;
  marker: google.maps.Marker | null = null;

  constructor(
    private propertyService: Property,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProperties();
    this.cdr.detectChanges();
  }

  loadProperties(): void {
    this.propertyService.getAllProperties().subscribe({
      next: (res) => {
        this.properties = res;
        this.filterProperties();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading properties', err),
    });
  }

  filterProperties(): void {
    // Normaliza string (quita acentos y pasa a minúsculas)
    const normalize = (s: any) =>
      (s ?? '')
        .toString()
        .normalize('NFD') // separa diacríticos
        .replace(/[\u0300-\u036f]/g, '') // quita diacríticos
        .toLowerCase();

    const term = normalize((this.searchTerm ?? '').trim());

    // Si no hay término, mostramos todas las propiedades
    if (!term) {
      this.filteredProperties = Array.isArray(this.properties)
        ? [...this.properties]
        : [];
      this.currentPage = 1;
      this.cdr.detectChanges();
      console.log(
        '[filter] sin término ->',
        this.filteredProperties.length,
        'propiedades'
      );
      return;
    }

    // Filtrado seguro (protegemos si title/ciudad son null/undefined)
    this.filteredProperties = (this.properties || []).filter((p: any) => {
      const title = normalize(p?.title);
      const ciudad = normalize(p?.ciudad);
      // puedes añadir más campos aquí si quieres (address, host.name, etc.)
      return title.includes(term) || ciudad.includes(term);
    });

    this.currentPage = 1;
    this.cdr.detectChanges();

    console.log(
      '[filter] término:',
      this.searchTerm,
      '-> resultados:',
      this.filteredProperties.length
    );
  }

  get paginatedProperties(): PropertyResponse[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProperties.slice(start, start + this.itemsPerPage);
  }

  changePage(n: number): void {
    this.currentPage = n;
  }

  // --- CREAR NUEVA PROPIEDAD ---
  openCreateModal(): void {
    this.isEditing = false;
    this.selectedProperty = {
      id: 0,
      title: '',
      description: '',
      departamento: '',
      ciudad: '',
      latitude: 0,
      longitude: 0,
      address: '',
      operationType: 'SALE',
      type: 'HOUSE',
      price: 0,
      available: true,
      images: [],
      host: { id: 1, name: 'Admin' }, // Cambia según contexto real o usuario logueado
    };
    this.newImages = [];
    this.existingImages = [];
    this.openModal('editPropertyModal');
    setTimeout(() => this.initMap(), 300);
  }

  // --- EDITAR PROPIEDAD ---
  openEditModal(property: PropertyResponse): void {
    this.isEditing = true;
    this.selectedProperty = { ...property };
    this.existingImages = property.images || [];
    this.newImages = [];
    this.openModal('editPropertyModal');
    setTimeout(() => this.initMap(), 300);
  }

  openModal(id: string) {
    const modalElement = document.getElementById(id);
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  closeModal(id: string) {
    const modalElement = document.getElementById(id);
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  // Eliminar propiedad
  deleteProperty(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la propiedad permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.propertyService.deleteProperty(id).subscribe({
          next: () => {
            this.properties = this.properties.filter((p) => p.id !== id);
            this.filterProperties();
            Swal.fire(
              '¡Eliminado!',
              'Propiedad eliminada con éxito.',
              'success'
            );
          },
          error: () =>
            Swal.fire('Error', 'No se pudo eliminar la propiedad.', 'error'),
        });
      }
    });
  }

  // Imagen seleccionada (crear o editar)
  onImageSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.newImages = Array.from(event.target.files);
    }
  }

  // Quitar imagen existente en edición
  removeExistingImage(index: number) {
    this.existingImages.splice(index, 1);
  }

  // Guardar propiedad (crear o editar)
  saveProperty(form: NgForm) {
    if (!form.valid || !this.selectedProperty) {
      Swal.fire(
        'Error',
        'Por favor completa el formulario correctamente.',
        'error'
      );
      return;
    }

    const formData = new FormData();

    formData.append('title', this.selectedProperty.title);
    formData.append('description', this.selectedProperty.description);
    formData.append('departamento', this.selectedProperty.departamento);
    formData.append('ciudad', this.selectedProperty.ciudad);
    formData.append('latitude', this.selectedProperty.latitude.toString());
    formData.append('longitude', this.selectedProperty.longitude.toString());
    formData.append('address', this.selectedProperty.address);
    formData.append('operationType', this.selectedProperty.operationType);
    formData.append('type', this.selectedProperty.type);
    formData.append('price', this.selectedProperty.price.toString());
    formData.append('available', this.selectedProperty.available.toString());
    formData.append('ownerId', this.selectedProperty.host.id.toString());
    this.cdr.detectChanges();

    // Si quieres enviar las imágenes existentes (como URLs), depende de tu backend
    // por lo general, para eliminarlas y conservar algunas debes enviar IDs o URLs
    // Aquí solo enviamos las nuevas imágenes:
    this.newImages.forEach((file) =>
      formData.append('images', file, file.name)
    );

    if (this.isEditing) {
      this.propertyService
        .updateProperty(this.selectedProperty.id, formData)
        .subscribe({
          next: () => {
            Swal.fire(
              '¡Actualizado!',
              'Propiedad actualizada con éxito.',
              'success'
            );
            this.loadProperties();
            this.closeModal('editPropertyModal');
          },
          error: () =>
            Swal.fire('Error', 'No se pudo actualizar la propiedad.', 'error'),
        });
    } else {
      this.propertyService.saveProperty(formData).subscribe({
        next: () => {
          Swal.fire('¡Creado!', 'Propiedad creada con éxito.', 'success');
          this.loadProperties();
          this.closeModal('editPropertyModal');
        },
        error: () =>
          Swal.fire('Error', 'No se pudo crear la propiedad.', 'error'),
      });
    }
  }

  // --- Google Maps ---

  initMap() {
    if (!this.selectedProperty) return;

    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    const center = {
      lat: this.selectedProperty.latitude || -34.397,
      lng: this.selectedProperty.longitude || 150.644,
    };

    this.map = new google.maps.Map(mapContainer, {
      center,
      zoom: 8,
    });

    this.marker = new google.maps.Marker({
      position: center,
      map: this.map,
      draggable: true,
    });

    this.marker?.addListener('dragend', () => {
      const pos = this.marker!.getPosition();
      if (pos && this.selectedProperty) {
        this.selectedProperty.latitude = pos.lat();
        this.selectedProperty.longitude = pos.lng();
      }
    });
    this.cdr.detectChanges();
  }
  openImagesModal(property: PropertyResponse) {
    this.selectedProperty = property;
    this.selectedImages = property.images;
    const modal = document.getElementById('imageModal');
    if (modal) {
      const modalInstance = new (window as any).bootstrap.Modal(modal);
      modalInstance.show();
    }
  }
}
