import { Component } from '@angular/core';
import { ExcelService } from '../excelPadres.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-cargar-padres',
  templateUrl: './cargar-padres.component.html',
  styleUrls: ['./cargar-padres.component.scss']
})
export class CargarPadresComponent {
  selectedFile: File | null = null;
  isLoading: boolean = false; // Estado para el indicador de carga

  constructor(private excelService: ExcelService, private notificationService: NotificationService) {}

  onFileSelected(event: any) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
      // Mostrar el nombre del archivo seleccionado en el div #fileInfo
      const fileInfo = document.getElementById('fileInfo');
      if (fileInfo) {
        fileInfo.textContent = `Archivo seleccionado: ${this.selectedFile.name}`;
      }
    } else {
      this.selectedFile = null;
      // Si no hay archivo seleccionado, limpiar el texto del div #fileInfo
      const fileInfo = document.getElementById('fileInfo');
      if (fileInfo) {
        fileInfo.textContent = '';
      }
    }
  }

  onSubmit() {
    if (this.selectedFile) {
      this.isLoading = true; // Mostrar el indicador de carga
      this.excelService.uploadExcel(this.selectedFile).subscribe(
        response => {
          console.log('Archivo subido exitosamente', response);
          this.selectedFile = null;
          this.isLoading = false; // Ocultar el indicador de carga
          // Limpiar el input de archivo
          const fileInput = document.getElementById('fileInput') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
          // Limpiar la información del archivo seleccionado
          const fileInfo = document.getElementById('fileInfo');
          if (fileInfo) {
            fileInfo.textContent = '';
          }
          this.notificationService.showNotification('Archivo subido exitosamente.', 'success');
        },
        (error: HttpErrorResponse) => {
          this.isLoading = false; // Ocultar el indicador de carga
          // Manejando los errores basados en el código de estado
          switch (error.status) {
            case 400:
              this.notificationService.showNotification('No se ha seleccionado ningún archivo.', 'danger');
              break;
            case 401:
              this.notificationService.showNotification('El archivo Excel no tiene datos para procesar.', 'danger');
              break;
            case 402:
              this.notificationService.showNotification('La estructura del archivo Excel no es válida.', 'danger');
              break;
            case 404:
              this.notificationService.showNotification('Todo lo que pudo fallar, falló.', 'danger');
              break;
            case 200:
              this.notificationService.showNotification('Los datos de los padres del archivo Excel han sido procesados y guardados en la base de datos.', 'success');
              break;
            case 500:
              this.notificationService.showNotification('Error al procesar el archivo Excel.', 'danger');
              break;
            default:
              this.notificationService.showNotification('Error desconocido al subir el archivo.', 'danger');
              break;
          }
        }
      );
    } else {
      this.notificationService.showNotification('No ha seleccionado ningún archivo.', 'warning');
    }
  }
}
