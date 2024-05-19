import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarProfesoresComponent } from './registrar-profesores.component';

describe('RegistrarProfesoresComponent', () => {
  let component: RegistrarProfesoresComponent;
  let fixture: ComponentFixture<RegistrarProfesoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarProfesoresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegistrarProfesoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
