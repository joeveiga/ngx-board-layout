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
import { Observable, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

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
  }

  @ContentChildren(BoardCardDirective) set cards(
    value: QueryList<BoardCardDirective>
  ) {
    this._cards = value;
    this._cards.changes.subscribe((cards) => this._cards$.next(cards));
  }

  readonly tracks$: Observable<TrackConfig[]>;

  private readonly _tracks$: BehaviorSubject<TrackConfig[]>;
  private readonly _cards$: BehaviorSubject<BoardCardDirective[]>;
  private readonly _unsub$: Subject<void>;

  private _cards: QueryList<BoardCardDirective>;

  constructor(
    private readonly _element: ElementRef<HTMLElement>,
    private readonly _renderer: Renderer2,
    private readonly _cardSorting: CardSortingStrategy,
    private readonly _resize: ResizeObserverService,
    private readonly _media: BreakpointObserver
  ) {
    this._tracks$ = new BehaviorSubject([]);
    this._cards$ = new BehaviorSubject([]);
    this._unsub$ = new Subject();

    const visible$ = combineLatest([
      this._tracks$,
      this._tracks$.pipe(
        switchMap((tracks) => {
          const mediaQs = tracks.filter((t) => t.media).map((t) => t.media);
          return mediaQs.length
            ? this._media.observe(mediaQs)
            : new Observable<BreakpointState>(() => {});
        })
      ),
    ]).pipe(
      map(([tracks, media]) => {
        const mediaFilter = tracks.filter(
          (t) => !t.media || media.breakpoints[t.media]
        );

        // TODO: find better way to guarantee we always have at least one track
        return mediaFilter.length ? mediaFilter : [{ _order: 0 }];
      })
    );

    visible$.pipe(takeUntil(this._unsub$)).subscribe((tracks) => {
      this._renderer.setStyle(
        this._element.nativeElement,
        '--board-layout-track-count',
        tracks.length,
        RendererStyleFlags2.DashCase
      );
    });

    this.tracks$ = combineLatest([
      visible$,
      this._cards$,
      this._resize.observe(this._element.nativeElement),
    ]).pipe(
      map(([tracks, cards]) => {
        // sort content cards into their tracks
        const sortedTracks = this._cardSorting.sort(cards, tracks.length);

        // set cards order property per their track index and adjust track breaks as well
        let order = 0;
        for (let idx = 0; idx < sortedTracks.length; idx++) {
          const cards = sortedTracks[idx];
          for (const card of cards) {
            card.order = ++order;
          }

          tracks[idx]._order = ++order;
        }

        // update container size to match that of the largest track
        const newSize = sortedTracks
          .map((cards) => cards.reduce((size, card) => size + card.height, 0))
          .reduce((highest, size) => Math.max(highest, size), 0);

        this._renderer.setStyle(
          this._element.nativeElement,
          '--board-layout-container-height',
          `${newSize}px`,
          RendererStyleFlags2.DashCase
        );

        return tracks;
      })
    );
  }

  ngOnInit(): void {}

  ngAfterContentInit(): void {}

  ngOnDestroy(): void {
    this._unsub$.next();
    this._unsub$.complete();
  }
}
