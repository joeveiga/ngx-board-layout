import {
  Component,
  ChangeDetectionStrategy,
  ContentChildren,
  QueryList,
  OnDestroy,
  HostBinding,
  AfterContentInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BoardCardDirective } from './board-card.directive';

@Component({
  selector: 'ngx-board-layout',
  templateUrl: './board-layout.component.html',
  styleUrls: ['./board-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardLayoutComponent implements AfterContentInit, OnDestroy {
  @HostBinding('style.--board-layout-track-count')
  get columns(): number {
    return this.columnDefs?.length;
  }

  @HostBinding('style.height')
  height: string;

  @ContentChildren(BoardCardDirective) set cards(value: QueryList<BoardCardDirective>) {
    this._cards = value;
  }
  get cards(): QueryList<BoardCardDirective> {
    return this._cards;
  }

  columnDefs = [0, 0, 0, 0];

  private _cards: QueryList<BoardCardDirective>;
  private readonly _unsub: Subject<void>;

  constructor() {
    this._unsub = new Subject();
  }

  ngAfterContentInit(): void {
    this.reorder();
    this._cards.changes.pipe(takeUntil(this._unsub)).subscribe(() => {
      this.reorder();
    });
  }

  ngOnDestroy(): void {
    this._unsub.next();
    this._unsub.complete();
  }

  private reorder(): void {
    setTimeout(() => {
      const trackHeight = [...this.columnDefs];
      let maxTrackHeight = 0;
      const cards = this.cards.toArray(); //.sort((a, b) => a.index - b.index);
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        let columnIdx = i % this.columns;
        card.order = 2 * columnIdx;

        trackHeight[columnIdx] += card.height;
        maxTrackHeight = Math.max(maxTrackHeight, trackHeight[columnIdx]);
      }

      // set container height so that flex break works as expected
      this.height = `${maxTrackHeight + 4}px`;
    }, 0);
  }
}
