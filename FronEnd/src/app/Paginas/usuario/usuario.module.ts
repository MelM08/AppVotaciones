import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioRoutingModule } from './usuario-routing.module';
import { UsuarioComponent } from './usuario.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { PerfilComponent } from './perfil/perfil.component';
import { VotacionesComponent } from './votaciones/votaciones.component';
import { AuthGuard } from '../../auth.guard';


@NgModule({
  declarations: [
    UsuarioComponent,
    PerfilComponent,
    VotacionesComponent
  ],
  imports: [
    CommonModule,
    UsuarioRoutingModule,
    RouterModule,
    FormsModule,
    NgxPaginationModule
  ],
  providers: [
    AuthGuard
  ]
})
export class UsuarioModule { }
