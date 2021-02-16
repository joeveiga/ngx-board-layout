import { Card } from './card';
import { Track, TrackOptions } from './track';

describe('track', () => {
  describe('order', () => {
    it('should return passed in value if cards empty', () => {
      const sut = new TrackBuilder().emptyCards().order(3).build();
      expect(sut.order).toBe(3);
    });

    it('should be offset by the number of cards in the track', () => {
      const sut = new TrackBuilder().nCards(5).order(3).build();
      expect(sut.order).toBe(8);
    });
  });

  describe('height', () => {
    it('should be the sum of all cards heights', () => {
      const sut = new TrackBuilder()
        .cards([{ height: 20 }, { height: 30 }])
        .build();

      expect(sut.height).toBe(50);
    });

    it('should be zero if cards empty', () => {
      const sut = new TrackBuilder().emptyCards().build();
      expect(sut.height).toBe(0);
    });

    it('should be zero with cards empty even with spacing', () => {
      const sut = new TrackBuilder().emptyCards().spacing(8).build();
      expect(sut.height).toBe(0);
    });

    it('should apply correct spacing', () => {
      const sut = new TrackBuilder()
        .cards([{ height: 20 }, { height: 30 }])
        .spacing(10)
        .build();

      expect(sut.height).toBe(60);
    });
  });

  describe('cards', () => {
    it('should have correct order', () => {
      const cards: Partial<Card>[] = [{}, {}, {}];
      new TrackBuilder().cards(cards).order(5).build();

      expect(cards[0].order).toBe(5);
      expect(cards[1].order).toBe(6);
      expect(cards[2].order).toBe(7);
    });

    it('should set cards firstTrack/lastTrack value if present', () => {
      const cardsInFirstTrack: Partial<Card>[] = [{}];
      const cardsInLastTrack: Partial<Card>[] = [{}];
      new TrackBuilder().cards(cardsInFirstTrack).first().build();
      new TrackBuilder().cards(cardsInLastTrack).last().build();

      expect(cardsInFirstTrack[0].firstTrack).toBe(true);
      expect(cardsInFirstTrack[0].lastTrack).toBe(false);
      expect(cardsInLastTrack[0].firstTrack).toBe(false);
      expect(cardsInLastTrack[0].lastTrack).toBe(true);
    });
  });
});

class TrackBuilder {
  private options: TrackOptions = {
    cards: [],
    order: 0,
    spacing: 0,
    first: false,
    last: false,
  };

  cards(cards: Partial<Card>[]): TrackBuilder {
    this.options.cards = cards as Card[];
    return this;
  }

  nCards(n: number): TrackBuilder {
    this.options.cards = new Array(n).map(() => ({} as Card));
    return this;
  }

  emptyCards(): TrackBuilder {
    return this.cards([]);
  }

  order(order: number): TrackBuilder {
    this.options.order = order;
    return this;
  }

  spacing(spacing: number): TrackBuilder {
    this.options.spacing = spacing;
    return this;
  }

  first(first: boolean = true): TrackBuilder {
    this.options.first = first;
    return this;
  }

  last(last: boolean = true): TrackBuilder {
    this.options.last = last;
    return this;
  }

  build(): Track {
    return new Track(this.options);
  }
}
