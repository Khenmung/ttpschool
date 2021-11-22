import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerappsComponent } from './customerapps.component';

describe('CustomerappsComponent', () => {
  let component: CustomerappsComponent;
  let fixture: ComponentFixture<CustomerappsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [CustomerappsComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerappsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
