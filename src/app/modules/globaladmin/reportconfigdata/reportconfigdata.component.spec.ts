import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportconfigdataComponent } from './reportconfigdata.component';

describe('ReportconfigdataComponent', () => {
  let component: ReportconfigdataComponent;
  let fixture: ComponentFixture<ReportconfigdataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportconfigdataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportconfigdataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
