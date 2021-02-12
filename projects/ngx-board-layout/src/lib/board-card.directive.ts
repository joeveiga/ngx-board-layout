import { Directive, ElementRef, Renderer2 } from '@angular/core';
import { Card } from './domain/card';

@Directive({
  selector: '[ngxBoardCard]',
})
export class BoardCardDirective implements Card {
  get element(): HTMLElement {
    return this._element.nativeElement;
  }

  get height(): number {
    return this.element.offsetHeight;
  }

  set order(val: number) {
    this._renderer.setStyle(this.element, 'order', val);
  }

  set firstTrack(val: boolean) {
    this.toggleClass('ngx-board-layout--first-track', val);
  }

  set lastTrack(val: boolean) {
    this.toggleClass('ngx-board-layout--last-track', val);
  }

  set firstCardInTrack(val: boolean) {
    this.toggleClass('ngx-board-layout--track--first-card', val);
  }

  set lastCardInTrack(val: boolean) {
    this.toggleClass('ngx-board-layout--track--last-card', val);
  }

  constructor(
    private readonly _element: ElementRef<HTMLElement>,
    private readonly _renderer: Renderer2
  ) {}

  private toggleClass(className: string, active: boolean): void {
    this._renderer.removeClass(this.element, className);
    if (active) this._renderer.addClass(this.element, className);
  }
}
