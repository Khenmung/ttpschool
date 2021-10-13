import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectappsComponent } from './selectapps.component';

describe('SelectappsComponent', () => {
  let component: SelectappsComponent;
  let fixture: ComponentFixture<SelectappsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectappsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectappsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
