import { Injectable } from '@angular/core';
import { BoardCardDirective } from './board-card.directive';

@Injectable({
  providedIn: 'root'
})
export class CardSortingStrategy {
  constructor() {}

  sort(cards: Array<BoardCardDirective>, tracks: number): Array<Array<BoardCardDirective>> {
    const result = [...new Array(tracks).keys()].map(() => []);
    cards.forEach((card, idx) => result[idx % tracks].push(card));
    return result;
  }
}
