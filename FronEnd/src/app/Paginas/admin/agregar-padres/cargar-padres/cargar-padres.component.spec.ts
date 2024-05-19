import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargarPadresComponent } from './cargar-padres.component';

describe('CargarPadresComponent', () => {
  let component: CargarPadresComponent;
  let fixture: ComponentFixture<CargarPadresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CargarPadresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CargarPadresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
