import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-registrar-padres',
  templateUrl: './registrar-padres.component.html',
  styleUrl: './registrar-padres.component.scss'
})
export class RegistrarPadresComponent {
  documentoEstudiante: string = '';
  documentoPadre: string = '';
  nombrePadre: string = '';
  apellidoPadre: string = '';

  constructor(private http: HttpClient) {}

  registrarPadre() {
    const data = {
      documentoEstudiante: this.documentoEstudiante,
      documentoPadre: this.documentoPadre,
      nombrePadre: this.nombrePadre,
      apellidoPadre: this.apellidoPadre
    };

    if (!this.documentoEstudiante || !this.documentoPadre || !this.nombrePadre || !this.nombrePadre) {
      alert('Por favor, complete todos los campos.');
      return; // Detener la ejecución del método
    }

    this.http.post<any>('http://localhost:3000/registrar-padre', data)
      .subscribe(
        response => {
          alert(response.message);
          this.clearFields();
          alert('Padre registrado con éxito')
        },
        error => {
          if(error.status === 400){
            alert('El estudiante no existe en la base de datos.')
          }else if(error.status === 401){
            alert('El padre ya está registrado en la base de datos.')
          }else if(error.status === 200){
            alert('Padre registrado exitosamente.')
          }else if(error.status === 500){
            alert('Error al registrar padre.')
          }
        }
      );
  }

  clearFields() {
    this.documentoEstudiante = '';
    this.documentoPadre = '';
    this.nombrePadre = '';
    this.apellidoPadre = '';
  }
}
