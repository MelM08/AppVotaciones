import { Component, OnInit } from '@angular/core';
import { VotacionesService } from '../votaciones.service';
import { EleccionesService } from '../elecciones.service';
import { InformacionUsuarioService } from '../informacion-usuario.service';
import { NotificationService} from '../notification.service';
import { Router } from '@angular/router';

interface Estamento {
  estado: string;
  rol_habilitado_para_votar: string;
  grados_habilitados: string;
  nombre: string;
  id_eleccion: number;
  id: number;
}

interface Eleccion {
  id: number;
  nombre: string;
  ano: number;
}

interface Candidato {
  id: number;
  nombre: string;
  descripcion: string;
  numero: string;
  fotoUrl: string;
  id_foto?: number;
}

@Component({
  selector: 'app-votaciones',
  templateUrl: './votaciones.component.html',
  styleUrls: ['./votaciones.component.scss']
})
export class VotacionesComponent implements OnInit {
  eleccionesActivas: Eleccion[] = [];
  estamentosPorEleccion: { [key: number]: Estamento[] } = {};
  candidatosPorEstamento: Candidato[] = [];
  selectedEleccionIndex: number = 0; // Índice de la elección actual
  selectedEstamentoId: number | null = null;
  userDetails: any = null;
  eleccionesErrorMessage: string | null = null;


  constructor(
    private votacionesService: VotacionesService,
    private eleccionesService: EleccionesService,
    private userInfoService: InformacionUsuarioService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadEleccionesActivas();
    this.notificationService.showNotification('A partir de este momento podra ejercer su derecho al voto.', 'info');
  }

  loadUserInfo(): void {
    this.userDetails = this.userInfoService.getUserInfo();
  }

  loadEleccionesActivas(): void {
    this.eleccionesService.obtenerEleccionesActivas().subscribe(
      (data: Eleccion[]) => {
        if (Array.isArray(data) && data.length > 0) {
          this.eleccionesActivas = data;
          this.loadEstamentosPorElecciones();
          this.eleccionesErrorMessage = null;
        } else {
          this.eleccionesActivas = [];
          this.eleccionesErrorMessage = 'No se encontraron elecciones activas.';
        }
      },
      error => {
        if (error.status === 404 && error.error.message) {
          this.eleccionesErrorMessage = error.error.message;
        } else {
          this.eleccionesErrorMessage = 'Error al cargar elecciones activas. Por favor, inténtelo de nuevo más tarde.';
        }
        console.error('Error al cargar elecciones activas:', error);
      }
    );
  }

  loadEstamentosPorElecciones(): void {
    if (this.selectedEleccionIndex !== null && this.userDetails) {
      const selectedEleccion = this.eleccionesActivas[this.selectedEleccionIndex];
      this.eleccionesService.obtenerEstamentosPorEleccion(selectedEleccion.id, this.userDetails).subscribe(
        (data: Estamento[]) => {
          this.estamentosPorEleccion[selectedEleccion.id] = data;
          // Establecer el primer estamento para la nueva elección
          if (data.length > 0) {
            this.selectedEstamentoId = data[0].id;
            this.loadCandidatos();
          } else {
            // Si no hay estamentos disponibles en la nueva elección, limpiar los candidatos
            this.candidatosPorEstamento = [];
          }
        },
        error => {
          console.error('Error al cargar estamentos por elección:', error);
        }
      );
    }
  }



  loadCandidatos(): void {
    if (this.selectedEstamentoId) {
      this.votacionesService.obtenerCandidatosPorEstamento(this.selectedEstamentoId).subscribe(
        (data: Candidato[]) => {
          this.candidatosPorEstamento = data.map(candidato => ({
            ...candidato,
            fotoUrl: `http://localhost:3000/imagenCandidato/imagen-candidato/${candidato.id_foto}`
          }));
        },
        error => {
          console.error('Error al cargar candidatos:', error);
        }
      );
    }
  }

  votarCandidato(candidatoId: number): void {
    const idVotante = this.userDetails.id;
    const sede = this.userDetails.institucion || '';
    const id_eleccion = this.eleccionesActivas[this.selectedEleccionIndex].id;
    const idEstamento = this.selectedEstamentoId;

    // Validar los datos requeridos, excluyendo sede
    if (idVotante && id_eleccion && idEstamento) {
      this.votacionesService.votarCandidato(idVotante, sede, id_eleccion, idEstamento, candidatoId).subscribe(
        (data) => {
          this.avanzarEstamento();
          this.notificationService.showNotification('Ha realizado su voto exitosamente.', 'success');
        },
        error => {
          console.error('Error al votar:', error);
        }
      );
    } else {
      console.error('Error: Faltan datos requeridos para votar.');
    }
  }


  avanzarEstamento(): void {
    const currentEleccion = this.eleccionesActivas[this.selectedEleccionIndex];
    const estamentos = this.estamentosPorEleccion[currentEleccion.id];

    const index = estamentos.findIndex(estamento => estamento.id === this.selectedEstamentoId);
    if (index !== -1 && index + 1 < estamentos.length) {
      // Avanzar al siguiente estamento dentro de la misma elección
      this.selectedEstamentoId = estamentos[index + 1].id;
      this.loadCandidatos();
    } else {
      // Si se votó por todos los estamentos disponibles en la elección actual
      if (this.selectedEleccionIndex + 1 < this.eleccionesActivas.length) {
        // Avanzar a la siguiente elección
        this.selectedEleccionIndex++;
        this.loadEstamentosPorElecciones(); // Cargar estamentos de la siguiente elección
      } else {
        // Si no hay más elecciones disponibles, mostrar mensaje
        this.notificationService.showNotification('Ya se votó por todas las elecciones y estamentos disponibles.', 'success');
        this.selectedEstamentoId = null;
        this.candidatosPorEstamento = [];
        // Redirigir al componente de resultados
        this.router.navigate(['/resultados']);
      }
    }
  }

  getEstamentoName(): string {
    const currentEleccion = this.eleccionesActivas[this.selectedEleccionIndex];
    if (!currentEleccion || !this.estamentosPorEleccion[currentEleccion.id]) {
      return 'Estamento Desconocido';
    }
    const estamentos = this.estamentosPorEleccion[currentEleccion.id];
    const estamento = estamentos.find(est => est.id === this.selectedEstamentoId);
    return estamento ? estamento.nombre : 'Estamento Desconocido';
  }
}






