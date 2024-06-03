import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-crear-candidato',
  templateUrl: './crear-candidato.component.html',
  styleUrls: ['./crear-candidato.component.scss']
})
export class CrearCandidatoComponent {
  fotoSeleccionada: boolean = false;
  nombre: string = '';
  descripcion: string = '';
  numeroCandidato: number = 0;
  foto: File | null = null;
  estado: string = 'ACTIVO';
  estamentoId: number = 0;
  numeroCandidatoExists: boolean = false;

  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Obtener el ID del estamento del padre (ListarEstamentosComponent)
    this.route.parent?.params.subscribe(params => {
      this.estamentoId = +params['id']; // Convertir el parámetro de la URL a número
    });
  }

  async crearCandidato(): Promise<void> {
    // Verificar si se ha seleccionado una foto
    if (this.foto === null) {
      alert('Por favor, selecciona una foto.');
      return;
    }

    // Verificar si el número de candidato ya está en uso
    const numeroCandidatoExistente = await this.verificarNumeroCandidatoExistente();
    if (numeroCandidatoExistente) {
      this.numeroCandidatoExists = true;
      return;
    } else {
      this.numeroCandidatoExists = false;
    }
  
    // Crear el FormData para enviar al servidor
    const formData = new FormData();
    formData.append('nombre', this.nombre);
    formData.append('descripcion', this.descripcion);
    formData.append('numeroCandidato', this.numeroCandidato.toString());
    formData.append('foto', this.foto);
    formData.append('estado', this.estado);
    formData.append('estamentoId', this.estamentoId.toString());
  
    // Enviar la solicitud HTTP para crear el candidato
    this.http.post<any>('http://localhost:3000/crearCandidato/crear-candidato', formData)
      .subscribe(
        response => {
          console.log(response.message);
          alert('Candidato creado con éxito');
          // Limpiar campos después de la creación exitosa
          this.nombre = '';
          this.descripcion = '';
          this.numeroCandidato = 0;
          this.foto = null;
          this.estado = 'ACTIVO';
        },
        error => {
          console.error('Error al crear el candidato:', error);
          alert('Error al crear el candidato. Por favor, intenta de nuevo.');
        }
      );
  }

  async verificarNumeroCandidatoExistente(): Promise<boolean> {
    try {
      const response = await this.http.get<any>(`http://localhost:3000/validarNumeroCandidato/validar-numeroCandidato/${this.numeroCandidato}/${this.estamentoId}`).toPromise();
      return response.exists;
    } catch (error) {
      console.error('Error al verificar el número de candidato:', error);
      alert('Error al verificar el número de candidato. Por favor, intenta de nuevo.');
      return false;
    }
  }

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && inputElement.files && inputElement.files.length > 0) {
      this.foto = inputElement.files[0];
      this.fotoSeleccionada = true; // Indicar que se ha seleccionado una foto
    } else {
      console.error("No se ha seleccionado ningún archivo.");
      this.fotoSeleccionada = false; // Indicar que no se ha seleccionado una foto
    }
  }
}
