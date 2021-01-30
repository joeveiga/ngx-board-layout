import {
  Component,
  ChangeDetectionStrategy,
  ContentChildren,
  QueryList,
  OnDestroy,
  HostBinding,
  AfterContentInit,
  Input
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
  @Input()
  set tracks(val: number) {
    this._tracks = val;
    this.columnDefs = [...new Array(val).keys()];
    setTimeout(() => this.reorder(), 0);
  }
  get tracks(): number {
    return this._tracks;
  }

  @HostBinding('style.--board-layout-container-height')
  height: string;

  @ContentChildren(BoardCardDirective) set cards(value: QueryList<BoardCardDirective>) {
    this._cards = value;
  }
  get cards(): QueryList<BoardCardDirective> {
    return this._cards;
  }

  private _tracks: number;
  private _cards: QueryList<BoardCardDirective>;
  private readonly _unsub: Subject<void>;
  columnDefs: any[] = [];
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
    const trackHeight = [...this.columnDefs];
    let maxTrackHeight = 0;
    const cards = this.cards.toArray();
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      let columnIdx = i % this.tracks;
      card.order = 2 * columnIdx;

      trackHeight[columnIdx] += card.height;
      maxTrackHeight = Math.max(maxTrackHeight, trackHeight[columnIdx]);
    }

    // set container height so that flex break works as expected
    this.height = `${maxTrackHeight}px`;
  }
}
