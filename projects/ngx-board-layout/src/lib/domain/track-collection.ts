import { Card } from './card';
import { Track } from './track';

export class TrackCollection implements Iterable<Track> {
  private _tracks: Track[];

  constructor(sortedCards: Card[][]) {
    let order = 0;
    this._tracks = sortedCards.map((cards, idx) => {
      const result = new Track({
        cards,
        order,
        first: idx === 0,
        last: idx === sortedCards.length - 1,
      });
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
