import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient) { }

  guardarEstudiante(): void {
    const estudiante = {
      documento: this.documento,
      nombre: this.nombre,
      grado: this.grado,
      sede: this.sede
    };

    // Validar si algún campo está vacío
    if (!this.documento || !this.nombre || !this.grado || !this.sede) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    // Continuar con la lógica para guardar el estudiante si pasa las validaciones

    this.http.post<any>('http://localhost:3000/registrarEstudiantes/registrar-estudiante', estudiante)
      .subscribe(
        response => {
          console.error(response.message);
          alert('Estudiante guardado con éxito')
          // Limpiar campos
          this.documento = '';
          this.nombre = '';
          this.grado = '';
          this.sede = '';
        },
        error => {
          if (error.status === 400) {
            alert('Ya existe un estudiante con ese documento')
          } else if (error.status === 401) {
            alert('El estudiante ya existe en la base de datos.')
          } else if (error.status === 200) {
            alert('Estudiante guardado correctamente en la base de datos.')
          } else if (error.status === 500) {
            alert('Error al guardar el estudiante en la base de datos.')
          }
        }
      );
  }
}
