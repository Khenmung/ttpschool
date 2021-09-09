import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationfeatureComponent } from './applicationfeature.component';

describe('ApplicationfeatureComponent', () => {
  let component: ApplicationfeatureComponent;
  let fixture: ComponentFixture<ApplicationfeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicationfeatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationfeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
