import { Injectable } from '@angular/core';
import { Card } from '../domain/card';

@Injectable({
  providedIn: 'root',
})
export class CardSortingStrategy {
  sort(cards: Card[], tracks: number): Card[][] {
    const result = [...new Array(tracks).keys()].map(() => []);
    cards.forEach((card, idx) => result[idx % tracks].push(card));
    return result;
  }
}
