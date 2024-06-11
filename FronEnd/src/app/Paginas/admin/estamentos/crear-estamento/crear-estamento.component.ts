import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-crear-estamento',
  templateUrl: './crear-estamento.component.html',
  styleUrls: ['./crear-estamento.component.scss']
})
export class CrearEstamentoComponent implements OnInit {
  eleccionId: number = 0;
  nombre: string = '';
  gradosHabilitados: string | null = null;
  rolHabilitadoParaVotar: string | null = null;
  estado: string = 'ACTIVO';

  grados = [
    'Ninguno', "Todos", 'Transición', 'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 
    'Sexto', 'Septimo', 'Octavo', 'Noveno', 'Décimo', 'Once'
  ];

  roles = ['Todos', 'Estudiantes', 'Docentes', 'Padres de Familia'];

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.route.parent?.params.subscribe(params => {
      this.eleccionId = +params['id'];
    });
  }

  crearEstamento() {
    if (!this.nombre.trim()) {
      this.notificationService.showNotification('El nombre es obligatorio.', 'danger');
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
        this.notificationService.showNotification('Estamento creado exitosamente.', 'success');
        this.router.navigate(['/admin/estamentos', this.eleccionId, 'listar-estamentos']);
      },
      error => {
        this.notificationService.showNotification('Error al crear el estamento. Por favor, intenta de nuevo.', 'success');
      }
    );
  }
}
