import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './login/login-usuario/login.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminModule } from './Paginas/admin/admin.module';
import { LoginAdminComponent } from './login/login-admin/login-admin.component';
import { UsuarioModule } from './Paginas/usuario/usuario.module';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LoginAdminComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    RouterModule,
    CommonModule,
    AdminModule,
    UsuarioModule
  ],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
