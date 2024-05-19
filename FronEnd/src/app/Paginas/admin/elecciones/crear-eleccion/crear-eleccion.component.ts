import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-crear-eleccion',
  templateUrl: './crear-eleccion.component.html',
  styleUrl: './crear-eleccion.component.scss'
})
export class CrearEleccionComponent {
  nombre: string = '';
  ano: string = '';
  estado: string = 'ACTIVO';

  constructor(private http: HttpClient) { }

  crearEleccion(): void {
    // Verificar si algún campo está vacío o contiene solo espacios en blanco
    if (!this.nombre.trim() || !this.ano.trim()) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    // Verificar si el año es un número de 4 dígitos
    const anoRegex = /^\d{4}$/;
    if (!anoRegex.test(this.ano.trim())) {
      alert('El año debe ser un número de 4 dígitos.');
      return;
    }

    // Crear el objeto de elección
    const eleccion = {
      nombre: this.nombre.trim(), // Eliminar espacios en blanco al principio y al final
      ano: this.ano.trim(), // También eliminamos espacios en blanco del año
      estado: this.estado
    };

    // Envía la solicitud HTTP para crear la elección
    this.http.post<any>('http://localhost:3000/crearEleccion/crear-eleccion', eleccion)
      .subscribe(
        response => {
          console.log(response.message);
          alert('Elección creada con éxito');
          // Limpiar campos después de la creación exitosa
          this.nombre = '';
          this.ano = ''; // Limpiamos el campo del año también
        },
        error => {
          if (error.status === 200) {
            alert('Elección creada con éxito en la base de datos.');
          } else if (error.status === 500) {
            alert('Error al crear la elección en la base de datos.');
          }
        }
      );
  }
}
