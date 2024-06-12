import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService, Notification } from './notification.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  sidebarVisible = true; // Variable para controlar la visibilidad de la barra lateral
  notifications: Notification[] = [];
  private notificationSubscription!: Subscription;
  primera: boolean = true;
  currentRoute: string = '';

  constructor(private notificationService: NotificationService, private router: Router) {}

  ngOnInit() {
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

    if (this.primera){
      this.notificationService.showNotification('Bienvenido al panel administrativo del sistema electoral.', 'info');
      this.primera = false;
    }
  }

  ngOnDestroy() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible; // Cambia el estado de la visibilidad de la barra lateral
  }

  removeNotification(notification: Notification) {
    this.notifications = this.notifications.filter(n => n !== notification);
  }
}
