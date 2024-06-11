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

  buscarPadres(page: number = 1, limit: number = 10) {
    this.http.post<any[]>(`http://localhost:3000/buscarPadres/buscar-padres?page=${page}&limit=${limit}`, {
      termino: this.terminoBusqueda
    }).subscribe(
      padres => {
        this.padres = padres.map(padre => ({ ...padre, editando: false }));
        this.terminoBusqueda = '';
        this.notificationService.showNotification('Padre encontrado con exito.', 'success');
      },
      // error => {
      //   console.error('Error al buscar padre:', error);
      //   if (error.error && error.error.error) {
      //     alert(error.error.error);
      //   }
      // }
      //Comentando y no eliminado por motivos de posible uso futuro
    );
  }

  cambiarPagina(page: number) {
    this.page = page;
    this.listarPadres(page, this.limit);
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

    // Validar que la identificación contenga solo números
    const identificacionNumerica = /^[0-9]+$/.test(padre.documento_padre.trim());
    if (!identificacionNumerica) {
      this.notificationService.showNotification('La identificación del padre debe contener solo números.', 'danger');
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
