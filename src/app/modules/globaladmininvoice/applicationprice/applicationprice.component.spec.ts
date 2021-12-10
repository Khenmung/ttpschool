import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationpriceComponent } from './applicationprice.component';

describe('ApplicationpriceComponent', () => {
  let component: ApplicationpriceComponent;
  let fixture: ComponentFixture<ApplicationpriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ApplicationpriceComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationpriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
