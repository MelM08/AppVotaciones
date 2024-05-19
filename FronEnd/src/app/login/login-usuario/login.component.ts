import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  userId: string = '';

  constructor(private authService: AuthService) { }

  iniciarSesion() {
    this.authService.verificarRol(this.userId).subscribe(
      response => {
        const rol = response.userRole;
        this.authService.redireccionarSegunRol(rol);
        this.authService.login(this.userId); // Llama al método login con el ID del usuario
      },
      error => {
        if(error.status === 404){
          alert('Usuario no encontrado');
        }else if(error.status === 500){
          alert('Error al verificar el rol del usuario')
        }
      }
    );
  }
}
