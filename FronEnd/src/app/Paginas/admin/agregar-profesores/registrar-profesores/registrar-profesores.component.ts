import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService} from '../../notification.service';

@Component({
  selector: 'app-registrar-profesores',
  templateUrl: './registrar-profesores.component.html',
  styleUrl: './registrar-profesores.component.scss'
})
export class RegistrarProfesoresComponent {
  documento: string = '';
  nombre: string = '';
  sede: string = '';

  constructor(private http: HttpClient, private notificationService: NotificationService) { }

  guardarProfesor(): void {
    const profesor = {
      documento: this.documento,
      nombre: this.nombre,
    };

    if (!this.documento || !this.nombre) {
      alert('Por favor, complete todos los campos.');
      return; // Detener la ejecución del método
    }

    this.http.post<any>('http://localhost:3000/registrarProfesores/registrar-profesor', profesor)
      .subscribe(
        response => {
          console.error(response.message);
          this.notificationService.showNotification('profesor guardado con éxito.', 'success');
          //limpiar campos
          this.documento = '';
          this.nombre = '';
        },
        error => {
          if(error.status === 400){
            this.notificationService.showNotification('Ya existe un profesor con ese documento.', 'danger');
          }else if(error.status === 401){
            this.notificationService.showNotification('El profesor ya existe en la base de datos.', 'danger');
          }else if(error.status === 200){
            this.notificationService.showNotification('Profesor guardado correctamente en la base de datos.', 'success');
          }else if(error.status === 500){
            this.notificationService.showNotification('Error al guardar el profesor en la base de datos.', 'danger');
          }
        }
      );
  }
}
