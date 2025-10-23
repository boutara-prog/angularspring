import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockUpdate } from './stock-update';

describe('StockUpdate', () => {
  let component: StockUpdate;
  let fixture: ComponentFixture<StockUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StockUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
