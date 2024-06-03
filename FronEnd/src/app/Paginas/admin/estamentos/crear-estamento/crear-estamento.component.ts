import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-crear-estamento',
  templateUrl: './crear-estamento.component.html',
  styleUrls: ['./crear-estamento.component.scss']
})
export class CrearEstamentoComponent implements OnInit {
  eleccionId: number = 0;
  nombre: string = '';
  gradosHabilitados: string = 'Ninguno';
  rolHabilitadoParaVotar: string = 'Todos';
  estado: string = 'ACTIVO';

  grados = [
    'Ninguno', 'Preescolar', 'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 
    'Sexto', 'Séptimo', 'Octavo', 'Noveno', 'Décimo', 'Once'
  ];

  roles = ['Todos', 'Estudiantes', 'Docentes', 'Padres'];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.parent?.params.subscribe(params => {
      this.eleccionId = +params['id'];
    });
  }

  crearEstamento() {
    if (!this.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    const estamento = {
      eleccionId: this.eleccionId,
      nombre: this.nombre,
      gradosHabilitados: this.gradosHabilitados,
      rolHabilitadoParaVotar: this.rolHabilitadoParaVotar,
      estado: this.estado
    };

    this.http.post('http://localhost:3000/crearEstamento/crear-estamento', estamento).subscribe(
      response => {
        alert('Estamento creado exitosamente');
        this.router.navigate(['/admin/estamentos', this.eleccionId, 'listar-estamentos']);
      },
      error => {
        console.error('Error al crear el estamento:', error);
        alert('Error al crear el estamento. Por favor, intenta de nuevo.');
      }
    );
  }
}
