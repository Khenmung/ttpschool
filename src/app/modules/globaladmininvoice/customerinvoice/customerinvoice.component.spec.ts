import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerinvoiceComponent } from './customerinvoice.component';

describe('CustomerinvoiceComponent', () => {
  let component: CustomerinvoiceComponent;
  let fixture: ComponentFixture<CustomerinvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [CustomerinvoiceComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerinvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
