import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegisterUser } from '../../services/register-user';
import { User } from '../../../models/User.model';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private registerService: RegisterUser,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        telephone: [
          '',
          [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)],
        ],
        cedula: ['', [Validators.required, Validators.pattern(/^\d{6,12}$/)]],
        role: ['CLIENT', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  onRegister() {
    if (this.registerForm.invalid) return;
    const formValue = this.registerForm.value;

    const user: Omit<User, 'id'> = {
      name: formValue.name,
      email: formValue.email,
      telephone: formValue.telephone,
      cedula: formValue.cedula,
      role: formValue.role,
      password: formValue.password,
    };

    this.registerService.register(user).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Te damos la bienvenida',
          confirmButtonText: 'Iniciar sesión',
        }).then(() => this.goToLogin());
      },
      error: (err) => {
        console.log('Error al registrar usuario:', err);

        let message = 'Error al registrarte. Intenta de nuevo.';
        if (err.status === 409) {
          if (err.error?.message?.includes('email')) {
            message = 'El correo electrónico ya está registrado.';
          } else if (err.error?.message?.includes('Cédula')) {
            message = 'La cédula ya está registrada.';
          }
        }

        Swal.fire({
          icon: 'error',
          title: 'Registro fallido',
          text: message,
        });
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/']);
  }
}
