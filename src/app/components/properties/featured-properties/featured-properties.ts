import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../../services/property';
import { PropertyState } from '../../services/property-state';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { FavoriteService } from '../../services/favorite-service';

@Component({
  selector: 'app-featured-properties',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-properties.html',
  styleUrls: ['./featured-properties.css'],
})
export class FeaturedProperties implements OnInit, OnDestroy {
  properties: any[] = [];
  imageIndexes: number[] = [];
  intervals: any[] = [];
  favoriteIds: Set<number> = new Set();
  userId: number | null = null;

  @ViewChild('carousel', { static: false }) carousel!: ElementRef;

  constructor(
    private propertyService: Property,
    private auth: Auth,
    private propertyState: PropertyState,
    private router: Router,
    private favoriteService: FavoriteService,
    private cdr: ChangeDetectorRef // <--- inyectar
  ) {}

  ngOnInit(): void {
    this.propertyState.properties$.subscribe((props) => {
      if (props === null) {
        this.loadProperties();
      } else {
        this.properties = props;
        this.setupImageAutoplay();
        this.cdr.detectChanges(); // <--- forzar actualización
      }
    });

    if (this.isLoggedIn()) {
      const user = localStorage.getItem('idUser');
      this.userId = user ? +user : null;

      if (this.userId) {
        this.favoriteService.getFavoritesByUser(this.userId).subscribe({
          next: (favorites) => {
            console.log('Favorites loaded:', favorites);

            // Recibes un array con propertyId directamente
            this.favoriteIds = new Set(favorites.map((f: any) => f.propertyId));
          },
          error: (err) => {
            console.error('Error loading favorites:', err);
          },
        });
      }
    }
  }

  scrollCarousel(direction: number) {
    const el = this.carousel.nativeElement as HTMLElement;
    const scrollAmount = el.clientWidth; // ancho visible del carrusel
    el.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth',
    });
  }

  loadProperties(): void {
    this.propertyService.getAllProperties().subscribe({
      next: (res) => {
        console.log('Properties loaded:', res);

        this.properties = res;
        this.setupImageAutoplay();
        this.cdr.detectChanges(); // <--- forzar actualización
      },
      error: (err) => console.error('Error loading properties', err),
    });
  }

  setupImageAutoplay(): void {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.imageIndexes = this.properties.map(() => 0);

    this.properties.forEach((prop, idx) => {
      this.intervals[idx] = setInterval(() => {
        const images =
          prop.images?.length > 0
            ? prop.images
            : [{ url: 'https://via.placeholder.com/600x400?text=Sin+imagen' }];
        this.imageIndexes[idx] = (this.imageIndexes[idx] + 1) % images.length;
      }, 2500);
    });
  }

  ngOnDestroy(): void {
    this.intervals.forEach((interval) => clearInterval(interval));
  }

  getCurrentImage(prop: any, idx: number): string {
    const images =
      prop.images?.length > 0
        ? prop.images
        : [{ url: 'https://via.placeholder.com/600x400?text=Sin+imagen' }];
    return images[this.imageIndexes[idx]]?.url;
  }

  verDetalle(id: any) {
    this.router.navigate(['client/propiedad', id]);
  }

  isLoggedIn(): boolean {
    return this.auth.getToken() !== null;
  }

  isFavorite(propertyId: number): boolean {
    return this.favoriteIds.has(propertyId);
  }

  toggleFavorite(propertyId: number, event: Event): void {
    event.stopPropagation(); // evitar navegación

    if (!this.userId) return;

    if (this.isFavorite(propertyId)) {
      this.favoriteService
        .removeFavorite(this.userId, propertyId)
        .subscribe(() => {
          this.favoriteIds.delete(propertyId);
        });
    } else {
      this.favoriteService
        .addFavorite(this.userId, propertyId)
        .subscribe(() => {
          this.favoriteIds.add(propertyId);
        });
    }
  }
}
