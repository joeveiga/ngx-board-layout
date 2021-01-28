import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxBoardLayoutModule } from 'ngx-board-layout/ngx-board-layout.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxBoardLayoutModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
