import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Commande } from './commande';

describe('Commande', () => {
  let component: Commande;
  let fixture: ComponentFixture<Commande>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Commande]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Commande);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
