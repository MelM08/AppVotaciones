import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InformacionUsuarioService {
  private userInfo: any = null;

  constructor() {}

  // Método para establecer la información del usuario
  setUserInfo(info: any): void {
    this.userInfo = info;
  }

  // Método para obtener la información del usuario
  getUserInfo(): any {
    return this.userInfo;
  }

  // Método para obtener el nombre del usuario
  getUserName(): string {
    if (this.userInfo) {
      if (this.userInfo.nombre_estudiante) {
        return this.userInfo.nombre_estudiante;
      } else if (this.userInfo.nombre_docente) {
        return this.userInfo.nombre_docente;
      } else if (this.userInfo.nombre_padre) {
        return this.userInfo.nombre_padre;
      }
    }
    return '';
  }

  // Método para obtener la institución del usuario
  getUserInstitution(): string {
    if (this.userInfo && this.userInfo.institucion) {
      return this.userInfo.institucion;
    }
    return 'Institución No Disponible';
  }
}
