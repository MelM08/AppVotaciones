import { Component, OnInit } from '@angular/core';
import { VotacionesService } from '../votaciones.service';
import { EleccionesService } from '../elecciones.service';
import { InformacionUsuarioService } from '../informacion-usuario.service';

interface Estamento {
  estado: string;
  rol_habilitado_para_votar: string;
  grados_habilitados: string;
  nombre: string;
  id_eleccio: number;
  id: number
}

@Component({
  selector: 'app-votaciones',
  templateUrl: './votaciones.component.html',
  styleUrls: ['./votaciones.component.scss']
})
export class VotacionesComponent implements OnInit {
  eleccionesActivas: any[] = [];
  estamentosDisponibles: Estamento[] = [];
  candidatosPorEstamento: any[] = [];
  selectedEleccionesId: number | null = null;
  selectedEstamentoId: number | null = null;
  userDetails: any = null;

  constructor(
    private votacionesService: VotacionesService,
    private eleccionesService: EleccionesService,
    private userInfoService: InformacionUsuarioService
  ) { }

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadEleccionesActivas();
  }

  loadUserInfo(): void {
    this.userDetails = this.userInfoService.getUserInfo();
  }

  loadEleccionesActivas(): void {
    this.eleccionesService.obtenerEleccionesActivas().subscribe(
      data => {
        this.eleccionesActivas = data;
      },
      error => {
        console.error('Error al cargar elecciones activas:', error);
      }
    );
  }

  loadEstamentos(): void {
    if (this.selectedEleccionesId && this.userDetails) {
      // Enviar los datos del usuario como parte de la solicitud HTTP
      this.eleccionesService.obtenerEstamentosPorEleccion(this.selectedEleccionesId, this.userDetails).subscribe(
        (data: Estamento[]) => {
          // Filtrar estamentos según las validaciones
          this.estamentosDisponibles = data.filter((estamento: Estamento) => {
            return estamento.grados_habilitados === this.userDetails.grado &&
                   estamento.rol_habilitado_para_votar === this.userDetails.rol;
          });
          this.selectedEstamentoId = null; // Limpiar la selección de estamento al cargar nuevos estamentos
          this.loadCandidatos(); // Cargar automáticamente los candidatos al cambiar de elección
        },
        error => {
          console.error('Error al cargar estamentos:', error);
        }
      );
    }
  }

  loadCandidatos(): void {
    if (this.selectedEstamentoId) {
      this.votacionesService.obtenerCandidatosPorEstamento(this.selectedEstamentoId).subscribe(
        data => {
          this.candidatosPorEstamento = data;
        },
        error => {
          console.error('Error al cargar candidatos:', error);
        }
      );
    }
  }

  onEleccionesChange(): void {
    this.loadEstamentos();
  }

  onEstamentoChange(): void {
    this.loadCandidatos();
  }

  votarCandidato(candidatoId: number): void {
    this.votacionesService.votarCandidato(candidatoId).subscribe(
      () => {
        console.log('Voto registrado exitosamente.');
        // Actualizar la lista de candidatos después de votar
        this.loadCandidatos();
      },
      error => {
        console.error('Error al votar:', error);
      }
    );
  }
}
