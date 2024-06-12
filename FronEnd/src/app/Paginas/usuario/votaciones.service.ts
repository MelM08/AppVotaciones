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
    return this.http.get(`http://localhost:3000/candidatos/${estamentoId}`);
  }

  votarCandidato(candidatoId: number): Observable<any> {
    return this.http.post('http://localhost:3000/votar', { id_candidato: candidatoId });
  }
}
