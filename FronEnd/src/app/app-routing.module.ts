import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login-usuario/login.component';
import { AdminComponent } from './Paginas/admin/admin.component';
import { AuthGuard } from './auth.guard';
import { LoginAdminComponent } from './login/login-admin/login-admin.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: LoginAdminComponent }, // Ruta para el login de admin
  { path: 'adminuser', component: AdminComponent, canActivate: [AuthGuard] }, // Ruta para AdminComponent
  { 
    path: 'usuario',
    loadChildren: () => import('./Paginas/usuario/usuario.module').then(m => m.UsuarioModule) // Lazy loading del módulo Usuario
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
