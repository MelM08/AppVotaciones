import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { NotificationService} from '../../notification.service';

@Component({
  selector: 'app-listar-candidatos',
  templateUrl: './listar-candidatos.component.html',
  styleUrls: ['./listar-candidatos.component.scss']
})
export class ListarCandidatosComponent implements OnInit {
  estamentoId: number = 0;
  candidatos: any[] = [];
  terminoBusqueda: string = '';
  candidatoSeleccionado: any = null;
  candidatoOriginal: any = null;
  imagenSeleccionadaURL: string | null = null;

  constructor(
    private route: ActivatedRoute, private http: HttpClient, private notificationService: NotificationService) { }

  ngOnInit(): void {
    // Obtener el ID de la elección del padre (EleccionesComponent)
    this.route.parent?.params.subscribe(params => {
      this.estamentoId = +params['id']; // Convertir el parámetro de la URL a número
      this.listarCandidatos();
    }); 
  }

  listarCandidatos() {
    this.http.get<any[]>(`http://localhost:3000/listarCandidatos/listar-candidatos?estamentoId=${this.estamentoId}`).subscribe(
      candidatos => {
        this.candidatos = candidatos;
      },
      error => {
        console.error('Error al obtener los candidatos:', error);
        this.notificationService.showNotification('Error al obtener los candidatos. Por favor, intenta de nuevo.', 'danger');
      }
    );
  }

  buscarCandidato(page: number = 1, limit: number = 10) {
    this.http.post<any[]>(`http://localhost:3000/buscarCandidatos/buscar-candidato?page=${page}&limit=${limit}`, {
        termino: this.terminoBusqueda
    }).subscribe(
        candidatos => {
            this.candidatos = candidatos.map(candidato => ({ ...candidato, editando: false }));
            this.terminoBusqueda = '';
        },
        error => {
            if (error.status === 400) {
                this.notificationService.showNotification('Debes proporcionar un término de búsqueda válido.', 'danger');
            } else if (error.status === 500) {
                this.notificationService.showNotification('Error interno del servidor.', 'danger');
            } else {
                this.notificationService.showNotification('Error al buscar el candidato. Por favor, intenta de nuevo.', 'danger');
            }
        }
    );
  }

  editarCandidato(index: number) {
    this.candidatoOriginal = { ...this.candidatos[index] };
    this.candidatos[index].editando = true;
  }

  cancelarEdicion(index: number) {
    this.candidatos[index] = { ...this.candidatoOriginal, editando: false };
  }

  async guardarCandidato(index: number) {
    const candidato = this.candidatos[index];
    const confirmacion = confirm('¿Estás seguro de guardar los cambios?');
    if (!confirmacion) {
      return;
    }

    // Validar que el nombre no esté vacío
    if (!candidato.nombre.trim()) {
      this.notificationService.showNotification('El nombre del candidato es obligatorio.', 'danger');
      return;
    }

    // Validar que el numero del candidato no esté vacío
    if (!candidato.numero.trim()) {
      this.notificationService.showNotification('El numero del candidato es obligatorio.', 'danger');
      return;
    }

    // Validar que el número de candidato sea un número
    if (isNaN(candidato.numero.trim())) {
      this.notificationService.showNotification('El número de candidato debe ser un número válido.', 'danger');
      return;
    }

    // Validar que el número de candidato no esté ocupado
    const numeroOcupado = this.candidatos.some((c, i) => i !== index && c.numero === candidato.numero.trim());
    if (numeroOcupado) {
      this.notificationService.showNotification('El número de candidato ya está ocupado por otro candidato.', 'danger');
      return;
    }

    try {
      const response = await this.http.put<any>('http://localhost:3000/editarCandidato/editar-candidato', { candidato }).toPromise();
      if (response && response.message === 'Candidato actualizado') {
        this.candidatos[index] = candidato; // Actualizar el candidato en la lista
        this.candidatos[index].editando = false;
        this.notificationService.showNotification('Candidato actualizado exitosamente.', 'success');
      }
    } catch (error) {
      console.error('Error al editar el candidato:', error);
      this.notificationService.showNotification('Error al editar el candidato. Por favor, intenta de nuevo.', 'danger');
    }
  }

  async eliminarCandidato(index: number) {
    const candidato = this.candidatos[index];
    const confirmacion = confirm('¿Estás seguro de eliminar este candidato?');
    if (!confirmacion) {
      return;
    }

    try {
      const response = await this.http.delete<any>(`http://localhost:3000/eliminarCandidato/eliminar-candidato/${candidato.id}`).toPromise();
      if (response && response.message === 'Candidato eliminado') {
        this.candidatos.splice(index, 1); // Eliminar el candidato del array
        this.notificationService.showNotification('Candidato eliminado exitosamente.', 'success');
      }
    } catch (error) {
      console.error('Error al eliminar el candidato:', error);
      this.notificationService.showNotification('Error al eliminar el candidato. Por favor, intenta de nuevo.', 'danger');
    }
  }

  mostrarCandidato(index: number) {
    this.candidatoSeleccionado = this.candidatos[index];
    this.notificationService.showNotification('Vista previa del candidato.', 'success');
    if (this.candidatoSeleccionado.id_foto) {
      // Construir la URL correcta para la imagen del candidato usando el nuevo endpoint
      this.imagenSeleccionadaURL = `http://localhost:3000/imagenCandidato/imagen-candidato/${this.candidatoSeleccionado.id_foto}`;
    } else {
      this.imagenSeleccionadaURL = null;
      this.notificationService.showNotification('El candidato no tiene foto.', 'danger');
    }
  }

  // Método para cerrar la vista previa
  cerrarVistaPrevia() {
    this.candidatoSeleccionado = null;
    this.imagenSeleccionadaURL = null;
    this.notificationService.showNotification('Ha cerrado la vista previa.', 'success');
  }
}
