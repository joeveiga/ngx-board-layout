import { Injectable } from '@angular/core';
import { TrackCollection } from 'ngx-board-layout/tracks';
import { BoardCardDirective } from '../board-card.directive';

@Injectable({
  providedIn: 'root',
})
export class CardSortingStrategy {
  sort(cards: BoardCardDirective[], tracks: number): TrackCollection {
    const result = [...new Array(tracks).keys()].map(() => []);
    cards.forEach((card, idx) => result[idx % tracks].push(card));
    return new TrackCollection(result);
  }
}
