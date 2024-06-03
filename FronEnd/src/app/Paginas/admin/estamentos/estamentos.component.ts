import { Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-estamentos',
  templateUrl: './estamentos.component.html',
  styleUrl: './estamentos.component.scss'
})
export class EstamentosComponent implements OnInit{
  eleccionId: number = 0;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.eleccionId = +params['id'];
    });
    
  }
}
