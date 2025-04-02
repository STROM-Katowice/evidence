import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegalComponent } from './regal.component';

describe('RegalComponent', () => {
  let component: RegalComponent;
  let fixture: ComponentFixture<RegalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
