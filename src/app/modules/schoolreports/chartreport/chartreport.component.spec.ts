import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartsModule } from 'ng2-charts';

import { ChartReportComponent } from './chartreport.component';

describe('MyLineChartComponent', () => {
  let component: ChartReportComponent;
  let fixture: ComponentFixture<ChartReportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartReportComponent ],
      imports: [ ChartsModule ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
