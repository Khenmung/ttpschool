import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentSubjectComponents, StudentSubjectRoutingModule } from './student-subject-routing.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MultiLevelMenuModule } from '../dynamicMultiLevelMenu/MultiLevelMenu.module';
import { StudentclassdashboardComponent } from './StudentClass/studentclassdashboard/studentclassdashboard.component';


@NgModule({
  declarations: [StudentSubjectComponents, StudentclassdashboardComponent],
  imports: [
    CommonModule,
    SharedhomepageModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MaterialModule,
    MultiLevelMenuModule,
    
    StudentSubjectRoutingModule
  ],
  exports:[StudentSubjectComponents]
})
export class StudentSubjectModule { }
