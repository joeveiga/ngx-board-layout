import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  cards = [];

  constructor() {
    for (let i = 0; i < 20; i++) {
      this.cards.push({
        color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
        height: `${Math.random() * 200 + 100}px`
      });
    }
  }
}
