import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService, Notification } from '../../notification.service';

@Component({
  selector: 'app-registrar-estudiantes',
  templateUrl: './registrar-estudiantes.component.html',
  styleUrls: ['./registrar-estudiantes.component.scss']
})
export class RegistrarEstudiantesComponent {
  documento: string = '';
  nombre: string = '';
  apellido: string = '';
  grado: string = '';
  sede: string = '';

  constructor(private http: HttpClient, private notificationService: NotificationService) { }

  guardarEstudiante(): void {
    const estudiante = {
      documento: this.documento,
      nombre: this.nombre,
      grado: this.grado,
      sede: this.sede
    };

    // Validar si algún campo está vacío
    if (!this.documento || !this.nombre || !this.grado || !this.sede) {
      this.notificationService.showNotification('Por favor, complete todos los campos.', 'warning');
      return;
    }

    // Continuar con la lógica para guardar el estudiante si pasa las validaciones

    this.http.post<any>('http://localhost:3000/registrarEstudiantes/registrar-estudiante', estudiante)
      .subscribe(
        response => {
          console.error(response.message);
          this.notificationService.showNotification('Estudiante guardado con éxito.', 'success');
          // Limpiar campos
          this.documento = '';
          this.nombre = '';
          this.grado = '';
          this.sede = '';
        },
        error => {
          if (error.status === 400) {
            this.notificationService.showNotification('Ya existe un estudiante con ese documento.', 'success');
          } else if (error.status === 401) {
            this.notificationService.showNotification('El estudiante ya existe en la base de datos.', 'success');
          } else if (error.status === 200) {
            this.notificationService.showNotification('Estudiante guardado correctamente en la base de datos.', 'success');
          } else if (error.status === 500) {
            this.notificationService.showNotification('Error al guardar el estudiante en la base de datos.', 'success');
          }
        }
      );
  }
}
