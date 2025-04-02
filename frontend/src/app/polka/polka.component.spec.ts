import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolkaComponent } from './polka.component';

describe('PolkaComponent', () => {
  let component: PolkaComponent;
  let fixture: ComponentFixture<PolkaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolkaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolkaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
