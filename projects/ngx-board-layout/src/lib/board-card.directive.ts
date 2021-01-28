import { Directive, ElementRef } from '@angular/core';

export interface CardSize {
  height: number;
  width: number;
}

@Directive({
  selector: '[ngxBoardCard]'
})
export class BoardCardDirective {
  get height(): number {
    return (this.element.nativeElement as HTMLElement).offsetHeight;
  }

  get width(): number {
    return (this.element.nativeElement as HTMLElement).offsetWidth;
  }

  constructor(public readonly element: ElementRef) {}
}
