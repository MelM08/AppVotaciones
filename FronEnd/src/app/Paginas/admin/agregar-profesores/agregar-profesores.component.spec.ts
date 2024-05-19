import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarProfesoresComponent } from './agregar-profesores.component';

describe('AgregarProfesoresComponent', () => {
  let component: AgregarProfesoresComponent;
  let fixture: ComponentFixture<AgregarProfesoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgregarProfesoresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgregarProfesoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
