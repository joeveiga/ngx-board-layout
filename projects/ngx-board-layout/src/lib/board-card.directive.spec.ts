import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BoardCardDirective } from './board-card.directive';

@Component({
  template: ` <div ngxBoardCard style="height: 100px; order: 1"></div> `
})
class BoardCardDirectiveTestComponent {}

describe('BoardCardDirective', () => {
  let fixture: ComponentFixture<BoardCardDirectiveTestComponent>;
  let sutElement: DebugElement;
  let sut: BoardCardDirective;

  beforeEach(async () => {
    fixture = await TestBed.configureTestingModule({
      declarations: [BoardCardDirective, BoardCardDirectiveTestComponent]
    }).createComponent(BoardCardDirectiveTestComponent);

    fixture.detectChanges();

    sutElement = fixture.debugElement.query(By.directive(BoardCardDirective));
    sut = sutElement.injector.get(BoardCardDirective);
  });

  it('should create', () => {
    expect(sut).toBeDefined();
  });

  it('should return correct element height', () => {
    expect(sut.height).toBe(100);
  });

  it('should set correct order', () => {
    sut.order = 3;
    expect(sutElement.styles.order).toBe('3');
  });
});
