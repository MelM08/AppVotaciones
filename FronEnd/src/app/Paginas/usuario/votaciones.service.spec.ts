import { TestBed } from '@angular/core/testing';

import { VotacionesService } from './votaciones.service';

describe('VotacionesService', () => {
  let service: VotacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VotacionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
