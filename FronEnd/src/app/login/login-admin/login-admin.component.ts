import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login-admin',
  templateUrl: './login-admin.component.html',
  styleUrls: ['./login-admin.component.scss']
})
export class LoginAdminComponent {
  adminId: string = '';
  adminPassword: string = '';
  constructor(private authService: AuthService) { }

  iniciarSesionAdmin() {
    this.authService.verificarRolAdmin(this.adminId, this.adminPassword).subscribe(
      response => {
        const rol = response.userRole;
        this.authService.redireccionarSegunRol(rol);
        this.authService.login(this.adminId); // Llama al método login con el ID del administrador
      },
      error => {
        // Manejar errores
      }
    );
  }
}
