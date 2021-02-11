import { TestBed } from '@angular/core/testing';

import { ResizeObserverService } from './resize-observer.service';

describe('ResizeObserverService', () => {
  let service: ResizeObserverService;
  let mockElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResizeObserverService);
    mockElement = document.createElement('div');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return observable', () => {
    const result = service.observe(mockElement);
    expect(result).toBeDefined();
  });
});
