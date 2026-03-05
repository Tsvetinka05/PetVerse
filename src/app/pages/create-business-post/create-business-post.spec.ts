import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBusinessPost } from './create-business-post';

describe('CreateBusinessPost', () => {
  let component: CreateBusinessPost;
  let fixture: ComponentFixture<CreateBusinessPost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateBusinessPost]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateBusinessPost);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
