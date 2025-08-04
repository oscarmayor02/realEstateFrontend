import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RegisterUser } from '../../services/register-user';
import { Auth } from '../../services/auth';
import { UpdateProfileRequest } from '../../../models/UpdateProfileRequest.model';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-configuracion-perfil-component',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './configuracion-perfil-component.html',
  styleUrl: './configuracion-perfil-component.css',
})
export class ConfiguracionPerfilComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  userId!: number;

  constructor(
    private fb: FormBuilder,
    private userService: RegisterUser,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    const userData = localStorage.getItem('idUser');
    if (userData) {
      this.userId = +JSON.parse(userData);

      this.profileForm = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        telephone: ['', Validators.required],
        cedula: [{ value: '', disabled: true }], // 👈 aquí
      });

      this.passwordForm = this.fb.group(
        {
          currentPassword: ['', Validators.required],
          newPassword: ['', [Validators.required, Validators.minLength(6)]],
          confirmPassword: ['', Validators.required],
        },
        { validators: this.passwordsMatchValidator() }
      );

      this.loadUserData();
      this.cdr.detectChanges(); // <--- forzar actualización
    }
  }

  loadUserData(): void {
    this.userService.getUserById(this.userId).subscribe((user) => {
      this.profileForm.patchValue({
        name: user.name,
        email: user.email,
        telephone: user.telephone,
        cedula: user.cedula,
      });
      this.cdr.detectChanges(); // <--- forzar actualización
    });
  }

  onSaveProfile(): void {
    const data: UpdateProfileRequest = this.profileForm.value;
    this.userService.updateUser(this.userId, data).subscribe({
      next: () =>
        Swal.fire({
          icon: 'success',
          title: 'Perfil actualizado',
          timer: 1500,
          showConfirmButton: false,
        }),
      error: () =>
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el perfil',
        }),
    });
  }

  onChangePassword(): void {
    const values = this.passwordForm.value;

    if (values.newPassword !== values.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden.',
      });
      return;
    }

    // Solo envía currentPassword y newPassword
    const request = {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    };

    this.userService.changePassword(this.userId, request).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Contraseña actualizada',
          timer: 1500,
          showConfirmButton: false,
        });
        this.passwordForm.reset();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'No se pudo cambiar la contraseña.',
        });
        console.error(err);
      },
    });
  }

  // Validación personalizada
  private passwordsMatchValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const newPassword = group.get('newPassword')?.value;
      const confirmPassword = group.get('confirmPassword')?.value;
      return newPassword === confirmPassword
        ? null
        : { passwordsMismatch: true };
    };
  }

  // Helpers para HTML
  isInvalid(controlName: string, form: FormGroup): boolean {
    const control = form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  hasMismatchError(): boolean {
    return this.passwordForm.hasError('passwordsMismatch');
  }
}
