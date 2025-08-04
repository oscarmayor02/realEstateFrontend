export interface User {
  id?: number;
  name: string;
  email: string;
  telephone: string;
  password: string;
  cedula: string;
  role: 'CLIENT' | 'HOST' | 'ADMIN';
  createdAt?: Date | null; // Cambiar de string a Date | null
}
