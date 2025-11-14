import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrecimientoPage } from './crecimiento.page';

describe('CrecimientoPage', () => {
  let component: CrecimientoPage;
  let fixture: ComponentFixture<CrecimientoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrecimientoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
