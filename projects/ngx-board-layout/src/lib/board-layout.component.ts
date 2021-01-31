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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import ResizeObserver from 'resize-observer-polyfill';

import { BoardCardDirective } from './board-card.directive';

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
    this.columnDefs = [...new Array(val).keys()];
    // setTimeout(() => this.reorder(), 0);
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

  private _tracks: number;
  private _cards: QueryList<BoardCardDirective>;
  private _resizeObserver: ResizeObserver;
  private readonly _unsub$: Subject<void>;
  columnDefs: any[] = [];
  constructor(private readonly _element: ElementRef<HTMLElement>, private readonly _renderer: Renderer2) {
    this._unsub$ = new Subject();
  }

  ngOnInit(): void {
    this._resizeObserver = new ResizeObserver(() => this.onResized());
    this._resizeObserver.observe(this._element.nativeElement);
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

    this._resizeObserver.unobserve(this._element.nativeElement);
  }

  private onResized(): void {
    // TODO: remove double reorder when the max height is changed
    // product of a rearrangement of the cards.
    this.reorder();
  }

  private reorder(): void {
    if (!this.cards) return;

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
    this._renderer.setStyle(
      this._element.nativeElement,
      '--board-layout-container-height',
      `${maxTrackHeight}px`,
      RendererStyleFlags2.DashCase
    );
  }
}

/**
 
import { Directive, Output, EventEmitter, OnInit, OnDestroy, ElementRef } from '@angular/core';
import ResizeObserver from 'resize-observer-polyfill';

@Directive({
  exportAs: 'resizeObserver',
  selector: '[resizeObserver]'
})
export class ResizeObserverDirective implements OnInit, OnDestroy {
  @Output('resizeObserver') resize = new EventEmitter<Partial<DOMRectReadOnly>>();

  private _observer: ResizeObserver;
  private _timer: any;

  constructor(private readonly _el: ElementRef<HTMLElement>) {}

  ngOnInit() {
    this._observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        this.onResize(entry.contentRect);
      }
    });

    this._observer.observe(this._el.nativeElement);
  }

  ngOnDestroy() {
    this._observer.unobserve(this._el.nativeElement);
  }

  onResize(e: Partial<DOMRectReadOnly>) {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }

    this._timer = setTimeout(() => this.resize.emit(e), 100);
  }
}

 */
