import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarEstamentosComponent } from './listar-estamentos.component';

describe('ListarEstamentosComponent', () => {
  let component: ListarEstamentosComponent;
  let fixture: ComponentFixture<ListarEstamentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListarEstamentosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListarEstamentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
