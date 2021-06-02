import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddclassfeeComponent } from './classfee/addclassfee/addclassfee.component';
import { DashboardclassfeeComponent } from './classfee/dashboardclassfee/dashboardclassfee.component';
import { ExcelDataManagementComponent } from './excel-data-management/excel-data-management.component';
import { FeereceiptComponent } from './feereceipt/feereceipt.component';
import { FeesmanagementhomeComponent } from './feesmanagementhome/feesmanagementhome.component';
import { AddMasterDataComponent } from './add-master-data/add-master-data.component';
import { AddstudentComponent } from './student/addstudent/addstudent.component';
import { DashboardstudentComponent } from './student/dashboardstudent/dashboardstudent.component';
import { AddstudentclassComponent } from './studentclass/addstudentclass/addstudentclass.component';
import { AddstudentfeepaymentComponent } from './studentfeepayment/addstudentfeepayment/addstudentfeepayment.component';

import { FeeHeaderComponent } from './shared/header/feeheader.component';
import { FeeSidebarComponent } from './shared/sidebar/sidebar.component';
import { FeeFooterComponent } from './shared/footer/footer.component';
import { StudentDocumentComponent } from './StudentDocument/uploadstudentdocument/uploadstudentdoc.component';
import { DashboardstudentdocumentComponent } from './StudentDocument/dashboardstudentdocument/dashboardstudentdocument.component';
import { TodayCollectionComponent } from './Reports/today-collection/today-collection.component';
import { FeecollectionreportComponent } from './Reports/feecollectionreport/feecollectionreport.component';

const routes: Routes = [{
  path: '', component: FeesmanagementhomeComponent,
  children: [
    { path: '', redirectTo:'dashboardstudent',pathMatch:'full'},
    { path: 'addstudent', component: AddstudentComponent },
    { path: 'addstudent/:id', component: AddstudentComponent },
    { path: 'addstudentcls/:id', component: AddstudentclassComponent },
    { path: 'addclassfee', component: AddclassfeeComponent },
    { path: 'addstudentfeepayment/:id', component: AddstudentfeepaymentComponent },
    { path: 'dashboardclassfee', component: DashboardclassfeeComponent },
    { path: 'dashboardstudent', component: DashboardstudentComponent },
    { path: 'masterdata', component: AddMasterDataComponent },
    { path: 'printreceipt/:id', component: FeereceiptComponent },
    { path: 'exceldata', component: ExcelDataManagementComponent },
    { path: 'collectionreport', component: TodayCollectionComponent },
    { path: 'feepaymentreport', component: FeecollectionreportComponent },

  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeeManagementRoutingModule { }
export const FeeManagementComponent = [
  AddstudentComponent, FeesmanagementhomeComponent,
  AddstudentclassComponent, AddclassfeeComponent, AddstudentfeepaymentComponent,
  DashboardclassfeeComponent, DashboardstudentComponent, FeeHeaderComponent,
  FeeSidebarComponent, FeeFooterComponent, 
  AddMasterDataComponent,
  FeereceiptComponent, ExcelDataManagementComponent, StudentDocumentComponent,
  DashboardstudentdocumentComponent,
  TodayCollectionComponent,
  FeecollectionreportComponent
]