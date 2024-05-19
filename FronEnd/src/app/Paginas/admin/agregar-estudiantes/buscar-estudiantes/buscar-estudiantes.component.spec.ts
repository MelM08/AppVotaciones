import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarEstudiantesComponent } from './buscar-estudiantes.component';

describe('BuscarEstudiantesComponent', () => {
  let component: BuscarEstudiantesComponent;
  let fixture: ComponentFixture<BuscarEstudiantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BuscarEstudiantesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BuscarEstudiantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
