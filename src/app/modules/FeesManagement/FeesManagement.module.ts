import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddstudentComponent } from './student/addstudent/addstudent.component';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { FeesmanagementhomeComponent } from './feesmanagementhome/feesmanagementhome.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddstudentclassComponent } from './studentclass/addstudentclass/addstudentclass.component';
import { AddclassfeeComponent } from './classfee/addclassfee/addclassfee.component';
import { AddstudentfeepaymentComponent } from './studentfeepayment/addstudentfeepayment/addstudentfeepayment.component';
import { DashboardclassfeeComponent } from './classfee/dashboardclassfee/dashboardclassfee.component';
import { DashboardstudentComponent } from './student/dashboardstudent/dashboardstudent.component';



@NgModule({
  declarations: [AddstudentComponent, FeesmanagementhomeComponent, 
    AddstudentclassComponent, AddclassfeeComponent, AddstudentfeepaymentComponent, DashboardclassfeeComponent, DashboardstudentComponent],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule
  ],
  //exports:[AddstudentComponent]
})
export class StudentsModule { }
