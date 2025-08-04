import { ChangeDetectorRef, Component } from '@angular/core';
import Swal from 'sweetalert2';
import { User } from '../../../models/User.model';
import { RegisterUser } from '../../services/register-user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UpdateProfileRequest } from '../../../models/UpdateProfileRequest.model';

// ✅ Para que TypeScript reconozca `bootstrap.Modal`
declare const bootstrap: any;

@Component({
  selector: 'app-admin-users',
  standalone: true,

  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsers {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  searchTerm = '';
  Math = Math;

  currentPage = 1;
  itemsPerPage = 5;

  constructor(
    private userService: RegisterUser,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.cdr.detectChanges();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.filterUsers();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading users', err),
    });
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter(
      (user) =>
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(start, start + this.itemsPerPage);
  }

  deleteUser(userId: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará al usuario permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(userId).subscribe({
          next: () => {
            this.users = this.users.filter((u) => u.id !== userId);
            this.filterUsers();
            Swal.fire('¡Eliminado!', 'Usuario eliminado con éxito.', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar.', 'error'),
        });
      }
    });
  }

  openEditModal(user: User): void {
    this.selectedUser = { ...user };
    console.log('Selected User for Edit:', this.selectedUser);

    const modalElement = document.getElementById('editUserModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  saveUser(): void {
    if (!this.selectedUser) return;

    // Extraer solo los campos que corresponden a UpdateProfileRequest
    const updatePayload: UpdateProfileRequest = {
      name: this.selectedUser.name,
      email: this.selectedUser.email,
      telephone: this.selectedUser.telephone,
      cedula: this.selectedUser.cedula,
    };

    this.userService
      .updateUser(this.selectedUser.id!, updatePayload)
      .subscribe({
        next: () => {
          Swal.fire(
            '¡Actualizado!',
            'Usuario editado correctamente.',
            'success'
          );
          this.loadUsers();
          this.selectedUser = null;

          const modalElement = document.getElementById('editUserModal');
          if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal?.hide();
          }
        },
        error: () =>
          Swal.fire('Error', 'No se pudo actualizar el usuario.', 'error'),
      });
  }

  changePage(n: number): void {
    this.currentPage = n;
  }
}
