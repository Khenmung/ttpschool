import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsNEventComponent } from './news-nevent.component';

describe('NewsNEventComponent', () => {
  let component: NewsNEventComponent;
  let fixture: ComponentFixture<NewsNEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [NewsNEventComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsNEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
