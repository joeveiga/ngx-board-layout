import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import {
  Component,
  ChangeDetectionStrategy,
  ContentChildren,
  QueryList,
  OnDestroy,
  Input,
  ElementRef,
  Renderer2,
  RendererStyleFlags2,
} from '@angular/core';
import { Observable, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

import { BoardCardDirective } from './board-card.directive';
import { CardSortingStrategy } from './services/card-sorting-strategy.service';
import { ResizeObserverService } from './services/resize-observer.service';
import { TrackCollection } from './tracks';

export interface TrackConfig {
  media?: string;
}

@Component({
  selector: 'ngx-board-layout',
  templateUrl: './board-layout.component.html',
  styleUrls: ['./board-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardLayoutComponent implements OnDestroy {
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

  private readonly _tracks$: BehaviorSubject<TrackConfig[]>;
  private readonly _cards$: BehaviorSubject<BoardCardDirective[]>;
  private readonly _unsub$: Subject<void>;

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

    const visibleTracks$ = combineLatest([
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
        return mediaFilter.length ? mediaFilter : [{}];
      })
    );

    visibleTracks$.pipe(takeUntil(this._unsub$)).subscribe((tracks) => {
      this._renderer.setStyle(
        this._element.nativeElement,
        '--board-layout-track-count',
        tracks.length,
        RendererStyleFlags2.DashCase
      );
    });

    this.tracks$ = combineLatest([
      visibleTracks$,
      this._cards$,
      // TODO: find better way to do this to filter reize event triggered by
      // new container height calculation.
      this._resize.observe(this._element.nativeElement),
    ]).pipe(
      map(([tracks, cards]) => {
        const sortedTracks = this._cardSorting.sort(cards, tracks.length);

        // update container size to match that of the largest track
        this._renderer.setStyle(
          this._element.nativeElement,
          '--board-layout-container-height',
          `${sortedTracks.height}px`,
          RendererStyleFlags2.DashCase
        );

        return sortedTracks;
      })
    );
  }

  ngOnDestroy(): void {
    this._unsub$.next();
    this._unsub$.complete();
  }
}
