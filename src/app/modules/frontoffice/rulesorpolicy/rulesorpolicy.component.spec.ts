import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RulesorpolicyComponent } from './rulesorpolicy.component';

describe('RulesorpolicyComponent', () => {
  let component: RulesorpolicyComponent;
  let fixture: ComponentFixture<RulesorpolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RulesorpolicyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RulesorpolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
