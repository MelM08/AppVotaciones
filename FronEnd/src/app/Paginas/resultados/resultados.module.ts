import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { AuthGuard } from '../../auth.guard';
import { ResultadosModalComponent } from './resultados-modal/resultados-modal.component';


@NgModule({
  declarations: [
  
    ResultadosModalComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgxPaginationModule
  ],
  providers: [
    AuthGuard
  ]
})
export class resultadosModule { }
