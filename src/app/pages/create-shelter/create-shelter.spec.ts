import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateShelter } from './create-shelter';

describe('CreateShelter', () => {
  let component: CreateShelter;
  let fixture: ComponentFixture<CreateShelter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateShelter],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateShelter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
