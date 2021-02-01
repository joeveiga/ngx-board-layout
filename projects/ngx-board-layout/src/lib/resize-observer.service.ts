import { Injectable } from '@angular/core';
import ResizeObserver from 'resize-observer-polyfill';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResizeObserverService {
  observe(el: HTMLElement): Observable<ResizeObserverEntry[]> {
    return new Observable(subs => {
      const observer = new ResizeObserver(entries => subs.next(entries));
      observer.observe(el);
      return () => observer.unobserve(el);
    });
  }
}
