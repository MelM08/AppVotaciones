import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService} from '../../notification.service';

@Component({
  selector: 'app-buscar-padres',
  templateUrl: './buscar-padres.component.html',
  styleUrls: ['./buscar-padres.component.scss']
})
export class BuscarPadresComponent implements OnInit{
  terminoBusqueda: string = '';
  padres: any[] = [];
  padreSeleccionado: any = null;
  page: number = 1;
  limit: number = 10; // Número de elementos por página
  padreOriginal: any = null;
  busquedaActiva: boolean = false; // Nuevo estado para la búsqueda activa

  constructor(private http: HttpClient, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.listarPadres();
  }

  listarPadres(page: number = 1, limit: number = 10) {
    this.http.get<any[]>(`http://localhost:3000/listarPadres/listar-padres?page=${page}&limit=${limit}`).subscribe(
      padres => {
        this.padres = padres;
      },
      error => {
        console.error('Error al obtener los padres:', error);
        this.notificationService.showNotification('Error al obtener los padres. Por favor, intenta de nuevo.', 'danger');
      }
    );
  }

  buscarPadres(){
        // Revisar si hay un término de búsqueda
    if (this.terminoBusqueda.trim()) {
      this.page = 1; // Resetear la página a 1
      this.buscarPadresPorTermino();
    } else {
      // Si no hay término de búsqueda, mostrar todos los padres
      this.mostrarTodosLosPadres();
    }
  }

  buscarPadresPorTermino() {
    const url = `http://localhost:3000/buscarPadres/buscar-padres?page=${this.page}&limit=${this.limit}`;
    this.http.post<any[]>(url , {termino: this.terminoBusqueda}).subscribe(
      padres => {
        this.padres = padres.map(padre => ({ ...padre, editando: false }));
        this.terminoBusqueda = '';
        if (this.padres.length === 0) {
          // Si no hay resultados, mostrar una notificación
          this.notificationService.showNotification('No se encontraron padres que coincidan con el término de búsqueda.', 'warning');
        } else {
          this.notificationService.showNotification('Padres encontrados.', 'success');
        }
      },
      error => {
        console.error('Error al buscar padre:', error);
        this.notificationService.showNotification('Error al buscar padres. Por favor, intenta de nuevo.', 'danger');
      }
    );
  }

  mostrarTodosLosPadres(){
    this.terminoBusqueda = ''; // Limpiar el término de búsqueda
    this.listarPadres(1, this.limit); // Listar todos los estudiantes desde la página 1
    this.notificationService.showNotification('Mostrando todos los padres.', 'success');
    this.busquedaActiva = false; // Desactivar el estado de búsqueda
  }

  cambiarPagina(page: number) {
    this.page = page;
    if (this.busquedaActiva) {
      // Realizar búsqueda en la nueva página
      this.buscarPadresPorTermino();
    } else {
      // Listar estudiantes normales en la nueva página
      this.listarPadres(page, this.limit);
    }
  }

  editarPadre(index: number) {
    const globalIndex = (this.page - 1) * this.limit + index;
    this.padreOriginal = { ...this.padres[globalIndex], documento_padre_original: this.padres[globalIndex].documento_padre };
    this.padres[globalIndex].editando = true;
  }

  cancelarEdicion(index: number) {
    const globalIndex = (this.page - 1) * this.limit + index;
    this.padres[globalIndex] = { ...this.padreOriginal, editando: false };
  }

  async guardarPadre(index: number) {
    const globalIndex = (this.page - 1) * this.limit + index;
    const padre = this.padres[globalIndex];
    const confirmacion = confirm('¿Estás seguro de guardar los cambios?');
    if (!confirmacion) {
      return;
    }

    // Validar que el nombre no esté vacío
    if (!padre.nombre_padre.trim()) {
      this.notificationService.showNotification('El nombre del padre es obligatorio.', 'danger');
      return;
    }

    // Validar que la identificación no esté vacía
    if (!padre.documento_padre.trim()) {
      this.notificationService.showNotification('La identificación del padre es obligatoria.', 'danger');
      return;
    }

    // Validar que la identificación contenga solo números o comience con una N seguida de números
    const identificacionValida = /^[0-9]+$/.test(padre.documento_padre.trim());

    if (!identificacionValida) {
      this.notificationService.showNotification('La identificación del estudiante debe contener solo números o una N seguida de números.', 'danger');
      return;
    }

    // Verificar si la identificación está ocupada por otro padre
    const identificacionOcupada = this.padres.some((p, i) => i !== globalIndex && p.documento_padre === padre.documento_padre.trim());
    if (identificacionOcupada) {
      this.notificationService.showNotification('La identificación ingresada ya está siendo utilizada por otro padre.', 'danger');
      return;
    }

    try {
      const response = await this.http.put<any>('http://localhost:3000/editarPadre/editar-padre', {
        padre,
        documento_padre_original: this.padreOriginal.documento_padre_original
      }).toPromise();

      if (response && response.message === 'Padre actualizado') {
        this.padres[globalIndex].editando = false;
        this.padres = [...this.padres];
        this.notificationService.showNotification('Padre actualizado correctamente.', 'success');
      }
    } catch (error) {
      console.error('Error al editar padre:', error);
      this.notificationService.showNotification('Error al editar padre. Por favor, intenta de nuevo.', 'danger');
    }
  }

  eliminarPadre(index: number) {
    const globalIndex = (this.page - 1) * this.limit + index;
    const padre = this.padres[globalIndex];
    const confirmacion = confirm('¿Estás seguro de eliminar este padre?');
    if (!confirmacion) {
      return;
    }

    try {
      this.http.delete<any>(`http://localhost:3000/eliminarPadres/eliminar-padre/${padre.documento_padre}`).toPromise();
      this.padres.splice(globalIndex, 1); // Eliminar el padre del array
      this.padres = [...this.padres]; // Actualizar la lista
      this.notificationService.showNotification('Padre eliminado exitosamente.', 'success');
    } catch (error) {
      console.error('Error al eliminar padre:', error);
      this.notificationService.showNotification('Error al eliminar padre. Por favor, intenta de nuevo.', 'danger');
    }
  }
}
