import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { ChatService } from '../../services/chat-service';
import { UserDTO } from '../../../models/UserDTO.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar-host',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-host.html',
  styleUrl: './sidebar-host.css',
})
export class SidebarHost implements OnInit, OnDestroy {
  userName: string = '';
  userEmail: string = '';
  isMenuOpen = false;
  totalUnreadMessages = 0;
  private unreadCountSub?: Subscription;
  @Input() isMobile = false; // Para diferenciar desktop / mobile si quieres

  constructor(
    private router: Router,
    private auth: Auth,
    private chatService: ChatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.auth.getUserInfoFromToken();
    this.userName = user?.name || user?.nombre || 'Usuario';
    this.userEmail = user?.sub || user?.sub || 'sin correo';
    this.unreadCountSub = this.chatService.unreadCount$.subscribe((count) => {
      this.totalUnreadMessages = count;
      this.cdr.detectChanges();
    });
    this.cdr.detectChanges();
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
    console.log(`Menu is now ${this.isMenuOpen ? 'open' : 'closed'}`);
  }
}
