  import { Component, OnInit } from '@angular/core';
  import { HttpClient } from '@angular/common/http';

  @Component({
    selector: 'app-buscar-estudiantes',
    templateUrl: './buscar-estudiantes.component.html',
    styleUrls: ['./buscar-estudiantes.component.scss']
  })
  export class BuscarEstudiantesComponent implements OnInit{
    terminoBusqueda: string = '';
    estudiantes: any[] = [];
    estudianteSeleccionado: any = null;
    page:  number = 1;
    estudianteOriginal: any = null;

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
      this.listarEstudiantes();
    }

    listarEstudiantes(page: number = 1, limit: number = 10) {
      const url = `http://localhost:3000/listarEstudiantes/listar-estudiantes?page=${page}&limit=${limit}`;
      this.http.get<any[]>(url).subscribe(
        estudiantes => {
          this.estudiantes = estudiantes;
        },
        error => {
          console.error('Error al obtener los estudiantes:', error);
          alert('Error al obtener los estudiantes. Por favor, intenta de nuevo.');
        }
      );
    }

    buscarEstudiante(page: number = 1, limit: number = 10) {
      const url = `http://localhost:3000/buscarEstudiantes/buscar-estudiantes?page=${page}&limit=${limit}`;
      this.http.post<any[]>(url, { termino: this.terminoBusqueda }).subscribe(
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

    cambiarPagina(page: number){
      this.page = page;
      this.listarEstudiantes(page);
    }


    editarEstudiante(index: number) {
      this.estudianteOriginal = { ...this.estudiantes[index] };
      console.log('Estudiante original:', this.estudianteOriginal);
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

      try {
        const response = await this.http.put<any>('http://localhost:3000/editarEstudiante/editar-estudiante', {
          estudiante
        }).toPromise();

        if (response && response.message === 'Estudiante actualizado') {
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
        this.http.delete<any>(`http://localhost:3000/eliminarEstudiante/eliminar-estudiante/${estudiante.documento_estudiante}`).toPromise();
        this.estudiantes.splice(index, 1); // Eliminar el estudiante del array
      } catch (error) {
        console.error('Error al eliminar estudiante:', error);
        alert('Error al eliminar estudiante. Por favor, intenta de nuevo.');
      }
    }


  }
