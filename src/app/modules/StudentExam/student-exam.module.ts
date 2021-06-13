import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentExamComponents, StudentExamRoutingModule } from './student-exam-routing.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [StudentExamComponents],
  imports: [
    CommonModule,
    SharedhomepageModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MaterialModule,
    
    StudentExamRoutingModule
  ],
  exports:[StudentExamComponents]
})
export class StudentExamModule { }
