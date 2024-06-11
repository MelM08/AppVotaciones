import { Component } from '@angular/core';
import { ExcelService } from '../excelProfesores.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService} from '../../notification.service';

@Component({
  selector: 'app-cargar-profesores',
  templateUrl: './cargar-profesores.component.html',
  styleUrl: './cargar-profesores.component.scss'
})
export class CargarProfesoresComponent {
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
          const fileInput = <HTMLInputElement>document.getElementById('fileInput');
          if (fileInput) {
            fileInput.value = '';
          }
          const fileInfo = document.getElementById('fileInfo');
          if (fileInfo) {
            fileInfo.textContent = '';
          }
          this.notificationService.showNotification('Archivo subido exitosamente.', 'success');
        },
        (error: HttpErrorResponse) => {
          this.isLoading = false; // Ocultar el indicador de carga
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
    } else {
      this.notificationService.showNotification('No ha seleccionado ningun archivo.', 'warning');
    }
  }
}
