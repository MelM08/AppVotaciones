import { Component } from '@angular/core';
import { ExcelService } from '../excelEstudiantes.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService, Notification } from '../../notification.service';

@Component({
  selector: 'app-cargar-estudiantes',
  templateUrl: './cargar-estudiantes.component.html',
  styleUrls: ['./cargar-estudiantes.component.scss']
})
export class CargarEstudiantesComponent {
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
            this.notificationService.showNotification('El archivo Excel no tiene datos para procesar.', 'danger');
          } else if (error.status === 401) {
            this.notificationService.showNotification('La estructura del archivo Excel no es válida.', 'danger');
          } else if (error.status === 500) {
            this.notificationService.showNotification('Error al procesar el archivo Excel.', 'danger');
          } else {
            alert(`Error inesperado: ${error.message}`);
          }
        }
      );
    }
  }
}
