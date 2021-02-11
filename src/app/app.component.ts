import { Component, OnDestroy } from '@angular/core';
import { TrackConfig } from 'ngx-board-layout/board-layout.component';

// @Injectable()
// export class LargestFirstSortingStrategy extends CardSortingStrategy {
//   sort(cards: Array<BoardCardDirective>, tracks: number): Array<Array<BoardCardDirective>> {
//     const result = [...new Array(tracks).keys()].map(() => []);
//     cards.sort((a, b) => b.height - a.height).forEach((card, idx) => result[idx % tracks].push(card));
//     return result;
//   }
// }

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  // providers: [{ provide: CardSortingStrategy, useClass: LargestFirstSortingStrategy }]
})
export class AppComponent implements OnDestroy {
  replay = [];
  cards = [];
  tracks: TrackConfig[] = [];
  interval: any;

  constructor() {
    this.interval = setInterval(() => {
      // this.cards = this.cards.map((card) => ({
      //   ...card,
      //   content: [...new Array(Math.floor(Math.random() * 200 + 50)).keys()]
      //     .map(() => this.cards.length)
      //     .join(', '),
      // }));
    }, 3000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  addTrack(): void {
    this.tracks = [...this.tracks, { media: '(min-width: 700px)' }];
  }

  removeTrack(): void {
    if (this.tracks.length > 0)
      this.tracks = this.tracks.slice(0, this.tracks.length - 1);
  }

  addCard(): void {
    if (this.replay.length) {
      this.cards.push(this.replay.pop());
      return;
    }

    this.cards.push({
      color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${
        Math.random() * 255
      })`,
      content: [...new Array(Math.floor(Math.random() * 200 + 50)).keys()]
        .map(() => this.cards.length)
        .join(', '),
    });
  }

  removeLastCard(): void {
    if (this.cards.length) {
      this.replay.push(this.cards.pop());
    }
  }
}
