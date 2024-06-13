import { Component, OnInit } from '@angular/core';
import { VotacionesService } from '../votaciones.service';
import { EleccionesService } from '../elecciones.service';
import { InformacionUsuarioService } from '../informacion-usuario.service';
import { NotificationService} from '../notification.service';

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
    private notificationService: NotificationService
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
    if (this.eleccionesActivas.length > 0 && this.userDetails) {
      this.eleccionesActivas.forEach(eleccion => {
        this.eleccionesService.obtenerEstamentosPorEleccion(eleccion.id, this.userDetails).subscribe(
          (data: Estamento[]) => {
            this.estamentosPorEleccion[eleccion.id] = data;
            // Establecer el primer estamento para la primera elección
            if (this.selectedEstamentoId === null && data.length > 0 && this.eleccionesActivas[0].id === eleccion.id) {
              this.selectedEstamentoId = data[0].id;
              this.loadCandidatos();
            }
          },
          error => {
            console.error('Error al cargar estamentos por elección:', error);
          }
        );
      });
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
    const sede = this.userDetails.institucion || ''; // Si no hay sede, usar una cadena vacía
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
      this.selectedEstamentoId = estamentos[index + 1].id;
      this.loadCandidatos(); // Cargar candidatos del nuevo estamento
    } else {
      // Si ya se votó por todos los estamentos disponibles, avanzar a la siguiente elección
      if (this.selectedEleccionIndex + 1 < this.eleccionesActivas.length) {
        this.selectedEleccionIndex++;
        const nextEleccion = this.eleccionesActivas[this.selectedEleccionIndex];
        const nextEstamentos = this.estamentosPorEleccion[nextEleccion.id];
        if (nextEstamentos.length > 0) {
          this.selectedEstamentoId = nextEstamentos[0].id;
          this.loadCandidatos();
        }
      } else {
        this.notificationService.showNotification('Ya se votó por todas las elecciones y estamentos disponibles.', 'success');
        this.selectedEstamentoId = null;
        this.candidatosPorEstamento = [];
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
