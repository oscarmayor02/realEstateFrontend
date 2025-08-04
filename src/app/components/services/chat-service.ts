import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject, map } from 'rxjs';
import * as StompJs from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage, RawChatMessage } from '../../models/ChatMessage.model';
import { HttpClient } from '@angular/common/http';
import { UserDTO } from '../../models/UserDTO.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private stompClient!: StompJs.Client;
  private messageSubject = new Subject<ChatMessage>();
  private conversationUpdateSubject = new Subject<void>();
  private pendingMessages: ChatMessage[] = [];

  private userId: string | null = localStorage.getItem('idUser');
  private apiUrl = 'http://localhost:8080/api/messages';

  // Comportamiento para total mensajes no leídos
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeWebSocketConnection();
  }

  initializeWebSocketConnection() {
    if (!this.userId) return;

    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = new StompJs.Client({
      webSocketFactory: () => socket,
      debug: () => {},
      reconnectDelay: 5000,
    });

    this.stompClient.onConnect = () => {
      // Suscripción a mensajes individuales
      this.stompClient.subscribe(
        `/topic/messages/${this.userId}`,
        (message) => {
          if (message.body) {
            const raw = JSON.parse(message.body);
            const chatMessage: ChatMessage = {
              senderId: raw.senderId.toString(),
              receiverId: raw.receiverId.toString(),
              content: raw.content,
              timestamp: this.rawTimestampToISOString(raw.timestamp),
            };
            this.messageSubject.next(chatMessage);
            this.updateUnreadCount(); // Actualiza contador cuando llega mensaje nuevo
          }
        }
      );

      // Suscripción a actualizaciones de conversaciones (ej. cambios en mensajes no leídos)
      this.stompClient.subscribe(`/topic/conversations/${this.userId}`, () => {
        this.conversationUpdateSubject.next();
        this.updateUnreadCount(); // Actualiza contador cuando hay cambios en conversaciones
      });

      this.flushPendingMessages();
      this.updateUnreadCount(); // Inicializar contador al conectar
    };

    this.stompClient.activate();
  }

  private flushPendingMessages() {
    while (this.pendingMessages.length > 0 && this.stompClient.connected) {
      const msg = this.pendingMessages.shift();
      if (msg) this.sendMessage(msg);
    }
  }

  getMessages(): Observable<ChatMessage> {
    return this.messageSubject.asObservable();
  }

  getConversationUpdates(): Observable<void> {
    return this.conversationUpdateSubject.asObservable();
  }

  sendMessage(msg: ChatMessage) {
    if (!this.stompClient || !this.stompClient.connected) {
      this.pendingMessages.push(msg);
      return;
    }

    this.stompClient.publish({
      destination: '/app/chat',
      body: JSON.stringify(msg),
    });
  }

  getChatHistory(user1Id: string, user2Id: string): Observable<ChatMessage[]> {
    return this.http
      .get<RawChatMessage[]>(`${this.apiUrl}/history/${user1Id}/${user2Id}`)
      .pipe(
        map((msgs) =>
          msgs.map((msg) => ({
            senderId: msg.sender.id.toString(),
            receiverId: msg.receiver.id.toString(),
            content: msg.content,
            timestamp: this.rawTimestampToISOString(msg.timestamp),
          }))
        )
      );
  }

  getConversations(userId: string): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/conversations/${userId}`);
  }

  markMessagesAsRead(senderId: string, receiverId: string): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/mark-read/${senderId}/${receiverId}`,
      {}
    );
  }

  private updateUnreadCount() {
    if (!this.userId) return;

    this.getConversations(this.userId).subscribe({
      next: (conversations) => {
        const totalUnread = conversations.reduce(
          (acc, conv) => acc + (conv.unreadCount ?? 0),
          0
        );
        this.unreadCountSubject.next(totalUnread);
      },
      error: (err) => {
        console.error('Error al obtener conversaciones para unreadCount', err);
        this.unreadCountSubject.next(0);
      },
    });
  }

  private rawTimestampToISOString(ts: number[] | string): string {
    if (typeof ts === 'string') return ts;
    const [year, month, day, hour, min, sec] = ts;
    return new Date(year, month - 1, day, hour, min, sec).toISOString();
  }
}
