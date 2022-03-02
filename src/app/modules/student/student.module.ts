import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentComponents, StudentRoutingModule } from './student-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxPrintModule } from 'ngx-print';
import { StudentprogressreportComponent } from './studentprogressreport/studentprogressreport.component';
import { MyFilterPipe } from 'src/app/shared/FilterPipe';

@NgModule({
  declarations: [StudentComponents,StudentprogressreportComponent],
  imports: [
    CommonModule,
    StudentRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule,
    SharedhomepageModule,
    FlexLayoutModule,
    NgxPrintModule,
  ],
  exports:[StudentComponents]
})
export class StudentModule { }
