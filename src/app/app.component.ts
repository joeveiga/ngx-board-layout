import { Component, Injectable } from '@angular/core';
import { BoardCardDirective, CardSortingStrategy } from 'projects/ngx-board-layout/src/public-api';

@Injectable()
export class LargestFirstSortingStrategy extends CardSortingStrategy {
  sort(cards: Array<BoardCardDirective>, tracks: number): Array<Array<BoardCardDirective>> {
    const result = [...new Array(tracks).keys()].map(() => []);
    cards.sort((a, b) => b.height - a.height).forEach((card, idx) => result[idx % tracks].push(card));
    return result;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [{ provide: CardSortingStrategy, useClass: LargestFirstSortingStrategy }]
})
export class AppComponent {
  replay = [];
  cards = [];
  tracks = 3;

  constructor() {
    // for (let i = 0; i < 100; i++) {}
  }

  addTrack(): void {
    this.tracks++;
  }

  removeTrack(): void {
    if (this.tracks > 0) this.tracks--;
  }

  addCard(): void {
    if (this.replay.length) {
      this.cards.push(this.replay.pop());
      return;
    }

    this.cards.push({
      color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
      content: [...new Array(Math.floor(Math.random() * 200 + 50)).keys()].map(() => this.cards.length).join(', ')
    });
  }

  removeLastCard(): void {
    if (this.cards.length) {
      this.replay.push(this.cards.pop());
    }
  }
}
