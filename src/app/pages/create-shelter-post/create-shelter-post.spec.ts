import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateShelterPost } from './create-shelter-post';

describe('CreateShelterPost', () => {
  let component: CreateShelterPost;
  let fixture: ComponentFixture<CreateShelterPost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateShelterPost],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateShelterPost);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
