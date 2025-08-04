import { Component } from '@angular/core';
import { PrivateNavbar } from '../private-navbar/private-navbar';
import { SidebarAdmin } from './sidebar-admin/sidebar-admin';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  imports: [SidebarAdmin, RouterModule, CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  isMenuOpen = false;
  window: number = window.innerWidth;
  onToggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
