import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstamentosComponent } from './estamentos.component';

describe('EstamentosComponent', () => {
  let component: EstamentosComponent;
  let fixture: ComponentFixture<EstamentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EstamentosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EstamentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
