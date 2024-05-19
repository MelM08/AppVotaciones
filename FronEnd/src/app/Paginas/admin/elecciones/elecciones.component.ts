import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-elecciones',
  templateUrl: './elecciones.component.html',
  styleUrls: ['./elecciones.component.scss']
})
export class EleccionesComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Navegar automáticamente a la ruta de "Ver Elecciones" al cargar el componente
    this.router.navigate(['./listar-elecciones']);
  }

}
