import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargarProfesoresComponent } from './cargar-profesores.component';

describe('CargarProfesoresComponent', () => {
  let component: CargarProfesoresComponent;
  let fixture: ComponentFixture<CargarProfesoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CargarProfesoresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CargarProfesoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
