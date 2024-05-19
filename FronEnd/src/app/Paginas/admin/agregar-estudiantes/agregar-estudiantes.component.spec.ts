import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarEstudiantesComponent } from './agregar-estudiantes.component';

describe('AgregarEstudiantesComponent', () => {
  let component: AgregarEstudiantesComponent;
  let fixture: ComponentFixture<AgregarEstudiantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgregarEstudiantesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgregarEstudiantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
