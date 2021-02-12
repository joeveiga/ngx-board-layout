import { Injectable } from '@angular/core';
import ResizeObserver from 'resize-observer-polyfill';
import { Observable } from 'rxjs';

export interface ResizeObserverEvent {
  height: number;
  width: number;
}

@Injectable({
  providedIn: 'root',
})
export class ResizeObserverService {
  observe(el: HTMLElement): Observable<ResizeObserverEvent> {
    return new Observable((subs) => {
      const observer = new ResizeObserver((entries) => {
        if (entries?.length === 1) {
          const { height, width } = entries[0].contentRect;
          subs.next({ height, width });
        }
      });
      observer.observe(el);
      return () => observer.unobserve(el);
    });
  }
}
