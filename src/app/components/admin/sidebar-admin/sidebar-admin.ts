import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-admin.html',
  styleUrls: ['./sidebar-admin.css'],
})
export class SidebarAdmin {
  isMenuOpen = false;
  userName: string = '';
  userEmail: string = '';
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/']);
  }

  ngOnInit() {
    const user = this.auth.getUserInfoFromToken();
    this.userName = user?.name || user?.nombre || 'Usuario';
    this.userEmail = user?.sub || user?.sub || 'sin correo';
  }
  constructor(private router: Router, private auth: Auth) {}
}
