import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
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
  RendererStyleFlags2,
} from '@angular/core';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { BoardCardDirective } from './board-card.directive';
import { CardSortingStrategy } from './card-sorting-strategy.service';
import { ResizeObserverService } from './resize-observer.service';

export interface BoardLayoutTrackConfig {
  media?: string;
}

interface TrackConfig extends BoardLayoutTrackConfig {
  _order: number;
}

@Component({
  selector: 'ngx-board-layout',
  templateUrl: './board-layout.component.html',
  styleUrls: ['./board-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardLayoutComponent
  implements OnInit, AfterContentInit, OnDestroy {
  @Input()
  set tracks(tracks: number | BoardLayoutTrackConfig[]) {
    let tracksConfig: TrackConfig[] = [{ _order: 0 }];
    if (typeof tracks === 'number' && tracks > 0) {
      tracksConfig = [...new Array(tracks).keys()].map(() => ({ _order: 0 }));
    } else if (Array.isArray(tracks) && tracks.length > 0) {
      tracksConfig = tracks.map((track) => ({ ...track, _order: 0 }));
    }

    this._tracks$.next(tracksConfig);
    this.reorder();
  }

  @ContentChildren(BoardCardDirective) set cards(
    value: QueryList<BoardCardDirective>
  ) {
    this._cards = value;
  }
  get cards(): QueryList<BoardCardDirective> {
    return this._cards;
  }

  get tracks$(): Observable<TrackConfig[]> {
    return this._tracks$;
  }

  get visibleTracks$(): Observable<TrackConfig[]> {
    return combineLatest([
      this.tracks$,
      this.tracks$.pipe(
        switchMap((tracks) => {
          const mediaQs = tracks.filter((t) => t.media).map((t) => t.media);
          return mediaQs.length
            ? this._media.observe(mediaQs)
            : new Observable<BreakpointState>(() => {});
        })
      ),
    ]).pipe(
      map(([tracks, media]) =>
        tracks.filter((t) => !t.media || media.breakpoints[t.media])
      )
    );
  }

  private _cards: QueryList<BoardCardDirective>;
  private readonly _tracks$: Subject<TrackConfig[]>;
  private readonly _unsub$: Subject<void>;

  _tracks: TrackConfig[];

  constructor(
    private readonly _element: ElementRef<HTMLElement>,
    private readonly _renderer: Renderer2,
    private readonly _cardSorting: CardSortingStrategy,
    private readonly _resize: ResizeObserverService,
    private readonly _media: BreakpointObserver
  ) {
    this._tracks$ = new Subject();
    this._unsub$ = new Subject();

    this.visibleTracks$.pipe(takeUntil(this._unsub$)).subscribe((tracks) => {
      this._renderer.setStyle(
        this._element.nativeElement,
        '--board-layout-track-count',
        tracks.length,
        RendererStyleFlags2.DashCase
      );
    });
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

    this.visibleTracks$
      .pipe(takeUntil(this._unsub$), startWith([]))
      .subscribe((tracks) => (this._tracks = tracks));
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
    const tracks = this._cardSorting.sort(
      this.cards.toArray(),
      this._tracks.length
    );

    // set cards order property per their track index and adjust track breaks as well
    let order = 0;
    for (let idx = 0; idx < tracks.length; idx++) {
      const cards = tracks[idx];
      for (const card of cards) {
        card.order = ++order;
      }

      this._tracks[idx]._order = ++order;
    }

    this._tracks$.next(this._tracks);

    // update container size to match that of the largest track
    const newSize = tracks
      .map((cards) => cards.reduce((size, card) => size + card.height, 0))
      .reduce((highest, size) => Math.max(highest, size), 0);

    this._renderer.setStyle(
      this._element.nativeElement,
      '--board-layout-container-height',
      `${newSize}px`,
      RendererStyleFlags2.DashCase
    );
  }
}
