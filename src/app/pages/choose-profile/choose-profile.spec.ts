import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseProfile } from './choose-profile';

describe('ChooseProfile', () => {
  let component: ChooseProfile;
  let fixture: ComponentFixture<ChooseProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
