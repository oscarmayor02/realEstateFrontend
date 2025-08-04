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
import { CommonModule } from '@angular/common';
import { RegisterUser } from '../../services/register-user';
import { UpdateProfileRequest } from '../../../models/UpdateProfileRequest.model';
import Swal from 'sweetalert2';
import { AdminLog } from '../../../models/AdminLog.model';
import { AdminLogService } from '../../services/admin-log-service';
import { AdminParameterService } from '../../services/admin-parameter-service';
import { GlobalParameter } from '../../../models/GlobalParameter.model';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-settings.html',
  styleUrls: ['./admin-settings.css'],
})
export class AdminSettings {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  preferencesForm!: FormGroup;
  parametersForm!: FormGroup;
  userId!: number;
  logs: AdminLog[] = [];

  activeSection: string = 'profile';
  maintenanceMode: boolean = false;
  users: any[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: RegisterUser,
    private adminLogService: AdminLogService,
    private adminParameterService: AdminParameterService,
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
      this.parametersForm = this.fb.group({
        maxReservations: [10, [Validators.required, Validators.min(1)]],
        platformFee: [5, [Validators.required, Validators.min(0)]],
      });
      this.loadUserData();
      this.cdr.detectChanges();
    }

    this.preferencesForm = this.fb.group({
      language: ['es'],
      timezone: ['America/Bogota'],
      currency: ['COP'],
    });

    this.parametersForm = this.fb.group({
      maxReservations: [10, [Validators.required, Validators.min(1)]],
      platformFee: [5, [Validators.required, Validators.min(0)]],
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

  loadUserData(): void {
    this.userService.getUserById(this.userId).subscribe((user) => {
      this.profileForm.patchValue({
        name: user.name,
        email: user.email,
        telephone: user.telephone,
        cedula: user.cedula,
      });
      this.cdr.detectChanges();
    });
  }

  changeSection(section: string) {
    this.activeSection = section;
    if (section === 'roles') {
      this.userService.getAllUsers().subscribe((allUsers) => {
        this.users = allUsers;
        this.cdr.detectChanges();
      });
    } else if (section === 'logs') {
      this.loadLogs();
    } else if (section === 'parameters') {
      this.loadParameters();
    }
  }

  loadParameters() {
    this.adminParameterService.getParameters().subscribe({
      next: (params: GlobalParameter) => {
        this.parametersForm.patchValue({
          maxReservations: params.maxReservations,
          platformFee: params.platformFee,
        });
      },
      error: (err) => {
        console.error('Error cargando parámetros:', err);
      },
    });
  }

  saveParameters() {
    if (this.parametersForm.invalid) {
      Swal.fire('Error', 'Por favor ingrese valores válidos.', 'error');
      return;
    }

    const params: GlobalParameter = this.parametersForm.value;

    this.adminParameterService.updateParameters(params).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Parámetros actualizados.', 'success');
      },
      error: (err) => {
        Swal.fire(
          'Error',
          'No se pudieron actualizar los parámetros.',
          'error'
        );
        console.error(err);
      },
    });
  }

  loadLogs() {
    this.adminLogService.getLogs().subscribe({
      next: (logs) => {
        this.logs = logs;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando logs:', err);
        this.logs = [];
      },
    });
  }

  saveProfile() {
    console.log(this.profileForm.value);
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

  changePassword() {
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

  savePreferences() {
    console.log(this.preferencesForm.value);
  }

  toggleMaintenance() {
    this.maintenanceMode = !this.maintenanceMode;
    console.log('Modo mantenimiento:', this.maintenanceMode);
  }

  updateRole(user: any): void {
    console.log(`Actualizando rol de usuario ${user.id} a ${user.role}`);

    this.userService.updateUserRole(user.id, user.role).subscribe({
      next: () => {
        console.log(`Rol de usuario ${user.id} actualizado a ${user.role}`);
        this.cdr.detectChanges();
      },
      complete: () => {
        Swal.fire('Rol actualizado', '', 'success');
      },
      error: () => {
        Swal.fire('Error al actualizar el rol', '', 'error');
      },
    });
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
