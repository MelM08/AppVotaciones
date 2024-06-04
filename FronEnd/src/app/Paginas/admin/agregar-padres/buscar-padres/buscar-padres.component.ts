import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient) { }

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
        alert('Error al obtener los padres. Por favor, intenta de nuevo.');
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
      },
      error => {
        if (error.status === 400) {
          alert('Debes proporcionar un término de búsqueda válido');
        } else if (error.status === 500) {
          alert('Error interno del servidor');
        }
      }
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

    try {
      const response = await this.http.put<any>('http://localhost:3000/editarPadre/editar-padre', {
        padre,
        documento_padre_original: this.padreOriginal.documento_padre_original
      }).toPromise();

      if (response && response.message === 'Padre actualizado') {
        this.padres[globalIndex].editando = false;
        this.padres = [...this.padres];
      }
    } catch (error) {
      console.error('Error al editar padre:', error);
      alert('Error al editar padre. Por favor, intenta de nuevo.');
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
    } catch (error) {
      console.error('Error al eliminar padre:', error);
      alert('Error al eliminar padre. Por favor, intenta de nuevo.');
    }
  }
}
