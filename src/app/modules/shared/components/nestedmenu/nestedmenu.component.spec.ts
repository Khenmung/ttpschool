import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NestedmenuComponent } from './nestedmenu.component';

describe('NestedmenuComponent', () => {
  let component: NestedmenuComponent;
  let fixture: ComponentFixture<NestedmenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NestedmenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NestedmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
