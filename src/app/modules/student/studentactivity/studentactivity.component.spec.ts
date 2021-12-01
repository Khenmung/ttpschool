import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentactivityComponent } from './studentactivity.component';

describe('StudentactivityComponent', () => {
  let component: StudentactivityComponent;
  let fixture: ComponentFixture<StudentactivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [StudentactivityComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentactivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
