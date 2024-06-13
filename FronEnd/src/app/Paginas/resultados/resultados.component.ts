import { Component, OnInit } from '@angular/core';
import { EleccionesService } from '../usuario/elecciones.service';

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.component.html',
  styleUrl: './resultados.component.scss'
})
export class ResultadosComponent implements OnInit {
  eleccionesActivas: any[] = [];

  constructor(
    // private votacionesService: VotacionesService,
    private eleccionesService: EleccionesService,
    // private userInfoService: InformacionUsuarioService
  ) { }

  ngOnInit(): void {
    this.loadEleccionesActivas();
    this.loadResultadosPorEleccion();
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

    loadResultadosPorEleccion(): void {
      this.eleccionesService.obtenerResultadosPorEleccion().subscribe(
        (data: any[]) => {
          // Estructura los datos para tener elecciones con sus estamentos y resultados
          const eleccionesMap = new Map();
          data.forEach(item => {
            let eleccion = eleccionesMap.get(item.eleccion_id);
            if (!eleccion) {
              eleccion = {
                id: item.eleccion_id,
                nombre: item.eleccion_nombre,
                estamentos: []
              };
              eleccionesMap.set(item.eleccion_id, eleccion);
            }

            let estamento = eleccion.estamentos.find((est: { id: any; }) => est.id === item.estamento_id);
            if (!estamento) {
              estamento = {
                id: item.estamento_id,
                nombre: item.estamento_nombre,
                total_votos: item.total_votos_estamento, // Agrega el total de votos por estamento
                candidatos: []
              };
              eleccion.estamentos.push(estamento);
            }

            estamento.candidatos.push({
              id: item.candidato_id,
              nombre: item.candidato_nombre,
              total_votos: item.total_votos_candidato
            });
          });
          this.eleccionesActivas = Array.from(eleccionesMap.values());
        },
        error => {
          console.error('Error al cargar los resultados por elección:', error);
        }
      );
    }


  }

