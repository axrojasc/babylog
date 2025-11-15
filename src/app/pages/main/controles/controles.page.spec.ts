import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlesPage } from './controles.page';

describe('ControlesPage', () => {
  let component: ControlesPage;
  let fixture: ComponentFixture<ControlesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
