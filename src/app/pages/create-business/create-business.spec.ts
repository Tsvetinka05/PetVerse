import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBusiness } from './create-business';

describe('CreateBusiness', () => {
  let component: CreateBusiness;
  let fixture: ComponentFixture<CreateBusiness>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateBusiness]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateBusiness);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
