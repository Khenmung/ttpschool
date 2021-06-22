import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AttendanceRoutingModule } from './attendance-routing.module';
import { AttendanceComponent } from './attendance/attendance.component';
import { StudentSubjectModule } from '../StudentSubject/student-subject.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { MAT_DATE_LOCALE } from '@angular/material/core';


@NgModule({
  declarations: [AttendanceComponent],
  imports: [
    CommonModule,
    AttendanceRoutingModule,
    StudentSubjectModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    SharedModule,
    SharedhomepageModule
  ],
  providers:[{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }]
  
})
export class AttendanceModule { }
