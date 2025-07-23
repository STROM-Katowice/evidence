import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PracownicyComponent } from './pracownicy.component';

describe('PracownicyComponent', () => {
  let component: PracownicyComponent;
  let fixture: ComponentFixture<PracownicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracownicyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PracownicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
