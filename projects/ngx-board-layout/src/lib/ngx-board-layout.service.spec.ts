import { TestBed } from '@angular/core/testing';

import { NgxBoardLayoutService } from './ngx-board-layout.service';

describe('NgxBoardLayoutService', () => {
  let service: NgxBoardLayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxBoardLayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
