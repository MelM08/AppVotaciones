import { Component } from '@angular/core';
import { ExcelService } from '../excelPadres.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService, Notification } from '../../notification.service';

@Component({
  selector: 'app-cargar-padres',
  templateUrl: './cargar-padres.component.html',
  styleUrl: './cargar-padres.component.scss'
})
export class CargarPadresComponent {
  selectedFile: File | null = null;

  constructor(private excelService: ExcelService, private notificationService: NotificationService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    if (this.selectedFile) {
      this.excelService.uploadExcel(this.selectedFile).subscribe(
        response => {
          console.log('Archivo subido exitosamente', response);
          this.selectedFile = null;
          const fileInput = <HTMLInputElement>document.getElementById('fileInput');
          if (fileInput) {
            fileInput.value = '';
          }
          this.notificationService.showNotification('Archivo subido exitosamente.', 'success');
        },
        (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.notificationService.showNotification('No se ha seleccionado ningún archivo.', 'danger');
          }else if(error.status === 401){
            this.notificationService.showNotification('El archivo Excel no tiene datos para procesar.', 'danger');
          }else if(error.status === 402){
            this.notificationService.showNotification('La estructura del archivo Excel no es válida.', 'danger');
          }else if(error.status === 404){
            this.notificationService.showNotification('Todo lo que pudo fallar, falló.', 'danger');
          }else if(error.status === 200){
            this.notificationService.showNotification('Los datos de los padres del archivo Excel han sido procesados y guardados en la base de datos.', 'danger');
          }else if(error.status === 500){
            this.notificationService.showNotification('Error al procesar el archivo Excel.', 'danger');
          }
        }
      );
    }
  }
}
