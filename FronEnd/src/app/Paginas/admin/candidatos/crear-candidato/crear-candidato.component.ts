import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-crear-candidato',
  templateUrl: './crear-candidato.component.html',
  styleUrls: ['./crear-candidato.component.scss']
})
export class CrearCandidatoComponent {
  fotoSeleccionada: boolean = false;
  nombre: string = '';
  descripcion: string = '';
  numeroCandidato: number | null = null;
  foto: File | null = null;
  estado: string = 'ACTIVO';
  estamentoId: number = 0;
  numeroCandidatoExists: boolean = false;
  imagenSeleccionadaURL: string | ArrayBuffer | null = null;

  constructor(private http: HttpClient, private route: ActivatedRoute, private notificationService: NotificationService) { }

  ngOnInit(): void {
    // Obtener el ID del estamento del padre (ListarEstamentosComponent)
    this.route.parent?.params.subscribe(params => {
      this.estamentoId = +params['id']; // Convertir el parámetro de la URL a número
    });
  }

  async crearCandidato(): Promise<void> {
    // Verificar si se ha seleccionado una foto
    if (this.foto === null) {
      this.notificationService.showNotification('Por favor, selecciona una foto.', 'danger');
      return;
    }

    // Verificar si el número de candidato ya está en uso
    const numeroCandidatoExistente = await this.verificarNumeroCandidatoExistente();
    if (numeroCandidatoExistente) {
      this.numeroCandidatoExists = true;
      this.notificationService.showNotification('El número de candidato ya está en uso.', 'danger');
      return;
    } else {
      this.numeroCandidatoExists = false;
    }

    // Crear el FormData para enviar al servidor
    const formData = new FormData();
    formData.append('nombre', this.nombre);
    formData.append('descripcion', this.descripcion);
    if (this.numeroCandidato !== null) {
      formData.append('numeroCandidato', this.numeroCandidato.toString());
    }
    formData.append('foto', this.foto);
    formData.append('estado', this.estado);
    formData.append('estamentoId', this.estamentoId.toString());

    // Enviar la solicitud HTTP para crear el candidato
    this.http.post<any>('http://localhost:3000/crearCandidato/crear-candidato', formData)
      .subscribe(
        response => {
          console.log(response.message);
          this.notificationService.showNotification('Candidato creado con éxito.', 'success');
          // Limpiar campos después de la creación exitosa
          this.nombre = '';
          this.descripcion = '';
          this.numeroCandidato = null; // Cambiar a null
          this.foto = null;
          this.estado = 'ACTIVO';
          this.imagenSeleccionadaURL = null;
        },
        error => {
          console.error('Error al crear el candidato:', error);
          this.notificationService.showNotification('Error al crear el candidato. Por favor, intenta de nuevo.', 'danger');
        }
      );
  }

  async verificarNumeroCandidatoExistente(): Promise<boolean> {
    try {
      const response = await this.http.get<any>(`http://localhost:3000/validarNumeroCandidato/validar-numeroCandidato/${this.numeroCandidato}/${this.estamentoId}`).toPromise();
      return response.exists;
    } catch (error) {
      console.error('Error al verificar el número de candidato:', error);
      this.notificationService.showNotification('Error al verificar el número de candidato. Por favor, intenta de nuevo.', 'danger');
      return false;
    }
  }

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && inputElement.files && inputElement.files.length > 0) {
      this.foto = inputElement.files[0];
      this.fotoSeleccionada = true; // Indicar que se ha seleccionado una foto
  
      // Leer el archivo como una URL de datos y asignarla a imagenSeleccionadaURL
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.imagenSeleccionadaURL = e.target.result;
        }
      };
      reader.readAsDataURL(this.foto);
    } else {
      console.error("No se ha seleccionado ningún archivo.");
      this.fotoSeleccionada = false; // Indicar que no se ha seleccionado una foto
    }
  }

}
