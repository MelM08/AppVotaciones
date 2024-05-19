import { Component } from '@angular/core';
import { EstamentosComponent } from '../estamentos.component';

@Component({
  selector: 'app-listar-estamentos',
  templateUrl: './listar-estamentos.component.html',
  styleUrl: './listar-estamentos.component.scss'
})
export class ListarEstamentosComponent {
  estamentos: EstamentosComponent[] = [];

  // Métodos para editar o eliminar estamentos
  editarEstamento(index: number) {
    // Lógica para editar un estamento
  }

  eliminarEstamento(index: number) {
    // Lógica para eliminar un estamento
  }
}
