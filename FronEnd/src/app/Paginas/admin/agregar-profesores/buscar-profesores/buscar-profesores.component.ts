import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService} from '../../notification.service';

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
  busquedaActiva: boolean = false; // Nuevo estado para la búsqueda activa

  constructor(private http: HttpClient, private notificationService: NotificationService) { }

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
        this.notificationService.showNotification('Error al obtener los docentes. Por favor, intenta de nuevo.', 'danger');
      }
    );
  }

  buscarProfesores() {
    // Revisar si hay un término de búsqueda
    if (this.terminoBusqueda.trim()) {
      this.page = 1; // Resetear la página a 1
      this.buscarProfesoresPorTermino();
    } else {
      // Si no hay término de búsqueda, mostrar todos los profesores
      this.mostrarTodosLosEstudiantes();
    }
  }

  buscarProfesoresPorTermino(){
    const url = `http://localhost:3000/buscarProfesores/buscar-profesores?page=${this.page}&limit=${this.limit}`;
    this.http.post<any[]>(url, {termino: this.terminoBusqueda}).subscribe(
      profesores => {
        this.profesores = profesores.map(profesor => ({ ...profesor, editando: false }));
        this.terminoBusqueda = '';
        if (this.profesores.length === 0) {
          // Si no hay resultados, mostrar una notificación
          this.notificationService.showNotification('No se encontraron profesores que coincidan con el término de búsqueda.', 'warning');
        } else {
          this.notificationService.showNotification('Profesores encontrados.', 'success');
        }
      },
      error => {
        console.error('Error al buscar profesor:', error);
        this.notificationService.showNotification('Error al buscar profesores. Por favor, intenta de nuevo.', 'danger');
      }

    );
  }

  mostrarTodosLosEstudiantes(){
    this.terminoBusqueda = '';
    this.listarDocentes(1, this.limit);
    this.notificationService.showNotification('Mostrando todos los profesores.', 'success');
    this.busquedaActiva = false;
  }


  cambiarPagina(page: number) {
    this.page = page;
    if(this.busquedaActiva){
      // Realizar búsqueda en la nueva página
      this.buscarProfesoresPorTermino();
    }else{
      //Listar profesores normales en la nueva página
      this.mostrarTodosLosEstudiantes();
    }
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

    // Validar que el nombre no esté vacío
    if (!profesor.nombre_docente.trim()) {
      this.notificationService.showNotification('El nombre del profesor es obligatorio.', 'danger');
      return;
    }

    // Validar que la identificación no esté vacía
    if (!profesor.documento_docente.trim()) {
      this.notificationService.showNotification('La identificación del profesor es obligatoria.', 'danger');
      return;
    }

    // Validar que la identificación contenga solo números
    const identificacionNumerica = /^[0-9]+$/.test(profesor.documento_docente.trim());
    if (!identificacionNumerica) {
      this.notificationService.showNotification('La identificación del profesor debe contener solo números.', 'danger');
      return;
    }

    // Verificar si la identificación está ocupada por otro profesor
    const identificacionOcupada = this.profesores.some((p, i) => i !== globalIndex && p.documento_docente === profesor.documento_docente.trim());
    if (identificacionOcupada) {
      this.notificationService.showNotification('La identificación ingresada ya está siendo utilizada por otro profesor.', 'danger');
      return;
    }

    try {
      const response = await this.http.put<any>('http://localhost:3000/editarProfesor/editar-profesor', {
        profesor
      }).toPromise();

      if (response && response.message === 'Profesor actualizado') {
        this.profesores[globalIndex].editando = false;
        this.profesores = [...this.profesores];
        this.notificationService.showNotification('Profesor actualizado correctamente.', 'success');
      }
    } catch (error) {
      console.error('Error al editar profesor:', error);
      this.notificationService.showNotification('Error al editar profesor. Por favor, intenta de nuevo.', 'danger');
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
      this.notificationService.showNotification('Profesor eliminado exitosamente.', 'success');
    } catch (error) {
      console.error('Error al eliminar profesor:', error);
      this.notificationService.showNotification('Error al eliminar profesor. Por favor, intenta de nuevo.', 'danger');
    }
  }
}
