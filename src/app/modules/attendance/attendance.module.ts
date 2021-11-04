import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AttendanceComponents, AttendanceRoutingModule } from './attendance-routing.module';
//import { AttendanceComponent } from './studentattendance/studentattendance.component';
import { StudentSubjectModule } from '../ClassSubject/student-subject.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { AttendanceboardComponent } from './attendanceboard/attendanceboard.component';


@NgModule({
  declarations: [AttendanceComponents, AttendanceboardComponent],
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
  exports:[AttendanceComponents],
  providers:[{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }]
  
})
export class AttendanceModule { }
