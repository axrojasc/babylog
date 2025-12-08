import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditBabyPage } from './edit-baby.page';

describe('EditBabyPage', () => {
  let component: EditBabyPage;
  let fixture: ComponentFixture<EditBabyPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBabyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
