import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService} from '../../notification.service';

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

  constructor(private http: HttpClient, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.listarElecciones();
  }

  listarElecciones() {
    this.http.get<any[]>('http://localhost:3000/listarElecciones/listar-elecciones').subscribe(
      elecciones => {
        this.elecciones = elecciones;
      },
      error => {
        this.notificationService.showNotification('Error al obtener las elecciones. Por favor, intenta de nuevo.', 'danger');
      }
    );
  }

  buscarEleccion(page: number = 1, limit: number = 10) {
    this.http.post<any[]>(`http://localhost:3000/buscarElecciones/buscar-eleccion?page=${page}&limit=${limit}`, {
        termino: this.terminoBusqueda
    }).subscribe(
        elecciones => {
            this.elecciones = elecciones.map(eleccion => ({ ...eleccion, editando: false }));
            this.terminoBusqueda = '';
        },
        error => {
            if (error.status === 400) {
                this.notificationService.showNotification('Debes proporcionar un término de búsqueda válido.', 'danger');
            } else if (error.status === 500) {
                this.notificationService.showNotification('Error interno del servidor', 'danger');
            } else {
                this.notificationService.showNotification('Error al buscar la elección. Por favor, intenta de nuevo.', 'danger');
            }
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
  
    // Validar que el nombre no esté vacío
    if (!eleccion.nombre.trim()) {
      this.notificationService.showNotification('El nombre de la elección es obligatorio.', 'danger');
      return;
    }

    // Validar que el año no esté vacío
    if (!eleccion.ano.trim()) {
      this.notificationService.showNotification('El año de la elección es obligatorio.', 'danger');
      return;
    }
    
    // Validar que el año sea un número y tenga exactamente cuatro dígitos
    const anoValido = /^\d{4}$/.test(eleccion.ano);
    if (!anoValido) {
      this.notificationService.showNotification('El año de la elección debe ser un número de cuatro dígitos.', 'danger');
      return;
    }

    try {
      const response = await this.http.put<any>('http://localhost:3000/editarEleccion/editar-eleccion', { eleccion }).toPromise();
      if (response && response.message === 'Elección actualizada') {
        this.elecciones[index] = eleccion; // Actualizar la elección en la lista
        this.elecciones[index].editando = false;
        this.notificationService.showNotification('Eleccion editada correctamente.', 'success');
      }
    } catch (error) {
      this.notificationService.showNotification('Error al editar la elección. Por favor, intenta de nuevo.', 'danger');
    }
  }

  async eliminarEleccion(index: number) {
    const eleccion = this.elecciones[index];
    const confirmacion = confirm('¿Estás seguro de eliminar esta elección?');
    if (!confirmacion) {
      return;
    }

    try {
      const response = await this.http.delete<any>(`http://localhost:3000/eliminarEleccion/eliminar-eleccion/${eleccion.id}`).toPromise();
      if (response && response.message === 'Elección y sus dependencias eliminadas') {
        this.notificationService.showNotification('Eleccion eliminada correctamente.', 'success');
        this.elecciones.splice(index, 1); // Eliminar la elección del array
        this.notificationService.showNotification('Eleccion eliminada exitosamente.', 'success');
      }
    } catch (error) {
      this.notificationService.showNotification('Error al eliminar la elección. Por favor, intenta de nuevo.', 'danger');
    }
  }
}
