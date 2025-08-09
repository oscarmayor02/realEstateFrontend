import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '../services/chat-service';
import { ChatMessage } from '../../models/ChatMessage.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Conversation {
  id: string;
  name: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
  imports: [CommonModule, FormsModule],
})
export class Chat implements OnInit, AfterViewChecked {
  contactId: string | null = null;
  contactName: string | null = null;
  currentUserId: string | null = null;

  messages: ChatMessage[] = [];
  chatList: Conversation[] = [];
  newMessage: string = '';
  isSending = false;

  @ViewChild('scrollMe') private scrollContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private cdr: ChangeDetectorRef // <--- inyectar
  ) {}

  ngOnInit(): void {
    this.currentUserId = localStorage.getItem('idUser');

    this.route.paramMap.subscribe((params) => {
      this.contactId = params.get('receiverId');

      if (this.contactId) {
        this.loadChatHistory();
        this.contactName = this.getContactName(this.contactId);
        this.cdr.detectChanges(); // <--- forzar actualización
      } else {
        this.loadChatList();
        this.cdr.detectChanges(); // <--- forzar actualización
      }
    });

    this.chatService.getMessages().subscribe((msg) => {
      if (msg.senderId === this.currentUserId) return;

      if (
        (msg.senderId === this.contactId &&
          msg.receiverId === this.currentUserId) ||
        (msg.receiverId === this.contactId &&
          msg.senderId === this.currentUserId)
      ) {
        this.messages.push(msg);
        this.scrollToBottom();
      } else {
        this.loadChatList();
        this.cdr.detectChanges(); // <--- forzar actualización
      }
    });

    this.chatService.getConversationUpdates().subscribe(() => {
      this.loadChatList();
      this.cdr.detectChanges(); // <--- forzar actualización
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  loadChatList() {
    if (!this.currentUserId) return;
    this.chatService.getConversations(this.currentUserId).subscribe({
      next: (conversations) => {
        const uniqueMap = new Map<string, Conversation>();
        conversations.forEach((user: any) => {
          const key = user.id.toString();
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, {
              id: key,
              name: user.name,
              lastMessage: user.lastMessage || '',
              timestamp: user.timestamp || '',
              unreadCount: user.unreadCount ?? 0,
            });
          }
        });
        this.chatList = Array.from(uniqueMap.values());

        if (this.contactId) {
          const found = this.chatList.find((c) => c.id === this.contactId);
          if (found) this.contactName = found.name;
        }
        this.cdr.detectChanges(); // <--- forzar actualización
      },
      error: () => {
        this.chatList = [];
      },
    });
  }

  loadChatHistory() {
    if (!this.currentUserId || !this.contactId) return;

    this.chatService
      .getChatHistory(this.currentUserId, this.contactId)
      .subscribe({
        next: (msgs) => {
          this.messages = msgs;
          this.scrollToBottom();
          this.chatService
            .markMessagesAsRead(this.contactId!, this.currentUserId!)
            .subscribe();
          this.cdr.detectChanges(); // <--- forzar actualización
        },
      });
  }

  getContactName(contactId: string): string {
    const contact = this.chatList.find((c) => c.id === contactId);
    return contact ? contact.name : 'Desconocido';
  }

  openChat(contactId: string) {
    this.router.navigate([contactId], { relativeTo: this.route });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.contactId || !this.currentUserId)
      return;

    this.isSending = true;

    const msg: ChatMessage = {
      senderId: this.currentUserId,
      receiverId: this.contactId,
      content: this.newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    this.chatService.sendMessage(msg);

    this.messages.push(msg);
    this.newMessage = '';
    this.isSending = false;
    this.scrollToBottom();
  }

  volverALista() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        const el = this.scrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    } catch (err) {}
  }

  formatTime(iso: string): string {
    const date = new Date(iso);
    return `${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  }

  @HostListener('window:resize', [])
  onResize() {
    this.isWideScreen = window.innerWidth >= 768;
  }

  isWideScreen: boolean = window.innerWidth >= 768;

  // Devuelve un color para el avatar basado en la primera letra del nombre
  getAvatarColor(name: string): string {
    const colors = [
      '#4a90e2',
      '#f44336',
      '#ff9800',
      '#8bc34a',
      '#9c27b0',
      '#00bcd4',
      '#e91e63',
      '#673ab7',
      '#009688',
      '#ff5722',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }
}
