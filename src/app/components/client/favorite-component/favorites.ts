import { ChangeDetectorRef, Component } from '@angular/core';
import { FavoriteService } from '../../services/favorite-service';
import { Property } from '../../services/property';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites {
  favorites: any[] = [];
  userId: number = 0;

  constructor(
    private favoriteService: FavoriteService,
    private propertyService: Property,
    private router: Router,
    private cdr: ChangeDetectorRef // <--- inyectar
  ) {}

  ngOnInit(): void {
    const id = localStorage.getItem('idUser');
    this.userId = id ? +id : 0;

    if (this.userId) {
      this.favoriteService.getFavoritesByUser(this.userId).subscribe({
        next: (res) => {
          const propertyIds = res.map((f: any) => f.propertyId);
          this.loadProperties(propertyIds);
          this.cdr.detectChanges(); // <--- forzar actualización
        },
        error: () => console.error('Error cargando favoritos'),
      });
    }
  }

  loadProperties(ids: number[]) {
    this.propertyService.getAllProperties().subscribe((res) => {
      this.favorites = res.filter((p: any) => ids.includes(p.id));
      this.cdr.detectChanges(); // <--- forzar actualización
    });
  }

  verDetalle(id: number) {
    this.router.navigate(['client/propiedad', id]);
  }
}
