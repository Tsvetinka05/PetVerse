import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShelterPage } from './shelter';

describe('ShelterPage', () => {
  let component: ShelterPage;
  let fixture: ComponentFixture<ShelterPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShelterPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ShelterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
