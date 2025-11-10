import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuenoPage } from './sueno.page';

describe('SuenoPage', () => {
  let component: SuenoPage;
  let fixture: ComponentFixture<SuenoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SuenoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
