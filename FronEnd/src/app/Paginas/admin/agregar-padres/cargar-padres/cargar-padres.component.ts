import { Component } from '@angular/core';
import { ExcelService } from '../excelPadres.service';

@Component({
  selector: 'app-cargar-padres',
  templateUrl: './cargar-padres.component.html',
  styleUrl: './cargar-padres.component.scss'
})
export class CargarPadresComponent {
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
            alert('No se ha seleccionado ningún archivo.')
          }else if(error.status === 401){
            alert('El archivo Excel no tiene datos para procesar.')
          }else if(error.status === 402){
            alert('La estructura del archivo Excel no es válida.')
          }else if(error.status === 404){
            alert('Todo lo que pudo fallar, falló.')
          }else if(error.status === 200){
            alert('Los datos de los padres del archivo Excel han sido procesados y guardados en la base de datos.')
          }else if(error.status === 500){
            alert('Error al procesar el archivo Excel.')
          }
        }
      );
    }
  }
}
