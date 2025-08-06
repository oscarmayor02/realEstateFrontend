import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Auth } from '../services/auth';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
declare var bootstrap: any; // para evitar error de TS con bootstrap global

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  loginForm: FormGroup;
  @ViewChild('navbarCollapse') navbarCollapse!: ElementRef;
  collapseInstance: any;

  errorMsg: string = ''; // Variable para el mensaje de error
  // Inyecta el servicio de autenticación para manejar el inicio de sesión
  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(10),
        ],
      ],
    });
  }

  ngAfterViewInit() {
    this.collapseInstance = new bootstrap.Collapse(
      this.navbarCollapse.nativeElement,
      {
        toggle: false,
      }
    );
  }

  toggleMenu() {
    if (this.collapseInstance) {
      // El toggle oficial funciona para abrir o cerrar
      this.collapseInstance.toggle();
    }
  }

  closeMenu() {
    if (this.collapseInstance) {
      this.collapseInstance.hide();
    }
  }

  onLogin() {
    if (this.loginForm.invalid) return;
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: (token: string) => {
        this.errorMsg = '';
        // ...tu lógica de login...
        localStorage.setItem('token', token);
        this.closeMenu(); // <--- cerrar menú al hacer login

        const user = this.authService.getUserInfoFromToken();
        console.log(user); // <- aquí verás el rol

        if (user?.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else if (user?.role === 'HOST') {
          this.router.navigate(['/host']);
        } else {
          this.router.navigate(['/client']);
        }
      },
      error: (err) => {
        // Extrae el mensaje del backend si existe
        const backendMsg =
          err.error?.message || 'Error al iniciar sesión. Intenta de nuevo.';

        Swal.fire({
          icon: 'error',
          title: 'Usuario o contraseña inválidos',
          text: backendMsg,
          confirmButtonText: 'Intentar de nuevo',
        });
      },
    });
  }

  onRegister() {
    // Cambia la ruta según tu app

    window.location.href = '/register';
  }
}
