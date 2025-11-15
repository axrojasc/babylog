import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlimentacionPage } from './alimentacion.page';

describe('AlimentacionPage', () => {
  let component: AlimentacionPage;
  let fixture: ComponentFixture<AlimentacionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AlimentacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
