import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-estamentos',
  templateUrl: './estamentos.component.html',
  styleUrl: './estamentos.component.scss'
})
export class EstamentosComponent {
  eleccionId: number = 0;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Obtener el ID del estamento de los parámetros de la URL
    this.route.params.subscribe(params => {
      this.eleccionId = +params['id'];
    });
  }
}
