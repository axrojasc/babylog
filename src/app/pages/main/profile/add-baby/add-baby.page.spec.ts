import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddBabyPage } from './add-baby.page';

describe('AddBabyPage', () => {
  let component: AddBabyPage;
  let fixture: ComponentFixture<AddBabyPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBabyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
