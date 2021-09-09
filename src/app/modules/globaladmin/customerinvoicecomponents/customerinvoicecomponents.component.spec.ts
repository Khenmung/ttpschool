import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerinvoicecomponentsComponent } from './customerinvoicecomponents.component';

describe('CustomerinvoicecomponentsComponent', () => {
  let component: CustomerinvoicecomponentsComponent;
  let fixture: ComponentFixture<CustomerinvoicecomponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerinvoicecomponentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerinvoicecomponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
