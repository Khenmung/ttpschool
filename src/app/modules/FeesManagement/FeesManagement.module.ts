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
import { FeeHeaderComponent } from './shared/header/feeheader.component';
import { FeeSidebarComponent } from './shared/sidebar/sidebar.component';
import { FeeFooterComponent } from './shared/footer/footer.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AddMasterDataComponent } from './MasterData/add-master-data/add-master-data.component';



@NgModule({
  declarations: [AddstudentComponent, FeesmanagementhomeComponent, 
    AddstudentclassComponent, AddclassfeeComponent, AddstudentfeepaymentComponent, 
    DashboardclassfeeComponent, DashboardstudentComponent, FeeHeaderComponent, FeeSidebarComponent, FeeFooterComponent, AddMasterDataComponent],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule
  ],
  providers:[
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ]
  //exports:[AddstudentComponent]
})
export class StudentsModule { }
