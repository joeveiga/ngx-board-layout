import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import {
  Component,
  ChangeDetectionStrategy,
  ContentChildren,
  QueryList,
  Input,
  ElementRef,
  Renderer2,
  RendererStyleFlags2,
} from '@angular/core';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { BoardCardDirective } from './board-card.directive';
import { CardSortingStrategy } from './services/card-sorting-strategy.service';
import { ResizeObserverService } from './services/resize-observer.service';
import { TrackCollection } from './domain/track-collection';

export interface TrackConfig {
  media?: string;
}

@Component({
  selector: 'ngx-board-layout',
  templateUrl: './board-layout.component.html',
  styleUrls: ['./board-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardLayoutComponent {
  @Input()
  set tracks(tracks: number | TrackConfig[]) {
    let tracksConfig: TrackConfig[] = [{}];
    if (typeof tracks === 'number' && tracks > 0) {
      tracksConfig = [...new Array(tracks).keys()].map(() => ({}));
    } else if (Array.isArray(tracks) && tracks.length > 0) {
      tracksConfig = tracks;
    }

    this._tracks$.next(tracksConfig);
  }

  @ContentChildren(BoardCardDirective)
  set cards(value: QueryList<BoardCardDirective>) {
    const cards = value.toArray();
    this._cards$.next(cards);
  }

  readonly tracks$: Observable<TrackCollection>;

  private readonly _tracks$: Subject<TrackConfig[]>;
  private readonly _cards$: Subject<BoardCardDirective[]>;

  constructor(
    private readonly _element: ElementRef<HTMLElement>,
    private readonly _renderer: Renderer2,
    private readonly _cardSorting: CardSortingStrategy,
    private readonly _resize: ResizeObserverService,
    private readonly _media: BreakpointObserver
  ) {
    this._tracks$ = new Subject();
    this._cards$ = new Subject();

    const visibleTracksCount$ = combineLatest([
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

        // we always want at least one track!
        return mediaFilter.length || 1;
      }),
      tap((trackCount) => (this.trackCount = trackCount))
    );

    this.tracks$ = combineLatest([
      visibleTracksCount$,
      this._cards$,
      // TODO: find better way to do this to filter reize event triggered by
      // new container height calculation.
      this._resize.observe(this._element.nativeElement),
    ]).pipe(
      map(([tracks, cards]) => this._cardSorting.sort(cards, tracks)),
      tap((tracks) => (this.height = tracks.height))
    );
  }

  private set height(val: number) {
    this.setCssVar('--board-layout-container-height', `${val}px`);
  }

  private set trackCount(val: number) {
    this.setCssVar('--board-layout-track-count', val);
  }

  private setCssVar(varName: string, value: string | number): void {
    this._renderer.setStyle(
      this._element.nativeElement,
      varName,
      value,
      RendererStyleFlags2.DashCase
    );
  }
}
