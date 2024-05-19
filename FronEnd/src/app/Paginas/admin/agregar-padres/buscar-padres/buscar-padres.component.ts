import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-buscar-padres',
  templateUrl: './buscar-padres.component.html',
  styleUrls: ['./buscar-padres.component.scss']
})
export class BuscarPadresComponent {
  terminoBusqueda: string = '';
  padres: any[] = [];
  padreSeleccionado: any = null;
  padreOriginal: any = null;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.listarPadres();
  }

  listarPadres() {
    this.http.get<any[]>('http://localhost:3000/listar-padres').subscribe(
      padres => {
        this.padres = padres;
      },
      error => {
        console.error('Error al obtener los padres:', error);
        alert('Error al obtener los padres. Por favor, intenta de nuevo.');
      }
    );
  }

  buscarPadres() {
    this.http.post<any[]>('http://localhost:3000/buscar-padres', {
        termino: this.terminoBusqueda
    }).subscribe(
        padres => {
            this.padres = padres.map(padres =>({...padres, editando: false}));
            this.terminoBusqueda = '';
        },
        error => {
          if(error.status === 400){
            alert('Debes proporcionar un término de búsqueda válido');
          }else if(error.status === 500){
            alert('Error interno del servidor');
          }
        }
    );
  }


  editarPadre(index: number) {
    this.padreOriginal = { ...this.padres[index], documento_padre_original: this.padres[index].documento_padre };
    this.padres[index].editando = true;
  }



  cancelarEdicion(index: number) {
    this.padres[index] = { ...this.padreOriginal, editando: false };
  }


  async guardarPadre(index: number) {
    const padre = this.padres[index];
    const confirmacion = confirm('¿Estás seguro de guardar los cambios?');
    if (!confirmacion) {
      return;
    }

    try {
      const response = await this.http.put<any>('http://localhost:3000/editar-padre', {
        padre,
        documento_padre_original: this.padreOriginal.documento_padre_original
      }).toPromise();

      if (response && response.message === 'Padre actualizado') {
        this.padres[index].editando = false;
        this.padres = [...this.padres];
      }
    } catch (error) {
      console.error('Error al editar padre:', error);
      alert('Error al editar padre. Por favor, intenta de nuevo.');
    }
  }


  eliminarPadre(index: number) {
    const padre = this.padres[index];
    const confirmacion = confirm('¿Estás seguro de eliminar este padre?');
    if (!confirmacion) {
      return;
    }

    try {
      this.http.delete<any>(`http://localhost:3000/eliminar-padre/${padre.documento_padre}`).toPromise();
      this.padres.splice(index, 1); // Eliminar el padre del array
      this.padres = [...this.padres]; // Actualizar la lista
    } catch (error) {
      console.error('Error al eliminar padre:', error);
      alert('Error al eliminar padre. Por favor, intenta de nuevo.');
    }
  }




}