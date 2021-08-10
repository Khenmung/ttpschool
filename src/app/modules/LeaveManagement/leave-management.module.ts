import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeaveManagementComponents, LeaveManagementRoutingModule } from './leave-management-routing.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
//import { StudenthomeComponent } from '../StudentSubject/studenthome/studenthome.component';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { StudentSubjectModule } from '../ClassSubject/student-subject.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [LeaveManagementComponents],
  imports: [
    CommonModule,
    LeaveManagementRoutingModule,
    SharedhomepageModule,
    MaterialModule,
    StudentSubjectModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports:[LeaveManagementComponents]
})
export class LeaveManagementModule { }
