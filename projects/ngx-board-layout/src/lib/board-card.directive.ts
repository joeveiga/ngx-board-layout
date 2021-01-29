import { Directive, ElementRef, HostBinding } from '@angular/core';

@Directive({
  selector: '[ngxBoardCard]'
})
export class BoardCardDirective {
  @HostBinding('style.order')
  order: number;

  get height(): number {
    return (this.element.nativeElement as HTMLElement).offsetHeight;
  }

  constructor(private readonly element: ElementRef) {}
}
