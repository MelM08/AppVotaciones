import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarPadresComponent } from './registrar-padres.component';

describe('RegistrarPadresComponent', () => {
  let component: RegistrarPadresComponent;
  let fixture: ComponentFixture<RegistrarPadresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarPadresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegistrarPadresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
