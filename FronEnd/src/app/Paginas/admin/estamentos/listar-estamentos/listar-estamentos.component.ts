import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

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
    'Ninguno', 'Preescolar', 'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto',
    'Sexto', 'Séptimo', 'Octavo', 'Noveno', 'Décimo', 'Once'
  ];

  roles = ['Todos', 'Estudiantes', 'Docentes', 'Padres'];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

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
        console.error('Error al obtener los estamentos:', error);
        alert('Error al obtener los estamentos. Por favor, intenta de nuevo.');
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
          alert('Debes proporcionar un término de búsqueda válido');
        } else if (error.status === 500) {
          alert('Error interno del servidor');
        } else {
          console.error('Error al buscar el estamento:', error);
          alert('Error al buscar el estamento. Por favor, intenta de nuevo.');
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

    try {
      const response = await this.http.put<any>('http://localhost:3000/editarEstamento/editar-estamento', { estamento }).toPromise();
      if (response && response.message === 'Estamento actualizado') {
        this.estamentos[index].editando = false;
      }
    } catch (error) {
      console.error('Error al editar el estamento:', error);
      alert('Error al editar el estamento. Por favor, intenta de nuevo.');
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
      }
    } catch (error) {
      console.error('Error al eliminar el estamento:', error);
      alert('Error al eliminar el estamento. Por favor, intenta de nuevo.');
    }
  }
}
