export interface Card {
  readonly element: HTMLElement;
  readonly height: number;
  order: number;
  firstTrack?: boolean;
  lastTrack?: boolean;
  firstCardInTrack?: boolean;
  lastCardInTrack?: boolean;
}
