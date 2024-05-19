import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearEstamentoComponent } from './crear-estamento.component';

describe('CrearEstamentoComponent', () => {
  let component: CrearEstamentoComponent;
  let fixture: ComponentFixture<CrearEstamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrearEstamentoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrearEstamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
