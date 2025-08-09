import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-property-map',
  standalone: true,
  imports: [GoogleMapsModule, CommonModule],
  templateUrl: './property-map.html',
  styleUrls: ['./property-map.css'],
})
export class PropertyMap implements OnInit, OnChanges {
  @Input() readOnly: boolean = false;

  @Input() ubicacion: string | { lat: number; lng: number } | null = null;
  google = google;

  @Input() center: google.maps.LatLngLiteral = {
    lat: 4.710989,
    lng: -74.072092,
  };

  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();

  zoom = 13;
  markerPosition: google.maps.LatLngLiteral | null = null;

  markers: any[] = [];

  private http = inject(HttpClient);
  private apiKey = 'AIzaSyAitJr1tiigXbnFRRxLyFvsXDqN5h2Vx9k'; // Pon tu API Key válida

  constructor(private cdr: ChangeDetectorRef) {}
  ngOnInit() {
    this.markerPosition = this.center;
    this.loadProperties(); // Carga propiedades al iniciar
    this.cdr.detectChanges();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['ubicacion'] && this.ubicacion) {
      if (typeof this.ubicacion === 'string') {
        await this.buscarYUbicar(this.ubicacion);
      } else {
        this.center = this.ubicacion;
        this.zoom = 13;
        this.markers = [];
        this.markers.push({
          position: this.ubicacion,
          label: '📍',
          options: { title: 'Ubicación seleccionada' },
        });
        this.loadNearbyPlaces(this.ubicacion.lat, this.ubicacion.lng);
        this.cdr.detectChanges();
      }
    }
  }

  async buscarYUbicar(lugar: string) {
    const coords = await this.geocodeAddress(`${lugar}, Colombia`);
    if (!coords) return;

    this.center = coords;
    this.zoom = 13;
    this.markers = [];

    this.markers.push({
      position: coords,
      label: '📍',
      options: { title: lugar },
    });

    await this.loadProperties();
    this.loadNearbyPlaces(coords.lat, coords.lng);
    this.cdr.detectChanges();
  }

  async loadProperties() {
    try {
      const properties = await this.http
        // .get<any[]>('http://localhost:8080/api/properties/available')
        .get<any[]>(
          'https://realstatebackend-mxee.onrender.com/api/properties/available'
        )
        .toPromise();
      console.log('Propiedades cargadas:', properties);

      if (!properties?.length) {
        this.markers = [];
        return;
      }
      this.cdr.detectChanges();

      // Crear promesas para geocodificar todas las propiedades
      const markerPromises = properties.map(async (prop) => {
        const address = `${prop.ciudad}, ${prop.departamento}, Colombia`;
        const coords = await this.geocodeAddress(address);
        if (!coords) return null;
        return {
          position: coords,
          options: {
            title: `${prop.title} - $${prop.price}`,
            animation: google.maps.Animation.DROP,
          },
        };
      });
      this.cdr.detectChanges();

      // Esperar a que todas las promesas terminen
      const markers = (await Promise.all(markerPromises)).filter(
        (m): m is { position: google.maps.LatLngLiteral; options: any } =>
          m !== null
      );

      // Reemplazar todos los marcadores (incluyendo el marcador principal)
      this.markers = markers;
    } catch (error) {
      console.error('Error cargando propiedades', error);
      this.markers = [];
    }
  }

  mapClicked(event: google.maps.MapMouseEvent) {
    if (!event.latLng) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    this.markerPosition = { lat, lng };
    this.locationSelected.emit({ lat, lng });
    this.cdr.detectChanges();
  }

  async geocodeAddress(
    address: string
  ): Promise<google.maps.LatLngLiteral | null> {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${this.apiKey}`
    );
    const data = await res.json();
    this.cdr.detectChanges();

    if (data.status === 'OK') {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }
    this.cdr.detectChanges();

    return null;
  }

  loadNearbyPlaces(lat: number, lng: number) {
    const service = new google.maps.places.PlacesService(
      document.createElement('div')
    );

    const types = ['restaurant', 'cafe', 'store', 'shopping_mall', 'lodging'];

    for (const type of types) {
      const request = {
        location: new google.maps.LatLng(lat, lng),
        radius: 1000,
        type,
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          for (const place of results) {
            if (
              place.geometry &&
              place.geometry.location &&
              typeof place.geometry.location.lat === 'function'
            ) {
              this.markers.push({
                position: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                },
                options: {
                  title: place.name,
                  animation: google.maps.Animation.DROP,
                },
              });
            }
          }
        }
      });
    }
  }
}
