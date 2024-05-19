import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-listar-elecciones',
  templateUrl: './listar-elecciones.component.html',
  styleUrls: ['./listar-elecciones.component.scss']
})
export class ListarEleccionesComponent implements OnInit {
  elecciones: any[] = [];
  terminoBusqueda: string = '';
  eleccionSeleccionada: any = null;
  eleccionOriginal: any = null;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.listarElecciones();
  }

  listarElecciones() {
    this.http.get<any[]>('http://localhost:3000/listar-elecciones').subscribe(
      elecciones => {
        this.elecciones = elecciones;
      },
      error => {
        console.error('Error al obtener las elecciones:', error);
        alert('Error al obtener las elecciones. Por favor, intenta de nuevo.');
      }
    );
  }

  buscarEleccion() {
    this.http.post<any[]>('http://localhost:3000/buscar-eleccion', {
      termino: this.terminoBusqueda
    }).subscribe(
      elecciones => {
        this.elecciones = elecciones;
        this.terminoBusqueda = '';
      },
      error => {
        console.error('Error al buscar la elección:', error);
        alert('Error al buscar la elección. Por favor, intenta de nuevo.');
      }
    );
  }

  editarEleccion(index: number) {
    this.eleccionOriginal = { ...this.elecciones[index] };
    this.elecciones[index].editando = true;
  }

  cancelarEdicion(index: number) {
    this.elecciones[index] = { ...this.eleccionOriginal, editando: false };
  }

  async guardarEleccion(index: number) {
    const eleccion = this.elecciones[index];
    const confirmacion = confirm('¿Estás seguro de guardar los cambios?');
    if (!confirmacion) {
      return;
    }

    try {
      const response = await this.http.put<any>('http://localhost:3000/editar-eleccion', { eleccion }).toPromise();
      if (response && response.message === 'Eleccion actualizada') {
        this.elecciones[index] = eleccion; // Actualizar la elección en la lista
        this.elecciones[index].editando = false;
      }
    } catch (error) {
      console.error('Error al editar la elección:', error);
      alert('Error al editar la elección. Por favor, intenta de nuevo.');
    }
  }

  eliminarEleccion(index: number) {
    const eleccion = this.elecciones[index];
    const confirmacion = confirm('¿Estás seguro de eliminar esta elección?');
    if (!confirmacion) {
      return;
    }

    try {
      this.http.delete<any>(`http://localhost:3000/eliminar-eleccion/${eleccion.id}`).toPromise();
      this.elecciones.splice(index, 1); // Eliminar la elección del array
    } catch (error) {
      console.error('Error al eliminar la elección:', error);
      alert('Error al eliminar la elección. Por favor, intenta de nuevo.');
    }
  }
}
