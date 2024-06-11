import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService} from '../../notification.service';

@Component({
  selector: 'app-registrar-padres',
  templateUrl: './registrar-padres.component.html',
  styleUrl: './registrar-padres.component.scss'
})
export class RegistrarPadresComponent {
  documentoEstudiante: string = '';
  documentoPadre: string = '';
  nombrePadre: string = '';

  constructor(private http: HttpClient, private notificationService: NotificationService) {}

  registrarPadre() {
    const data = {
      documentoEstudiante: this.documentoEstudiante,
      documentoPadre: this.documentoPadre,
      nombrePadre: this.nombrePadre,
    };

    if (!this.documentoEstudiante || !this.documentoPadre || !this.nombrePadre) {
      this.notificationService.showNotification('Por favor, complete todos los campo.', 'danger');
      return; // Detener la ejecución del método
    }

    this.http.post<any>('http://localhost:3000/registrarPadres/registrar-padre', data)
      .subscribe(
        response => {
          console.error(response.message);
          this.documentoEstudiante = '';
          this.documentoPadre = '';
          this.nombrePadre = '';
          this.notificationService.showNotification('Padre registrado con éxito.', 'success');
        },
        error => {
          if(error.status === 400){
            this.notificationService.showNotification('El estudiante no existe en la base de datos.', 'danger');
          }else if(error.status === 401){
            this.notificationService.showNotification('El padre ya está registrado en la base de datos.', 'danger');
          }else if(error.status === 200){
            this.notificationService.showNotification('Padre registrado exitosamente.', 'success');
          }else if(error.status === 500){
            this.notificationService.showNotification('Error al registrar padre.', 'danger');
          }
        }
      );
  }
}
