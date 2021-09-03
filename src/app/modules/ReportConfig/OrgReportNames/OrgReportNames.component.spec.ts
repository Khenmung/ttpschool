import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgReportNamesComponent } from './OrgReportNames.component';

describe('ConfigureReportComponent', () => {
  let component: OrgReportNamesComponent;
  let fixture: ComponentFixture<OrgReportNamesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgReportNamesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgReportNamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
