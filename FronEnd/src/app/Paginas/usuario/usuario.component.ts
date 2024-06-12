import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService, Notification } from './notification.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { InformacionUsuarioService } from './informacion-usuario.service';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.scss']
})
export class UsuarioComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private notificationSubscription!: Subscription;
  primera: boolean = true;
  currentRoute: string = '';
  userName: string = '';

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private userInfoService: InformacionUsuarioService
  ) {}

  ngOnInit() {
    // Log para verificar el nombre del usuario en la inicialización del componente

    this.notificationSubscription = this.notificationService.notifications$.subscribe(
      notification => {
        this.notifications.push(notification);
        setTimeout(() => this.removeNotification(notification), 9000);
      }
    );

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });

    // Obtener el nombre del usuario desde el servicio y actualizar el campo userName
    this.updateUserName();

    if (this.primera) {
      this.notificationService.showNotification('Bienvenido al sistema electoral Cordobita.', 'info');
      this.primera = false;
    }
  }

  ngOnDestroy() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  removeNotification(notification: Notification) {
    this.notifications = this.notifications.filter(n => n !== notification);
  }

  // Método para actualizar el nombre del usuario
  private updateUserName() {
    const userDetails = this.userInfoService.getUserInfo();
    console.log('Detalles del usuario obtenidos:', userDetails);

    if (userDetails) {
      if (userDetails.nombre) {
        this.userName = userDetails.nombre;
      } else {
        this.userName = 'Usuario Desconocido';
      }
    } else {
      this.userName = 'Usuario No Encontrado';
    }
  }
}
