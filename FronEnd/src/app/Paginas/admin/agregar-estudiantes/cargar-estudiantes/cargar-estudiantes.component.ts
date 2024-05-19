import { Component } from '@angular/core';
import { ExcelService } from '../excelEstudiantes.service';

@Component({
  selector: 'app-cargar-estudiantes',
  templateUrl: './cargar-estudiantes.component.html',
  styleUrl: './cargar-estudiantes.component.scss'
})
export class CargarEstudiantesComponent {
  selectedFile: File | null = null;

  constructor(private excelService: ExcelService) {}

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
          alert('Archivo subido exitosamente')
        },
        error => {
          if(error.status(400)){
            alert('El archivo Excel no tiene datos para procesar.');
          }else if(error.status(401)){
            alert('La estructura del archivo Excel no es válida.')
          }else if(error.status(200)){
            alert('Los datos del archivo Excel han sido procesados y guardados en la base de datos.')
          }else if(error.status(500)){
            alert('Error al procesar el archivo Excel..')
          }
        }
      );
    }
  }
}
