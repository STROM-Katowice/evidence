import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StanComponent } from './stan.component';

describe('StanComponent', () => {
  let component: StanComponent;
  let fixture: ComponentFixture<StanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
