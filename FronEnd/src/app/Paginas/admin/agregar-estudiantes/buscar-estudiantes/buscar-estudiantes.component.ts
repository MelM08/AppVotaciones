import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService} from '../../notification.service';

@Component({
  selector: 'app-buscar-estudiantes',
  templateUrl: './buscar-estudiantes.component.html',
  styleUrls: ['./buscar-estudiantes.component.scss']
})
export class BuscarEstudiantesComponent implements OnInit{
  terminoBusqueda: string = '';
  estudiantes: any[] = [];
  estudianteSeleccionado: any = null;
  page: number = 1;
  limit: number = 10; // Número de elementos por página
  estudianteOriginal: any = null;

  constructor(private http: HttpClient, private notificationService: NotificationService) { }

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
        this.notificationService.showNotification('Error al obtener los estudiantes. Por favor, intenta de nuevo.', 'danger');
      }
    );
  }

  buscarEstudiante(page: number = 1, limit: number = 10) {
    this.page = 1;
    const url = `http://localhost:3000/buscarEstudiantes/buscar-estudiantes?page=${page}&limit=${limit}`;
    this.http.post<any[]>(url, { termino: this.terminoBusqueda }).subscribe(
      estudiantes => {
        this.estudiantes = estudiantes.map(estudiante => ({ ...estudiante, editando: false }));
        this.terminoBusqueda = '';
        this.notificationService.showNotification('Estudiante encontrado con exito.', 'success');
      },
      // error => {
      //   console.error('Error al buscar estudiantes:', error);
      //   if (error.error && error.error.error) {
      //     alert(error.error.error);
      //   }
      // }
      //Comentando y no eliminado por motivos de posible uso futuro
    );
  }

  cambiarPagina(page: number){
    this.page = page;
    this.listarEstudiantes(page, this.limit);
  }

  editarEstudiante(index: number) {
    const globalIndex = (this.page - 1) * this.limit + index;
    this.estudianteOriginal = { ...this.estudiantes[globalIndex] };
    this.estudiantes[globalIndex].editando = true;
  }

  cancelarEdicion(index: number) {
    const globalIndex = (this.page - 1) * this.limit + index;
    this.estudiantes[globalIndex] = { ...this.estudianteOriginal, editando: false };
  }

  async guardarEstudiante(index: number) {
    const globalIndex = (this.page - 1) * this.limit + index;
    const estudiante = this.estudiantes[globalIndex];
    const confirmacion = confirm('¿Estás seguro de guardar los cambios?');
    if (!confirmacion) {
      return;
    }

    // Validar que el nombre no esté vacío
    if (!estudiante.nombre_estudiante.trim()) {
      this.notificationService.showNotification('El nombre del estudiante es obligatorio.', 'danger');
      return;
    }

    // Validar que la identificación no esté vacía
    if (!estudiante.documento_estudiante.trim()) {
      this.notificationService.showNotification('La identificación del estudiante es obligatoria.', 'danger');
      return;
    }

    // Validar que la identificación contenga solo números
    const identificacionNumerica = /^[0-9]+$/.test(estudiante.documento_estudiante.trim());
    if (!identificacionNumerica) {
      this.notificationService.showNotification('La identificación del estudiante debe contener solo números.', 'danger');
      return;
    }

    // Verificar si la identificación está ocupada por otro estudiante
    const identificacionOcupada = this.estudiantes.some((p, i) => i !== globalIndex && p.documento_estudiante === estudiante.documento_estudiante.trim());
    if (identificacionOcupada) {
      this.notificationService.showNotification('La identificación ingresada ya está siendo utilizada por otro estudiante.', 'danger');
      return;
    }

    try {
      const response = await this.http.put<any>('http://localhost:3000/editarEstudiante/editar-estudiante', {
        estudiante
      }).toPromise();

      if (response && response.message === 'Estudiante actualizado') {
        this.estudiantes[globalIndex].editando = false;
        this.estudiantes = [...this.estudiantes];
        this.notificationService.showNotification('Estudiante actualizado correctamente.', 'success');
      }
    } catch (error) {
      console.error('Error al editar estudiante:', error);
      this.notificationService.showNotification('Error al editar estudiante. Por favor, intenta de nuevo.', 'danger');
    }
  }

  eliminarEstudiante(index: number) {
    const globalIndex = (this.page - 1) * this.limit + index;
    const estudiante = this.estudiantes[globalIndex];
    const confirmacion = confirm('¿Estás seguro de eliminar este estudiante?');
    if (!confirmacion) {
      return;
    }

    try {
      this.http.delete<any>(`http://localhost:3000/eliminarEstudiante/eliminar-estudiante/${estudiante.documento_estudiante}`).toPromise();
      this.estudiantes.splice(globalIndex, 1); // Eliminar el estudiante del array
      this.notificationService.showNotification('Estudiante eliminado correctamente.', 'success');
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
      this.notificationService.showNotification('Error al eliminar estudiante. Por favor, intenta de nuevo.', 'success');
    }
  }
}
