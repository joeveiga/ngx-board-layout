import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
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
