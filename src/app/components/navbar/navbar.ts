import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  imports: [FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
 email: string = '';
  password: string = '';

  onLogin() {
    console.log('Intentar login con:', this.email, this.password);
    // Aquí puedes llamar a un servicio de autenticación
  }
}
