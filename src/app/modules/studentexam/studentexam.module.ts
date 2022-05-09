import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { studentexamComponents, StudentexamRoutingModule } from './studentexam-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { StudentSubjectModule } from '../ClassSubject/student-subject.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { StudentgradeComponent } from './studentgrade/studentgrade.component';
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
    FlexLayoutModule
    //MatFormFieldModule
  ],
  exports:[
    studentexamComponents,
    //MatFormFieldModule
  ]  
})
export class StudentexamModule { }
