import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerplanfeatureComponent } from './customerplanfeature.component';

describe('CustomerplanfeatureComponent', () => {
  let component: CustomerplanfeatureComponent;
  let fixture: ComponentFixture<CustomerplanfeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerplanfeatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerplanfeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
