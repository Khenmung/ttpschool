import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentSubjectComponents, StudentSubjectRoutingModule } from './student-subject-routing.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { StudentSubjectMarkCompComponent } from './student-subject-mark-comp/student-subject-mark-comp.component';


@NgModule({
  declarations: [StudentSubjectComponents, StudentSubjectMarkCompComponent],
  imports: [
    CommonModule,
    SharedhomepageModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MaterialModule,
    
    StudentSubjectRoutingModule
  ],
  exports:[StudentSubjectComponents]
})
export class StudentSubjectModule { }
