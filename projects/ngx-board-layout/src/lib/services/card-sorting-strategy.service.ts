import { Injectable } from '@angular/core';
import { Card } from '../domain/card';
import { TrackCollection } from '../domain/track-collection';

@Injectable({
  providedIn: 'root',
})
export class CardSortingStrategy {
  sort(cards: Card[], tracks: number): TrackCollection {
    const result = [...new Array(tracks).keys()].map(() => []);
    cards.forEach((card, idx) => result[idx % tracks].push(card));
    return new TrackCollection(result);
  }
}
