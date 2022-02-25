import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentSubjectComponents, StudentSubjectRoutingModule } from './student-subject-routing.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
//import { MultiLevelMenuModule } from '../dynamicMultiLevelMenu/MultiLevelMenu.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { PromoteclassComponent } from './promoteclass/promoteclass.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [StudentSubjectComponents, PromoteclassComponent],
  imports: [
    CommonModule,
    SharedhomepageModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MaterialModule,
    MatDialogModule,
    FlexLayoutModule,
    StudentSubjectRoutingModule,
    
    MatDatepickerModule
  ],
  
  exports:[StudentSubjectComponents]
})
export class StudentSubjectModule { }
