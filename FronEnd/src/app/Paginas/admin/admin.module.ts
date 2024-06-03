import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgregarEstudiantesComponent } from './agregar-estudiantes/agregar-estudiantes.component';
import { AgregarPadresComponent } from './agregar-padres/agregar-padres.component';
import { AdminRoutingModule } from './admin-routing.module';
import { RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { FormsModule } from '@angular/forms';
import { AgregarProfesoresComponent } from './agregar-profesores/agregar-profesores.component';
import { CargarEstudiantesComponent } from './agregar-estudiantes/cargar-estudiantes/cargar-estudiantes.component';
import { RegistrarEstudiantesComponent } from './agregar-estudiantes/registrar-estudiantes/registrar-estudiantes.component';
import { BuscarEstudiantesComponent } from './agregar-estudiantes/buscar-estudiantes/buscar-estudiantes.component';
import { CargarPadresComponent } from './agregar-padres/cargar-padres/cargar-padres.component';
import { RegistrarPadresComponent } from './agregar-padres/registrar-padres/registrar-padres.component';
import { BuscarPadresComponent } from './agregar-padres/buscar-padres/buscar-padres.component';
import { BuscarProfesoresComponent } from './agregar-profesores/buscar-profesores/buscar-profesores.component';
import { CargarProfesoresComponent } from './agregar-profesores/cargar-profesores/cargar-profesores.component';
import { RegistrarProfesoresComponent } from './agregar-profesores/registrar-profesores/registrar-profesores.component';
import { CrearEleccionComponent } from './elecciones/crear-eleccion/crear-eleccion.component';
import { ListarEleccionesComponent } from './elecciones/listar-elecciones/listar-elecciones.component';
import { EleccionesComponent } from './elecciones/elecciones.component';
import { EstamentosComponent } from './estamentos/estamentos.component';
import { CrearEstamentoComponent } from './estamentos/crear-estamento/crear-estamento.component';
import { ListarEstamentosComponent } from './estamentos/listar-estamentos/listar-estamentos.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { CandidatosComponent } from './candidatos/candidatos.component';
import { ListarCandidatosComponent } from './candidatos/listar-candidatos/listar-candidatos.component';
import { CrearCandidatoComponent } from './candidatos/crear-candidato/crear-candidato.component';




@NgModule({
  declarations: [
    AgregarEstudiantesComponent,
    AgregarPadresComponent,
    AgregarProfesoresComponent,
    AdminComponent,
    CargarEstudiantesComponent,
    RegistrarEstudiantesComponent,
    BuscarEstudiantesComponent,
    CargarPadresComponent,
    RegistrarPadresComponent,
    BuscarPadresComponent,
    BuscarProfesoresComponent,
    CargarProfesoresComponent,
    RegistrarProfesoresComponent,
    CrearEleccionComponent,
    ListarEleccionesComponent,
    EleccionesComponent,
    EstamentosComponent,
    CrearEstamentoComponent,
    ListarEstamentosComponent,
    CandidatosComponent,
    ListarCandidatosComponent,
    CrearCandidatoComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    RouterModule,
    FormsModule,
    NgxPaginationModule
  ]
})
export class AdminModule { }
