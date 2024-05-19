import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarPadresComponent } from './agregar-padres.component';

describe('AgregarPadresComponent', () => {
  let component: AgregarPadresComponent;
  let fixture: ComponentFixture<AgregarPadresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgregarPadresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgregarPadresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
