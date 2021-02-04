import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LayoutModule } from '@angular/cdk/layout';

import { BoardCardDirective } from './board-card.directive';
import { BoardLayoutComponent } from './board-layout.component';

@NgModule({
  declarations: [BoardCardDirective, BoardLayoutComponent],
  imports: [BrowserModule, LayoutModule],
  exports: [BoardCardDirective, BoardLayoutComponent],
})
export class NgxBoardLayoutModule {}
