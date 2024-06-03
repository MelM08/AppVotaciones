import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

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

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

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
        alert('Error al obtener los candidatos. Por favor, intenta de nuevo.');
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
                alert('Debes proporcionar un término de búsqueda válido');
            } else if (error.status === 500) {
                alert('Error interno del servidor');
            } else {
                console.error('Error al buscar el candidato:', error);
                alert('Error al buscar el candidato. Por favor, intenta de nuevo.');
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

    try {
      const response = await this.http.put<any>('http://localhost:3000/editarCandidato/editar-candidato', { candidato }).toPromise();
      if (response && response.message === 'Candidato actualizado') {
        this.candidatos[index] = candidato; // Actualizar el candidato en la lista
        this.candidatos[index].editando = false;
      }
    } catch (error) {
      console.error('Error al editar el candidato:', error);
      alert('Error al editar el candidato. Por favor, intenta de nuevo.');
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
      }
    } catch (error) {
      console.error('Error al eliminar el candidato:', error);
      alert('Error al eliminar el candidato. Por favor, intenta de nuevo.');
    }
  }
}
