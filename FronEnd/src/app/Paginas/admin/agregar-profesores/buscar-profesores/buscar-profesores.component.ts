import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-buscar-profesores',
  templateUrl: './buscar-profesores.component.html',
  styleUrls: ['./buscar-profesores.component.scss']
})
export class BuscarProfesoresComponent implements OnInit{
  terminoBusqueda: string = '';
  profesores: any[] = [];
  profesorSeleccionado: any = null;
  page: number = 1;
  limit: number = 10; // Número de elementos por página
  profesorOriginal: any = null;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.listarDocentes();
  }

  listarDocentes(page: number = 1, limit: number = 10) {
    this.http.get<any[]>(`http://localhost:3000/listarProfesores/listar-docentes?page=${page}&limit=${limit}`).subscribe(
      profesores => {
        this.profesores = profesores;
      },
      error => {
        console.error('Error al obtener los docentes:', error);
        alert('Error al obtener los docentes. Por favor, intenta de nuevo.');
      }
    );
  }

  buscarProfesores(page: number = 1, limit: number = 10) {
    this.http.post<any[]>(`http://localhost:3000/buscarProfesores/buscar-profesores?page=${page}&limit=${limit}`, {
      termino: this.terminoBusqueda
    }).subscribe(
      profesores => {
        this.profesores = profesores.map(profesor => ({ ...profesor, editando: false }));
        this.terminoBusqueda = '';
      },
      error => {
        if (error.status === 400) {
          alert('Debes proporcionar nombre y apellido o documento');
        } else if (error.status === 500) {
          alert('Error interno del servidor');
        }
      }
    );
  }

  cambiarPagina(page: number) {
    this.page = page;
    this.listarDocentes(page, this.limit);
  }

  editarProfesor(index: number) {
    const globalIndex = (this.page - 1) * this.limit + index;
    this.profesorOriginal = { ...this.profesores[globalIndex] };
    this.profesores[globalIndex].editando = true;
  }

  cancelarEdicion(index: number) {
    const globalIndex = (this.page - 1) * this.limit + index;
    this.profesores[globalIndex] = { ...this.profesorOriginal, editando: false };
  }

  async guardarProfesor(index: number) {
    const globalIndex = (this.page - 1) * this.limit + index;
    const profesor = this.profesores[globalIndex];
    const confirmacion = confirm('¿Estás seguro de guardar los cambios?');
    if (!confirmacion) {
      return;
    }

    try {
      const response = await this.http.put<any>('http://localhost:3000/editarProfesor/editar-profesor', {
        profesor
      }).toPromise();

      if (response && response.message === 'Profesor actualizado') {
        this.profesores[globalIndex].editando = false;
        this.profesores = [...this.profesores];
      }
    } catch (error) {
      console.error('Error al editar profesor:', error);
      alert('Error al editar profesor. Por favor, intenta de nuevo.');
    }
  }

  eliminarProfesor(index: number) {
    const globalIndex = (this.page - 1) * this.limit + index;
    const profesor = this.profesores[globalIndex];
    const confirmacion = confirm('¿Estás seguro de eliminar este profesor?');
    if (!confirmacion) {
      return;
    }

    try {
      this.http.delete<any>(`http://localhost:3000/eliminarProfesor/eliminar-profesor/${profesor.documento_docente}`).toPromise();
      this.profesores.splice(globalIndex, 1); // Eliminar el profesor del array
      this.profesores = [...this.profesores]; // Actualizar la lista
    } catch (error) {
      console.error('Error al eliminar profesor:', error);
      alert('Error al eliminar profesor. Por favor, intenta de nuevo.');
    }
  }
}
