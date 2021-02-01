import { TestBed } from '@angular/core/testing';

import { CardSortingStrategy } from './card-sorting-strategy.service';

describe('CardSortingStrategy', () => {
  let service: CardSortingStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardSortingStrategy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
