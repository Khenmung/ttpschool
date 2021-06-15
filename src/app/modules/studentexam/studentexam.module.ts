import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { studentexamComponents, StudentexamRoutingModule } from './studentexam-routing.module';
import { ExamsComponent } from './exams/exams.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { StudentSubjectModule } from '../StudentSubject/student-subject.module';


@NgModule({
  declarations: [studentexamComponents],
  imports: [
    CommonModule,
    StudentexamRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    StudentSubjectModule,
    SharedhomepageModule
  ],
  exports:[
    studentexamComponents
  ]

})
export class StudentexamModule { }
