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
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';

import { BoardCardDirective } from './board-card.directive';
import { CardSortingStrategy } from './services/card-sorting-strategy.service';
import { ResizeObserverService } from './services/resize-observer.service';
import { TrackCollection } from './domain/track-collection';

export type TrackConfigObj = { [media: string]: number };
export type TrackConfigType = number | TrackConfig[] | TrackConfigObj;

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
  set tracks(tracks: TrackConfigType) {
    let tracksConfig: TrackConfig[] = [{}];
    const nToArray = (n: number) => [...new Array(n).keys()];
    const flatten = (arr: unknown[][]) => [].concat.apply([], arr);

    if (typeof tracks === 'number' && tracks > 0) {
      tracksConfig = nToArray(tracks).map(() => ({}));
    } else if (tracks !== null && typeof tracks === 'object') {
      tracksConfig = flatten(
        Object.keys(tracks).map((media) =>
          nToArray(tracks[media]).map(() => ({ media }))
        )
      );
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

  constructor(
    private readonly _element: ElementRef<HTMLElement>,
    private readonly _renderer: Renderer2,
    private readonly _cardSorting: CardSortingStrategy,
    private readonly _resize: ResizeObserverService,
    private readonly _media: BreakpointObserver
  ) {
    this._tracks$ = new BehaviorSubject([{}]);
    this._cards$ = new BehaviorSubject([]);

    const visibleTracksCount$ = this._tracks$.pipe(
      switchMap((tracks) => {
        const mediaQs = tracks.filter((t) => t.media).map((t) => t.media);
        const mediaQObs = mediaQs.length
          ? this._media.observe(mediaQs)
          : new Observable<Partial<BreakpointState>>((subs) =>
              subs.next({ breakpoints: {} })
            );

        return mediaQObs.pipe(
          map((media) => {
            const mediaFilter = tracks.filter(
              (t) => !t.media || media.breakpoints[t.media]
            );

            // we always want at least one track!
            return mediaFilter.length || 1;
          })
        );
      }),
      distinctUntilChanged(),
      tap((trackCount) => (this.trackCount = trackCount))
    );

    const resize$ = this._resize.observe(this._element.nativeElement).pipe(
      map((event) => event.width),
      distinctUntilChanged()
    );

    this.tracks$ = combineLatest([
      visibleTracksCount$,
      this._cards$,
      resize$,
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
