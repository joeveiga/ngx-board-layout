import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxBoardLayoutComponent } from './ngx-board-layout.component';

describe('NgxBoardLayoutComponent', () => {
  let component: NgxBoardLayoutComponent;
  let fixture: ComponentFixture<NgxBoardLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxBoardLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxBoardLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
