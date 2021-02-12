import { Card } from './card';

export interface TrackOptions {
  cards: Card[];
  order: number;
  first?: boolean;
  last?: boolean;
}

export class Track {
  private _cards: Card[];
  private _order: number;

  constructor({ cards, order, first, last }: TrackOptions) {
    this._cards = cards;
    this._order = order;
    this._cards.forEach((card, idx) => {
      card.order = this._order + idx;
      card.firstTrack = first;
      card.lastTrack = last;
      card.firstCardInTrack = idx === 0;
      card.lastCardInTrack = idx === cards.length - 1;
    });
  }

  get order(): number {
    return this._order + this._cards.length;
  }

  get height(): number {
    return this._cards.reduce((size, card) => size + card.height, 0);
  }
}
