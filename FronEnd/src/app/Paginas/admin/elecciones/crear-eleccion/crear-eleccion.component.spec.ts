import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearEleccionComponent } from './crear-eleccion.component';

describe('CrearEleccionComponent', () => {
  let component: CrearEleccionComponent;
  let fixture: ComponentFixture<CrearEleccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrearEleccionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrearEleccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
