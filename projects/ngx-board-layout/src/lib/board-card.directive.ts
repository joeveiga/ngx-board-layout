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

  constructor(
    private readonly _element: ElementRef<HTMLElement>,
    private readonly _renderer: Renderer2
  ) {}
}
