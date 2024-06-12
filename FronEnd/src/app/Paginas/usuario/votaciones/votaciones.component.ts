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
      (data: any[]) => {
        this.eleccionesActivas = data;
      },
      error => {
        console.error('Error al cargar elecciones activas:', error);
      }
    );
  }

  loadEstamentos(): void {
    if (this.selectedEleccionesId && this.userDetails) {
      this.eleccionesService.obtenerEstamentosPorEleccion(this.selectedEleccionesId, this.userDetails).subscribe(
        (data: Estamento[]) => {
          this.estamentosDisponibles = data; // Asegúrate de que data sea un array
          this.selectedEstamentoId = null;
          this.loadCandidatos();
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
        (data: any[]) => {
          this.candidatosPorEstamento = data; // Asegúrate de que data sea un array
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
        this.loadCandidatos();
      },
      error => {
        console.error('Error al votar:', error);
      }
    );
  }
}
