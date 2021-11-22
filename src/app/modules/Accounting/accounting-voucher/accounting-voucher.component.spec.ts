import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingVoucherComponent } from './accounting-voucher.component';

describe('AccountingVoucherComponent', () => {
  let component: AccountingVoucherComponent;
  let fixture: ComponentFixture<AccountingVoucherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [AccountingVoucherComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountingVoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
