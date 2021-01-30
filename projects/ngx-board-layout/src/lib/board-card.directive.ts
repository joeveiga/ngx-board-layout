import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[ngxBoardCard]'
})
export class BoardCardDirective {
  get height(): number {
    return (this._element.nativeElement as HTMLElement).offsetHeight;
  }

  set order(val: number) {
    this._renderer.setStyle(this._element.nativeElement, 'order', val);
  }

  constructor(private readonly _element: ElementRef, private readonly _renderer: Renderer2) {}
}
