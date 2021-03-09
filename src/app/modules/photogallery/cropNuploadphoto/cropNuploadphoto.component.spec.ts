import { ComponentFixture, TestBed } from '@angular/core/testing';

import { cropNUploadphotoComponent } from './cropNuploadphoto.component';

describe('UploadphotoComponent', () => {
  let component: cropNUploadphotoComponent;
  let fixture: ComponentFixture<cropNUploadphotoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ cropNUploadphotoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(cropNUploadphotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
