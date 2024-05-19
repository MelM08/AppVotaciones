import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarEleccionesComponent } from './listar-elecciones.component';

describe('ListarEleccionesComponent', () => {
  let component: ListarEleccionesComponent;
  let fixture: ComponentFixture<ListarEleccionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListarEleccionesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListarEleccionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
