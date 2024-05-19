import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarPadresComponent } from './buscar-padres.component';

describe('BuscarPadresComponent', () => {
  let component: BuscarPadresComponent;
  let fixture: ComponentFixture<BuscarPadresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BuscarPadresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BuscarPadresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
