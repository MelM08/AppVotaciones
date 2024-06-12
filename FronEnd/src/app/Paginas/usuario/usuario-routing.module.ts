import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsuarioComponent } from './usuario.component';
import { PerfilComponent } from './perfil/perfil.component';
import { VotacionesComponent } from './votaciones/votaciones.component';
import { AuthGuard } from '../../auth.guard';

const routes: Routes = [
  {
    path: '',
    component: UsuarioComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'perfil', pathMatch: 'full' }, // Redirección automática a 'perfil'
      { path: 'perfil', component: PerfilComponent, canActivate: [AuthGuard] },
      { path: 'votaciones', component: VotacionesComponent, canActivate: [AuthGuard] }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuarioRoutingModule { }
