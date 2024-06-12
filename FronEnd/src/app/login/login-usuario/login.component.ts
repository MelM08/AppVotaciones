// src/app/login/login.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { InformacionUsuarioService } from '../../Paginas/usuario/informacion-usuario.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  userId: string = '';

  constructor(private authService: AuthService, private informacionUsuarioService: InformacionUsuarioService) { }

  iniciarSesion() {
    // Log para ver el ID de usuario que se está utilizando para la verificación
    console.log('Intentando iniciar sesión con el ID de usuario:', this.userId);

    this.authService.verificarRol(this.userId).subscribe(
      response => {
        // Log para ver la respuesta completa del servidor
        console.log('Respuesta recibida de verificarRol:', response);

        const rol = response.userRole;

        // Guardar la información del usuario en el servicio de información de usuario
        this.informacionUsuarioService.setUserInfo(response.userDetails);

        // Log para ver los detalles del usuario que se están guardando
        console.log('Detalles del usuario guardados:', response.userDetails);

        // Redirigir según el rol del usuario
        this.authService.redireccionarSegunRol(rol);
        this.authService.login(this.userId);
      },
      error => {
        // Log de error para ver cualquier problema con la solicitud
        console.error('Error al verificar el rol del usuario:', error);

        if (error.status === 404) {
          alert('Usuario no encontrado');
        } else if (error.status === 500) {
          alert('Error al verificar el rol del usuario');
        }
      }
    );
  }
}
