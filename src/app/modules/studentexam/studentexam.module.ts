import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { studentexamComponents, StudentexamRoutingModule } from './studentexam-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { StudentSubjectModule } from '../ClassSubject/student-subject.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import {CdkAccordionModule} from '@angular/cdk/accordion';

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
    FlexLayoutModule,
    CdkAccordionModule
  ],
  exports:[
    studentexamComponents,
    //MatFormFieldModule
  ]  
})
export class StudentexamModule { }
