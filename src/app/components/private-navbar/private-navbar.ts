import { Component } from '@angular/core';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-private-navbar',
  imports: [],
  templateUrl: './private-navbar.html',
  styleUrl: './private-navbar.css'
})
export class PrivateNavbar {
  userName: string = '';
  constructor(private auth: Auth, private router: Router) {}

  ngOnInit() {
    // Obtén el nombre o email del usuario desde el token o localStorage
    const user = this.auth.getUserInfoFromToken();
    console.log(user.sub);
    
    this.userName = user?.sub || user?.email || 'Usuario';
  }

   logout() {
    this.auth.logout();
    // Limpia el token del localStorage
    // Redirige al login o home
    this.router.navigate(['/']);
  }

}
