import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarProfesoresComponent } from './buscar-profesores.component';

describe('BuscarProfesoresComponent', () => {
  let component: BuscarProfesoresComponent;
  let fixture: ComponentFixture<BuscarProfesoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BuscarProfesoresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BuscarProfesoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
