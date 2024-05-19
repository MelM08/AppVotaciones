import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor(private http: HttpClient) { }

  uploadExcel(file: File) {
    const formData = new FormData();
    formData.append('excelFile', file);
    return this.http.post<any>('http://localhost:3000/subir-excel-padres', formData);
  }
}
