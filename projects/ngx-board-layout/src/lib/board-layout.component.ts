import {
  Component,
  ChangeDetectionStrategy,
  ContentChildren,
  QueryList,
  OnDestroy,
  AfterContentInit,
  Input,
  ElementRef,
  OnInit,
  Renderer2,
  RendererStyleFlags2
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BoardCardDirective } from './board-card.directive';
import { CardSortingStrategy } from './card-sorting-strategy.service';
import { ResizeObserverService } from './resize-observer.service';

@Component({
  selector: 'ngx-board-layout',
  templateUrl: './board-layout.component.html',
  styleUrls: ['./board-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardLayoutComponent implements OnInit, AfterContentInit, OnDestroy {
  @Input()
  set tracks(val: number) {
    this._tracks = val;
    this._trackBreaks$.next([...new Array(val).keys()]);
    this._renderer.setStyle(
      this._element.nativeElement,
      '--board-layout-track-count',
      val,
      RendererStyleFlags2.DashCase
    );
    this.reorder();
  }
  get tracks(): number {
    return this._tracks;
  }

  @ContentChildren(BoardCardDirective) set cards(value: QueryList<BoardCardDirective>) {
    this._cards = value;
  }
  get cards(): QueryList<BoardCardDirective> {
    return this._cards;
  }

  get trackBreaks$(): Observable<number[]> {
    return this._trackBreaks$;
  }

  private _tracks: number;
  private _cards: QueryList<BoardCardDirective>;
  private readonly _unsub$: Subject<void>;
  private readonly _trackBreaks$: Subject<number[]>;

  constructor(
    private readonly _element: ElementRef<HTMLElement>,
    private readonly _renderer: Renderer2,
    private readonly _cardSorting: CardSortingStrategy,
    private readonly _resize: ResizeObserverService
  ) {
    this._trackBreaks$ = new Subject();
    this._unsub$ = new Subject();
  }

  ngOnInit(): void {
    this._resize
      .observe(this._element.nativeElement)
      .pipe(takeUntil(this._unsub$))
      .subscribe(() => {
        // TODO: remove double reorder when the max height is changed
        // product of a rearrangement of the cards.
        this.reorder();
      });
  }

  ngAfterContentInit(): void {
    this.reorder();
    this._cards.changes.pipe(takeUntil(this._unsub$)).subscribe(() => {
      this.reorder();
    });
  }

  ngOnDestroy(): void {
    this._unsub$.next();
    this._unsub$.complete();
  }

  private reorder(): void {
    if (!this.cards) return;

    // sort content cards into their tracks
    const tracks = this._cardSorting.sort(this.cards.toArray(), this.tracks);

    // set cards order property per their track index and adjust track breaks as well
    let order = 0;
    const trackBreaks = new Array(this.tracks);
    for (let idx = 0; idx < tracks.length; idx++) {
      const cards = tracks[idx];
      for (const card of cards) {
        card.order = ++order;
      }

      trackBreaks[idx] = ++order;
    }

    this._trackBreaks$.next(trackBreaks);

    // update container size to match that of the largest track
    const newSize = tracks
      .map(cards => cards.reduce((size, card) => size + card.height, 0))
      .reduce((highest, size) => Math.max(highest, size), 0);

    this._renderer.setStyle(
      this._element.nativeElement,
      '--board-layout-container-height',
      `${newSize}px`,
      RendererStyleFlags2.DashCase
    );
  }
}
