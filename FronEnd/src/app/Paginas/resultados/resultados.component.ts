import { Component, OnInit } from '@angular/core';
import { EleccionesService } from '../usuario/elecciones.service';


@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.scss']
})
export class ResultadosComponent implements OnInit {
  eleccionesActivas: any[] = [];
  estamentoSeleccionado: number | null = null; // Variable para almacenar el estamento seleccionado



  constructor(private eleccionesService: EleccionesService) {}

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
              total_votos: item.total_votos_estamento,
              candidatos: []
            };
            eleccion.estamentos.push(estamento);
          }

          estamento.candidatos.push({
            id: item.candidato_id,
            nombre: item.candidato_nombre,
            total_votos: item.total_votos_candidato,
            porcentaje_votos: (item.total_votos_candidato / estamento.total_votos * 100).toFixed(2),
            fotoUrl: `http://localhost:3000/imagenCandidato/imagen-candidato/${item.id_foto}`, // Ruta de la foto del candidato
            votos_por_sede: {
              jose_maria_cordoba: item.votos_jose_maria_cordoba,
              manuela_beltran: item.votos_manuela_beltran,
              pedro_antonio_sanchez_tello: item.votos_pedro_antonio_sanchez_tello
            }
          });
        });
        this.eleccionesActivas = Array.from(eleccionesMap.values());
      },
      error => {
        console.error('Error al cargar los resultados por elección:', error);
      }
    );
  }

  cambiarEstamento(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.estamentoSeleccionado = parseInt(target.value, 10);
  }


  getWidthPercentage(totalVotosEstamento: number, votosCandidato: number): string {
    if (totalVotosEstamento === 0) {
      return '0%';
    }
    const percentage = (votosCandidato / totalVotosEstamento) * 100;
    return percentage.toFixed(2) + '%';
  }
}
