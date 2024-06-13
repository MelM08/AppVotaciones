import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VotacionesService {

  constructor(private http: HttpClient) { }

  obtenerEleccionesActivas(): Observable<any> {
    return this.http.get('http://localhost:3000/elecciones/activas');
  }

  obtenerEstamentosPorId(id: number): Observable<any> {
    return this.http.get(`http://localhost:3000/elecciones/${id}/estamentos`);
  }

  obtenerCandidatosPorEstamento(estamentoId: number): Observable<any> {
    return this.http.get(`http://localhost:3000/estamentos/${estamentoId}/candidatos`);
  }

  votarCandidato(idVotante: number, sede: string, idEleccion: number, idEstamento: number, idCandidato: number) {
    const body = {
      id_votante: idVotante,
      sede: sede,
      id_eleccion: idEleccion,
      id_estamento: idEstamento,
      id_candidato: idCandidato
    };
    return this.http.post<any>('http://localhost:3000/registrar', body);
  }
}
