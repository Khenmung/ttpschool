import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserreportconfigComponent } from './userreportconfig.component';

describe('UserreportconfigComponent', () => {
  let component: UserreportconfigComponent;
  let fixture: ComponentFixture<UserreportconfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserreportconfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserreportconfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
