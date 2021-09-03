import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportconfigboardComponent } from './reportconfigboard.component';

describe('ReportconfigboardComponent', () => {
  let component: ReportconfigboardComponent;
  let fixture: ComponentFixture<ReportconfigboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportconfigboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportconfigboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
