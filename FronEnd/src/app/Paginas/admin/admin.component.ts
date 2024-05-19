import { Component } from '@angular/core';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
    sidebarVisible = true; // Variable para controlar la visibilidad de la barra lateral

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible; // Cambia el estado de la visibilidad de la barra lateral
  }

}
