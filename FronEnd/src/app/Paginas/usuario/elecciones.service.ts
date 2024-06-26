import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VotacionesComponent } from './votaciones/votaciones.component';

@Injectable({
  providedIn: 'root'
})
export class EleccionesService {

  constructor(private http: HttpClient) { }

  obtenerEleccionesActivas(): Observable<any> {
    return this.http.get('http://localhost:3000/elecciones/activas');
  }

  obtenerEstamentosPorEleccion(id_eleccion: number, userDetails: any): Observable<any> {
    // Envía los datos del usuario junto con la solicitud HTTP
    return this.http.get(`http://localhost:3000/elecciones/${id_eleccion}/estamentos`, { params: userDetails });
  }

  obtenerCandidatosPorEstamento(estamentoId: number): Observable<any> {
    return this.http.get(`http://localhost:3000/candidatos/estamento/${estamentoId}`);
  }

  obtenerResultadosPorEleccion(): Observable<any> {
    return this.http.get('http://localhost:3000/resultados/resultados-candidatos');
  }
}

