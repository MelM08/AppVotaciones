import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isLoggedInBoolean = false;
  userId: string | undefined;
  constructor(private http: HttpClient, private router: Router) { }

  login(id: string) {
    this.isLoggedInBoolean = true;
    this.userId = id;
  }

  logout() {
    this.isLoggedInBoolean = false;
    this.userId = undefined;
    // Aquí podrías realizar otras tareas de limpieza, como limpiar la sesión del usuario en el servidor si es necesario
  }

  isLoggedIn() {
    return this.isLoggedInBoolean;
  }

  verificarRol(id: string): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/auth/usuario/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        if (error.status === 404) {
          alert('Ha ingresado mal los datos o el usuario no existe');
        }else{
          alert('Ha ocurrido un error, por favor intente nuevamente');
        }
        // Devuelve un observable con el mensaje de error personalizado
        return(errorMessage);
      })
    );
  }

  verificarRolAdmin(id: string, password: string): Observable<any> {
    return this.http.post<any>(`http://localhost:3000/auth/admin`, { id, password }).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        if (error.status === 404) {
          alert('Credenciales de administrador incorrectas');
        } else {
          alert('Ha ocurrido un error, por favor intente nuevamente');
        }
        // Devuelve un observable con el mensaje de error personalizado
        return (errorMessage);
      })
    );
  }

  redireccionarSegunRol(rol: string) {
    if (rol === 'admin') {
      this.router.navigate(['/adminuser']);
    } else {
      this.router.navigate(['/usuario']);
    }
  }
}
