import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar-cliente',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-cliente.html',
  styleUrls: ['./sidebar-cliente.css'],
})
export class SidebarCliente implements OnInit, OnDestroy {
  userName: string = '';
  userEmail: string = '';
  isMenuOpen = false;
  totalUnreadMessages = 0;
  private unreadCountSub?: Subscription;
  @Input() isMobile = false; // Para diferenciar desktop / mobile si quieres
  isAuthenticated = false;

  constructor(
    private router: Router,
    private auth: Auth,
    private chatService: ChatService,
    private cdr: ChangeDetectorRef // <--- inyectar
  ) {}

  ngOnInit() {
    const user = this.auth.getUserInfoFromToken();
    console.log('user desde token', user.sub);

    if (user) {
      this.userName = user?.name || user?.nombre || 'Usuario';
      this.userEmail = user?.sub || user?.sub || 'sin correo';
      this.isAuthenticated = true;
    } else {
      this.userName = 'Usuario';
      this.isAuthenticated = false;
    }

    // Suscripción al contador global de mensajes no leídos
    this.unreadCountSub = this.chatService.unreadCount$.subscribe((count) => {
      this.totalUnreadMessages = count;
      this.cdr.detectChanges(); // <--- forzar actualización
    });
  }

  ngOnDestroy() {
    this.unreadCountSub?.unsubscribe();
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/']);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
