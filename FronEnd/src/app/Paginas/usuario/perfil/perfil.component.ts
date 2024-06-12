import { Component, OnInit } from '@angular/core';
import { InformacionUsuarioService } from '../informacion-usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  userDetails: any = {};
  grados: string[] = [
    'Transición',
    'Primero',
    'Segundo',
    'Tercero',
    'Cuarto',
    'Quinto',
    'Sexto',
    'Séptimo',
    'Octavo',
    'Noveno',
    'Décimo',
    'Once'
  ];

  constructor(
    private userInfoService: InformacionUsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener la información del usuario desde el servicio
    this.userDetails = this.userInfoService.getUserInfo();
  }

  irAVotaciones(): void {
    this.router.navigate(['/usuario/votaciones']);
  }

  getNombreGrado(numeroGrado: number): string {
    return this.grados[numeroGrado] || '';
  }
}
