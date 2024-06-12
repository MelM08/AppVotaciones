import { TestBed } from '@angular/core/testing';

import { EleccionesService } from './elecciones.service';

describe('EleccionesService', () => {
  let service: EleccionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EleccionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
