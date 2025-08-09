import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyMap } from '../../properties/property-map/property-map';
import { Location } from '../../services/location';
import { Property } from '../../services/property';

@Component({
  selector: 'app-property-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PropertyMap, FormsModule],
  templateUrl: './property-create.html',
  styleUrls: ['./property-create.css'],
})
export class PropertyCreate implements OnInit {
  propertyForm: FormGroup;
  departamentosColombia: { departamento: string; ciudades: string[] }[] = [];
  ciudadesDisponibles: string[] = [];
  center = { lat: 4.710989, lng: -74.072092 };
  amenities = [
    { key: 'petsAllowed', label: 'Acepta mascotas' },
    { key: 'balcony', label: 'Balcón' },
    { key: 'terrace', label: 'Terraza' },
    { key: 'pool', label: 'Piscina' },
  ];
  daysOfWeek: string[] = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ];

  daysOfWeekLabels: { [key: string]: string } = {
    MONDAY: 'Lunes',
    TUESDAY: 'Martes',
    WEDNESDAY: 'Miércoles',
    THURSDAY: 'Jueves',
    FRIDAY: 'Viernes',
    SATURDAY: 'Sábado',
    SUNDAY: 'Domingo',
  };
  selectedFiles: File[] = [];
  existingImages: string[] = [];
  isEditMode = false;
  propertyId: number | null = null;
  deletedImages: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private locationService: Location,
    private propertyService: Property,
    private cdr: ChangeDetectorRef
  ) {
    this.propertyForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      departamento: ['', Validators.required],
      ciudad: ['', Validators.required],
      address: [''],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],
      bedrooms: [null],
      bathrooms: [null],
      area: [null],
      yearBuilt: [null],
      type: ['', Validators.required],
      parkingSpaces: [null],
      estrato: [null],
      petsAllowed: [false],
      balcony: [false],
      terrace: [false],
      pool: [false],
      operationType: ['', Validators.required],
      price: [null, Validators.required],
      available: [true],
      availabilityList: this.fb.array([]),
    });
  }

  get availabilityList(): FormArray {
    return this.propertyForm.get('availabilityList') as FormArray;
  }

  addAvailability() {
    this.availabilityList.push(
      this.fb.group({
        dayOfWeek: ['', Validators.required],
        startTime: ['', Validators.required],
        endTime: ['', Validators.required],
      })
    );
  }

  removeAvailability(index: number) {
    this.availabilityList.removeAt(index);
  }

  ngOnInit() {
    this.locationService.getDepartamentosYMunicipios().subscribe({
      next: (data) => (this.departamentosColombia = data),
      error: (err) =>
        console.error('Error cargando departamentos y ciudades:', err),
    });
    this.cdr.detectChanges();

    this.propertyId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.propertyId) {
      this.isEditMode = true;
      this.loadProperty(this.propertyId);
      this.cdr.detectChanges();
    }
  }

  loadProperty(id: number) {
    this.propertyService.getPropertyById(id).subscribe({
      next: (property) => {
        this.propertyForm.patchValue(property);
        this.existingImages = property.images?.map((img: any) => img.url) || [];
        this.center = {
          lat: property.latitude || 4.710989,
          lng: property.longitude || -74.072092,
        };
        const departamento = property.departamento;
        this.cdr.detectChanges();

        const selected = this.departamentosColombia.find(
          (d) => d.departamento === departamento
        );
        this.ciudadesDisponibles = selected?.ciudades || [];

        if (property.availabilityList) {
          property.availabilityList.forEach((a: any) => {
            this.availabilityList.push(
              this.fb.group({
                dayOfWeek: [a.dayOfWeek],
                startTime: [a.startTime],
                endTime: [a.endTime],
              })
            );
          });
        }
      },
      error: (err) => console.error('Error cargando propiedad', err),
    });
  }

  onDepartamentoChange(event: Event) {
    const departamento = (event.target as HTMLSelectElement).value;
    const selected = this.departamentosColombia.find(
      (d) => d.departamento === departamento
    );
    this.ciudadesDisponibles = selected?.ciudades || [];
    this.propertyForm.get('ciudad')?.setValue('');
    this.updateMap();
    this.cdr.detectChanges();
  }

  onCiudadChange(event: Event) {
    this.updateMap();
    this.cdr.detectChanges();
  }

  updateMap() {
    const departamento = this.propertyForm.get('departamento')?.value;
    const ciudad = this.propertyForm.get('ciudad')?.value;
    const direccion = this.propertyForm.get('address')?.value;

    if (!departamento || !ciudad) return;

    const fullAddress = direccion
      ? `${direccion}, ${ciudad}, ${departamento}, Colombia`
      : `${ciudad}, ${departamento}, Colombia`;

    const geocoder = new google.maps.Geocoder();
    this.cdr.detectChanges();

    geocoder.geocode({ address: fullAddress }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        this.center = { lat: location.lat(), lng: location.lng() };
        this.propertyForm.patchValue({
          latitude: location.lat(),
          longitude: location.lng(),
        });
      } else {
        console.error('Geocoder failed due to:', status);
      }
    });
    this.cdr.detectChanges();
  }

  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    return new Promise((resolve) => {
      const geocoder = new google.maps.Geocoder();
      this.cdr.detectChanges();

      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          console.error('Geocoder failed due to:', status);
          resolve(null);
        }
      });
    });
  }

  async onLocationSelected(event: { lat: number; lng: number }) {
    this.propertyForm.patchValue({ latitude: event.lat, longitude: event.lng });
    this.center = event;
    this.cdr.detectChanges();

    const address = await this.reverseGeocode(event.lat, event.lng);
    if (address) {
      this.propertyForm.patchValue({ address });
    }
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.selectedFiles = Array.from(input.files);
  }

  onSubmit() {
    console.log('Form submitted:', this.propertyForm.value);

    if (this.propertyForm.invalid) return;

    const formData = new FormData();
    const formValue = this.propertyForm.value;

    Object.keys(this.propertyForm.controls).forEach((key) => {
      const value = this.propertyForm.get(key)?.value;
      if (key !== 'availabilityList' && value !== null && value !== undefined) {
        formData.append(
          key,
          typeof value === 'boolean'
            ? value
              ? 'true'
              : 'false'
            : value.toString()
        );
      }
    });

    if (this.availabilityList.length > 0) {
      const availabilityFormatted = this.availabilityList.controls.map(
        (group) => {
          const value = group.value;
          return {
            dayOfWeek: value.dayOfWeek,
            startTime: value.startTime?.toString().padStart(5, '0'),
            endTime: value.endTime?.toString().padStart(5, '0'),
          };
        }
      );
      const availabilityJson = JSON.stringify(availabilityFormatted);
      formData.append('availabilityList', availabilityJson);
    }

    const ownerId = localStorage.getItem('idUser');
    if (!ownerId) {
      alert('No se encontró el ID del propietario. Por favor, inicia sesión.');
      return;
    }
    formData.append('ownerId', ownerId);

    if (this.selectedFiles.length > 0) {
      this.selectedFiles.forEach((file) => formData.append('images', file));
    }

    const request = this.isEditMode
      ? this.propertyService.updateProperty(this.propertyId!, formData)
      : this.propertyService.saveProperty(formData);

    request.subscribe({
      next: () => this.router.navigate(['host/properties']),
      error: (err) => {
        console.error('Error al guardar/editar propiedad', err);
        alert('Error procesando la propiedad');
      },
    });
  }

  removeExistingImage(url: string) {
    this.deletedImages.push(url);
    this.existingImages = this.existingImages.filter((img) => img !== url);
  }
}
