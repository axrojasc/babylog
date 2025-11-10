import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SingInPage } from './sing-in.page';

describe('SingInPage', () => {
  let component: SingInPage;
  let fixture: ComponentFixture<SingInPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SingInPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
