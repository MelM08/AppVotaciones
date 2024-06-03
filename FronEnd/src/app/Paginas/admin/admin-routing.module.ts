import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AgregarEstudiantesComponent } from './agregar-estudiantes/agregar-estudiantes.component';
import { AgregarPadresComponent } from './agregar-padres/agregar-padres.component';
import { AgregarProfesoresComponent } from './agregar-profesores/agregar-profesores.component';
import { AuthGuard } from '../../auth.guard';
import { CargarEstudiantesComponent } from './agregar-estudiantes/cargar-estudiantes/cargar-estudiantes.component';
import { RegistrarEstudiantesComponent } from './agregar-estudiantes/registrar-estudiantes/registrar-estudiantes.component';
import { BuscarEstudiantesComponent } from './agregar-estudiantes/buscar-estudiantes/buscar-estudiantes.component';
import { CargarPadresComponent } from './agregar-padres/cargar-padres/cargar-padres.component';
import { RegistrarPadresComponent } from './agregar-padres/registrar-padres/registrar-padres.component';
import { BuscarPadresComponent } from './agregar-padres/buscar-padres/buscar-padres.component';
import { CargarProfesoresComponent } from './agregar-profesores/cargar-profesores/cargar-profesores.component';
import { RegistrarProfesoresComponent } from './agregar-profesores/registrar-profesores/registrar-profesores.component';
import { BuscarProfesoresComponent } from './agregar-profesores/buscar-profesores/buscar-profesores.component';
import { EleccionesComponent } from './elecciones/elecciones.component';
import { CrearEleccionComponent } from './elecciones/crear-eleccion/crear-eleccion.component';
import { ListarEleccionesComponent } from './elecciones/listar-elecciones/listar-elecciones.component';
import { EstamentosComponent } from './estamentos/estamentos.component';
import { CrearEstamentoComponent } from './estamentos/crear-estamento/crear-estamento.component';
import { ListarEstamentosComponent } from './estamentos/listar-estamentos/listar-estamentos.component';
import { CandidatosComponent } from './candidatos/candidatos.component';
import { CrearCandidatoComponent } from './candidatos/crear-candidato/crear-candidato.component';
import { ListarCandidatosComponent } from './candidatos/listar-candidatos/listar-candidatos.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'agregar-estudiantes',
        component: AgregarEstudiantesComponent,
        canActivate: [AuthGuard],
        children: [
          { path: 'cargar-estudiantes', component: CargarEstudiantesComponent, canActivate: [AuthGuard] },
          { path: 'registrar-estudiante', component: RegistrarEstudiantesComponent, canActivate: [AuthGuard] },
          { path: 'buscar-estudiante', component: BuscarEstudiantesComponent, canActivate: [AuthGuard] }
        ]
      },
      {
        path: 'agregar-padres',
        component: AgregarPadresComponent,
        canActivate: [AuthGuard],
        children: [
          { path: 'cargar-padres', component: CargarPadresComponent, canActivate: [AuthGuard] },
          { path: 'registrar-padre', component: RegistrarPadresComponent, canActivate: [AuthGuard] },
          { path: 'buscar-padre', component: BuscarPadresComponent, canActivate: [AuthGuard] }
        ]
      },
      {
        path: 'agregar-profesores',
        component: AgregarProfesoresComponent,
        canActivate: [AuthGuard],
        children: [
          { path: 'cargar-profesores', component: CargarProfesoresComponent, canActivate: [AuthGuard] },
          { path: 'registrar-profesor', component: RegistrarProfesoresComponent, canActivate: [AuthGuard] },
          { path: 'buscar-profesor', component: BuscarProfesoresComponent, canActivate: [AuthGuard] }
        ]
      },
      {
        path: 'elecciones',
        component: EleccionesComponent,
        canActivate: [AuthGuard],
        children: [
          { path: 'listar-elecciones', component: ListarEleccionesComponent, canActivate: [AuthGuard] },
          { path: 'crear-eleccion', component: CrearEleccionComponent, canActivate: [AuthGuard] }
        ]
      },
      {
        path: 'estamentos/:id',
        component: EstamentosComponent,
        canActivate: [AuthGuard],
        children: [
          { path: 'crear-estamento', component: CrearEstamentoComponent, canActivate: [AuthGuard] },
          { path: 'listar-estamentos', component: ListarEstamentosComponent, canActivate: [AuthGuard] }
        ]
      },
      {
        path: 'candidatos/:id',
        component: CandidatosComponent,
        canActivate: [AuthGuard],
        children: [
          { path: 'crear-candidato', component: CrearCandidatoComponent, canActivate: [AuthGuard] },
          { path: 'listar-candidatos', component: ListarCandidatosComponent, canActivate: [AuthGuard] }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
