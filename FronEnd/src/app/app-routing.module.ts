// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login-usuario/login.component';
import { AdminComponent } from './Paginas/admin/admin.component';
import { UsuarioComponent } from './Paginas/usuario/usuario.component';
import { AuthGuard } from './auth.guard';
import { LoginAdminComponent } from './login/login-admin/login-admin.component';
import path from 'path';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: LoginAdminComponent }, // Nueva ruta para el login de admin
  { path: 'adminuser', component: AdminComponent, canActivate: [AuthGuard] }, // Ruta para AdminComponent
  { path: 'usuario', component: UsuarioComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
