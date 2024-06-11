import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { NotificationService} from '../../notification.service';

@Component({
  selector: 'app-listar-estamentos',
  templateUrl: './listar-estamentos.component.html',
  styleUrls: ['./listar-estamentos.component.scss']
})
export class ListarEstamentosComponent implements OnInit {
  eleccionId: number = 0;
  estamentos: any[] = [];
  terminoBusqueda: string = '';
  estamentoSeleccionado: any = null;
  estamentoOriginal: any = null;

  grados = [
    'Ninguno', "Todos", 'Transición', 'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 
    'Sexto', 'Septimo', 'Octavo', 'Noveno', 'Décimo', 'Once'
  ];

  roles = ['Todos', 'Estudiantes', 'Docentes', 'Padres de Familia'];

  constructor(private route: ActivatedRoute, private http: HttpClient, private notificationService: NotificationService) { }

  ngOnInit(): void {
    // Obtener el ID de la elección del padre (EstamentosComponent)
    this.route.parent?.params.subscribe(params => {
      this.eleccionId = +params['id']; // Convertir el parámetro de la URL a número
      this.listarEstamentos();
    });
  }

  listarEstamentos() {
    this.http.get<any[]>(`http://localhost:3000/listarEstamentos/listar-estamentos?eleccionId=${this.eleccionId}`).subscribe(
      estamentos => {
        this.estamentos = estamentos;
      },
      error => {
        this.notificationService.showNotification('Error al obtener los estamentos. Por favor, intenta de nuevo.', 'danger');
      }
    );
  }

  buscarEstamento(page: number = 1, limit: number = 10) {
    this.http.post<any[]>(`http://localhost:3000/buscarEstamentos/buscar-estamento?page=${page}&limit=${limit}`, {
      termino: this.terminoBusqueda
    }).subscribe(
      estamentos => {
        this.estamentos = estamentos.map(estamento => ({ ...estamento, editando: false }));
        this.terminoBusqueda = '';
      },
      error => {
        if (error.status === 400) {
          this.notificationService.showNotification('Debes proporcionar un término de búsqueda válido.', 'danger');
        } else if (error.status === 500) {
          this.notificationService.showNotification('Error interno del servidor.', 'danger');
        } else {
          console.error('Error al buscar el estamento:', error);
          this.notificationService.showNotification('Error al buscar el estamento. Por favor, intenta de nuevo.', 'danger');
        }
      }
    );
  }

  editarEstamento(index: number) {
    this.estamentoOriginal = { ...this.estamentos[index] };
    this.estamentos[index].editando = true;
  }

  cancelarEdicion(index: number) {
    this.estamentos[index] = { ...this.estamentoOriginal, editando: false };
  }

  async guardarEstamento(index: number) {
    const estamento = this.estamentos[index];
    const confirmacion = confirm('¿Estás seguro de guardar los cambios?');
    if (!confirmacion) {
      return;
    }

    // Validar que el nombre no esté vacío
    if (!estamento.nombre.trim()) {
      this.notificationService.showNotification('El nombre del estamento es obligatorio.', 'danger');
      return;
    }

    try {
      const response = await this.http.put<any>('http://localhost:3000/editarEstamento/editar-estamento', { estamento }).toPromise();
      if (response && response.message === 'Estamento actualizado') {
        this.estamentos[index].editando = false;
        this.notificationService.showNotification('Estamento actualizado exitosamente.', 'success');
      }
    } catch (error) {
      this.notificationService.showNotification('EError al editar el estamento. Por favor, intenta de nuevo.', 'danger');
    }
  }

  async eliminarEstamento(index: number) {
    const estamento = this.estamentos[index];
    const confirmacion = confirm('¿Estás seguro de eliminar este estamento?');
    if (!confirmacion) {
      return;
    }

    try {
      const response = await this.http.delete<any>(`http://localhost:3000/eliminarEstamento/eliminar-estamento/${estamento.id}`).toPromise();
      if (response && response.message === 'Estamento y sus dependencias eliminados') {
        this.estamentos.splice(index, 1); // Eliminar el estamento del array
        this.notificationService.showNotification('Estamento eliminado exitosamente.', 'success');
      }
    } catch (error) {
      this.notificationService.showNotification('Error al eliminar el estamento. Por favor, intenta de nuevo.', 'danger');
    }
  }
}
