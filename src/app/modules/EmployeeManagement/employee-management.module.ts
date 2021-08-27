import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeManageComponents, EmployeeManagementRoutingModule } from './employee-management-routing.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { StudentSubjectModule } from '../ClassSubject/student-subject.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MAT_DATE_LOCALE } from '@angular/material/core';


@NgModule({
  declarations: [EmployeeManageComponents],
  imports: [
    CommonModule,
    EmployeeManagementRoutingModule,
    SharedModule,
    //StudentSubjectModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    SharedhomepageModule,
    
  ],
  exports:[EmployeeManageComponents],
  providers:[{provide: MAT_DATE_LOCALE, useValue: 'en-GB'}]
})
export class EmployeeManagementModule { }
