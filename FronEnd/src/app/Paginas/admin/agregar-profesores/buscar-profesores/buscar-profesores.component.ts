import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-buscar-profesores',
  templateUrl: './buscar-profesores.component.html',
  styleUrl: './buscar-profesores.component.scss'
})
export class BuscarProfesoresComponent {
  terminoBusqueda: string = '';
  profesores: any[] = [];
  profesorSeleccionado: any = null;
  profesorOriginal: any = null;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.listarDocentes();
  }

  listarDocentes() {
    this.http.get<any[]>('http://localhost:3000/listar-docentes').subscribe(
      profesores => {
        this.profesores = profesores;
      },
      error => {
        console.error('Error al obtener los docentes:', error);
        alert('Error al obtener los docentes. Por favor, intenta de nuevo.');
      }
    );
  }

  buscarProfesores() {
    this.http.post<any[]>('http://localhost:3000/buscar-profesores', {
      termino: this.terminoBusqueda
    }).subscribe(
      profesores => {
            this.profesores = profesores.map(profesores => ({...profesores, editando: false}));
            this.terminoBusqueda = '';
        },
        error => {
          if(error.status === 400){
            alert('Debes proporcionar nombre y apellido o documento')
          }else if(error.status === 500){
            alert('Error interno del servidor')
          }
        }
    );
  }


  editarProfesor(index: number) {
    this.profesorOriginal = { ...this.profesores[index], documento_padre_original: this.profesores[index].documento_padre };
    this.profesores[index].editando = true;
  }



  cancelarEdicion(index: number) {
    this.profesores[index] = { ...this.profesorOriginal, editando: false };
  }


  async guardarProfesor(index: number) {
    const profesor = this.profesores[index];
    const confirmacion = confirm('¿Estás seguro de guardar los cambios?');
    if (!confirmacion) {
      return;
    }

    try {
      const response = await this.http.put<any>('http://localhost:3000/editar-profesor', {
        profesor
      }).toPromise();

      if (response && response.message === 'Profesor actualizado') {
        this.profesores[index].editando = false;
        this.profesores = [...this.profesores];
      }
    } catch (error) {
      console.error('Error al editar profesor:', error);
      alert('Error al editar profesor. Por favor, intenta de nuevo.');
    }
  }


  eliminarProfesor(index: number) {
    const profesor = this.profesores[index];
    const confirmacion = confirm('¿Estás seguro de eliminar este Profesor?');
    if (!confirmacion) {
      return;
    }

    try {
      this.http.delete<any>(`http://localhost:3000/eliminar-profesor/${profesor.id}`).toPromise();
      this.profesores.splice(index, 1); // Eliminar el profesor del array
      this.profesores = [...this.profesores]; // Actualizar la lista
    } catch (error) {
      console.error('Error al eliminar profesor:', error);
      alert('Error al eliminar profesor. Por favor, intenta de nuevo.');
    }
  }

}
