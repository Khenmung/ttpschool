import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AttendanceComponents, AttendanceRoutingModule } from './attendance-routing.module';
import { StudentSubjectModule } from '../ClassSubject/student-subject.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { AttendancepercentComponent } from './attendancepercent/attendancepercent.component';
import { DefaulterComponent } from './defaulter/defaulter.component';
import { NgxPrintModule } from 'ngx-print';


@NgModule({
  declarations: [AttendanceComponents, DefaulterComponent],
  imports: [
    CommonModule,
    AttendanceRoutingModule,
    StudentSubjectModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    SharedModule,
    SharedhomepageModule,
    NgxPrintModule
  ],
  exports:[AttendanceComponents],
  providers:[{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }]
  
})
export class AttendanceModule { }
