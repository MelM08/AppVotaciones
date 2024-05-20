import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-registrar-profesores',
  templateUrl: './registrar-profesores.component.html',
  styleUrl: './registrar-profesores.component.scss'
})
export class RegistrarProfesoresComponent {
  documento: string = '';
  nombre: string = '';
  sede: string = '';

  constructor(private http: HttpClient) { }

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
          alert('profesor guardado con éxito')
          //limpiar campos
          this.documento = '';
          this.nombre = '';
        },
        error => {
          if(error.status === 400){
            alert('Ya existe un profesor con ese documento')
          }else if(error.status === 401){
            alert('El profesor ya existe en la base de datos.')
          }else if(error.status === 200){
            alert('profesor guardado correctamente en la base de datos.')
          }else if(error.status === 500){
            alert('Error al guardar el profesor en la base de datos.')
          }
        }
      );
  }
}
