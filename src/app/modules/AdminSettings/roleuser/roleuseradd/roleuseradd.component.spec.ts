import { ComponentFixture, TestBed } from '@angular/core/testing';

import { roleuseraddComponent } from './roleuseradd.component';

describe('ApproleuseraddComponent', () => {
  let component: roleuseraddComponent;
  let fixture: ComponentFixture<roleuseraddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ roleuseraddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(roleuseraddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
