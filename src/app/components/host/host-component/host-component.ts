import { Component, Input } from '@angular/core';
import { PrivateNavbar } from '../../private-navbar/private-navbar';
import { SidebarHost } from '../sidebar-host/sidebar-host';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HostProperties } from '../host-properties/host-properties';
import { DownloadBanner } from '../../download-banner/download-banner';

@Component({
  selector: 'app-host-component',
  imports: [SidebarHost, CommonModule, RouterModule],
  templateUrl: './host-component.html',
  styleUrl: './host-component.css',
})
export class HostComponent {
  isMenuOpen = false;
  window: number = window.innerWidth;
  onToggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
