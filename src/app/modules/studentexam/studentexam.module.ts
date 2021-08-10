import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { studentexamComponents, StudentexamRoutingModule } from './studentexam-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { StudentSubjectModule } from '../ClassSubject/student-subject.module';
//import { MatFormFieldModule } from '@angular/material/form-field';


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
    SharedhomepageModule,
    //MatFormFieldModule
  ],
  exports:[
    studentexamComponents,
    //MatFormFieldModule
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
  ],
})
export class StudentexamModule { }
