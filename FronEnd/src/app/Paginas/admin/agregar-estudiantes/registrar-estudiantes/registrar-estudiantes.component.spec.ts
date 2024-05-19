import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarEstudiantesComponent } from './registrar-estudiantes.component';

describe('RegistrarEstudiantesComponent', () => {
  let component: RegistrarEstudiantesComponent;
  let fixture: ComponentFixture<RegistrarEstudiantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarEstudiantesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegistrarEstudiantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
