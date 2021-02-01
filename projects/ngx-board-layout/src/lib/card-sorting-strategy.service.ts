import { Injectable } from '@angular/core';
import { BoardCardDirective } from './board-card.directive';

@Injectable({
  providedIn: 'root'
})
export class CardSortingStrategy {
  sort(cards: BoardCardDirective[], tracks: number): BoardCardDirective[][] {
    const result = [...new Array(tracks).keys()].map(() => []);
    cards.forEach((card, idx) => result[idx % tracks].push(card));
    return result;
  }
}
