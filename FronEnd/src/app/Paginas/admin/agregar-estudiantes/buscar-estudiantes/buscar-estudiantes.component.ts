  import { Component } from '@angular/core';
  import { HttpClient } from '@angular/common/http';

  @Component({
    selector: 'app-buscar-estudiantes',
    templateUrl: './buscar-estudiantes.component.html',
    styleUrls: ['./buscar-estudiantes.component.scss']
  })
  export class BuscarEstudiantesComponent {
    terminoBusqueda: string = '';
    estudiantes: any[] = [];
    estudianteSeleccionado: any = null;
    estudianteOriginal: any = null;

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
      this.listarEstudiantes();
    }

    listarEstudiantes() {
      this.http.get<any[]>('http://localhost:3000/listar-estudiantes').subscribe(
        estudiantes => {
          this.estudiantes = estudiantes;
        },
        error => {
          console.error('Error al obtener los estudiantes:', error);
          alert('Error al obtener los estudiantes. Por favor, intenta de nuevo.');
        }
      );
    }

    buscarEstudiante() {
      // if (!this.terminoBusqueda.trim()) {
      //   alert('Debes proporcionar un término de búsqueda');
      //   return;
      // }
      this.http.post<any[]>('http://localhost:3000/buscar-estudiantes', {
        termino: this.terminoBusqueda
      }).subscribe(
        estudiantes => {
          this.estudiantes = estudiantes.map(estudiante => ({ ...estudiante, editando: false }));
          this.terminoBusqueda = '';
        },
        error => {
          console.error('Error al buscar estudiantes:', error);
          if (error.error && error.error.error) {
            alert(error.error.error);
          } else {
            alert('Error interno del servidor');
          }
        }
      );
    }



    editarEstudiante(index: number) {
      this.estudianteOriginal = { ...this.estudiantes[index] };
      this.estudiantes[index].editando = true;
    }


    cancelarEdicion(index: number) {
      this.estudiantes[index] = { ...this.estudianteOriginal, editando: false };
    }


    async guardarEstudiante(index: number) {
      const estudiante = this.estudiantes[index];
      const confirmacion = confirm('¿Estás seguro de guardar los cambios?');
      if (!confirmacion) {
        return;
      }

      const gradoPattern = /^(?:[1-9]|1[0-1])-[1-9]$|^1[0-1]-[1-9][0-9]$/;
      if (!gradoPattern.test(estudiante.grado_estudiante)) {
        alert('Formato de grado inválido. Debe ser en el formato X-X y debe de estar entre 1 y 11 el primer número.');
        return;
      }

      try {
        const response = await this.http.put<any>('http://localhost:3000/editar-estudiante', { estudiante }).toPromise();
        if (response && response.message === 'Estudiante actualizado') {
          this.estudiantes[index] = estudiante; // Actualizar el estudiante en la lista
          this.estudiantes[index].editando = false;
          this.estudiantes = [...this.estudiantes];
        }
      } catch (error) {
        console.error('Error al editar estudiante:', error);
        alert('Error al editar estudiante. Por favor, intenta de nuevo.');
      }
    }


    eliminarEstudiante(index: number) {
      const estudiante = this.estudiantes[index];
      const confirmacion = confirm('¿Estás seguro de eliminar este estudiante?');
      if (!confirmacion) {
        return;
      }

      try {
        this.http.delete<any>(`http://localhost:3000/eliminar-estudiante/${estudiante.documento_estudiante}`).toPromise();
        this.estudiantes.splice(index, 1); // Eliminar el estudiante del array
      } catch (error) {
        console.error('Error al eliminar estudiante:', error);
        alert('Error al eliminar estudiante. Por favor, intenta de nuevo.');
      }
    }


  }
