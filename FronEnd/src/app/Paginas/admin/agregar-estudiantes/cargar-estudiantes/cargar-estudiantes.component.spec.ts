import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargarEstudiantesComponent } from './cargar-estudiantes.component';

describe('CargarEstudiantesComponent', () => {
  let component: CargarEstudiantesComponent;
  let fixture: ComponentFixture<CargarEstudiantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CargarEstudiantesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CargarEstudiantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
