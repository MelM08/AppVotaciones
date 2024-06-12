import { TestBed } from '@angular/core/testing';

import { InformacionUsuarioService } from './informacion-usuario.service';

describe('InformacionUsuarioService', () => {
  let service: InformacionUsuarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InformacionUsuarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
