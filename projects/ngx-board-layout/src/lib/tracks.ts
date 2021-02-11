import { BoardCardDirective } from './board-card.directive';

export class Track {
  private _cards: BoardCardDirective[];
  private _order: number;

  constructor(cards: BoardCardDirective[], order: number) {
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

export class TrackCollection implements Iterable<Track> {
  private _tracks: Track[];

  constructor(sortedCards: BoardCardDirective[][]) {
    let order = 0;
    this._tracks = sortedCards.map((cards) => {
      const result = new Track(cards, order);
      order = result.order + 1;

      return result;
    });
  }

  [Symbol.iterator](): Iterator<Track> {
    return this._tracks[Symbol.iterator]();
  }

  get height(): number {
    return this._tracks.reduce(
      (highest, track) => Math.max(highest, track.height),
      0
    );
  }

  get count(): number {
    return this._tracks.length;
  }
}
