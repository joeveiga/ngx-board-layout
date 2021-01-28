import {
  Component,
  ChangeDetectionStrategy,
  ContentChildren,
  QueryList,
  OnDestroy,
  Renderer2,
  ViewChildren,
  ElementRef,
  AfterViewInit
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
export class BoardLayoutComponent implements AfterViewInit, OnDestroy {
  @ContentChildren(BoardCardDirective) set cards(value: QueryList<BoardCardDirective>) {
    this._cards = value;
  }
  get cards(): QueryList<BoardCardDirective> {
    return this._cards;
  }

  @ViewChildren('column') columns: QueryList<ElementRef>;

  columnDefs = [0, 0, 0, 0];

  private _cards: QueryList<BoardCardDirective>;
  private readonly _unsub: Subject<void>;

  constructor(private readonly _elementRef: ElementRef, private readonly _renderer: Renderer2) {
    this._unsub = new Subject();
  }

  ngAfterViewInit(): void {
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
    const columns = this.columns.toArray();
    const highest = [...this.columnDefs];

    for (let i = 0; i < columns.length; i++) {
      // const column = columns[i];
    }

    const cards = this.cards.toArray();
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      // find highest column for next card
      // let curHighest = Infinity;
      // let columnIdx = 0;
      // for (let ci = 0; ci < highest.length; ci++) {
      //   const value = highest[ci];
      //   if (value < curHighest) {
      //     columnIdx = ci;
      //     curHighest = value;
      //   }
      // }
      let columnIdx = i % columns.length;

      this._renderer.removeChild(this._elementRef.nativeElement, card.element.nativeElement);
      this._renderer.appendChild(columns[columnIdx].nativeElement, card.element.nativeElement);

      // update column heights
      highest[columnIdx] += card.height;
    }
  }
}
