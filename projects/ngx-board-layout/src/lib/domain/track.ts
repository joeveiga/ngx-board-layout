import { Card } from './card';

export class Track {
  private _cards: Card[];
  private _order: number;

  constructor(cards: Card[], order: number) {
    this._cards = cards;
    this._order = order;
    this._cards.forEach((card, idx) => (card.order = this._order + idx));
  }

  get order(): number {
    return this._order + this._cards.length;
  }

  get height(): number {
    return this._cards.reduce((size, card) => size + card.height, 0);
  }
}
