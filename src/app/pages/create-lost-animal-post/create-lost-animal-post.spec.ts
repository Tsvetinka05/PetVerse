import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLostAnimalPost } from './create-lost-animal-post';

describe('CreateLostAnimalPost', () => {
  let component: CreateLostAnimalPost;
  let fixture: ComponentFixture<CreateLostAnimalPost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateLostAnimalPost],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateLostAnimalPost);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
