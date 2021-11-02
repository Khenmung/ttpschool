import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudenthomeComponent } from './studenthome/studenthome.component';
import { AddstudentComponent } from './addstudent/addstudent.component';
import { AddstudentclassComponent } from './addstudentclass/addstudentclass.component';
import { DashboardstudentComponent } from './dashboardstudent/dashboardstudent.component';
import { DashboardstudentdocumentComponent } from './StudentDocument/dashboardstudentdocument/dashboardstudentdocument.component';
import { AddstudentfeepaymentComponent } from './studentfeepayment/addstudentfeepayment/addstudentfeepayment.component';
import { FeereceiptComponent } from './studentfeepayment/feereceipt/feereceipt.component';
import { StudentDocumentComponent } from '../student/StudentDocument/uploadstudentdocument/uploadstudentdoc.component';
import { GenerateCertificateComponent } from './generatecertificate/generatecertificate.component';

const routes: Routes = [
  {
    path: '', component: StudenthomeComponent,
    children: [
      { path: 'home', component: DashboardstudentComponent },
      { path: 'addstudent/:id', component: AddstudentComponent },
      { path: 'addstudent', component: AddstudentComponent },
      { path: 'feepayment', component: AddstudentfeepaymentComponent }
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }
export const StudentComponents = [
  StudenthomeComponent,
  AddstudentComponent,
  AddstudentclassComponent,
  AddstudentfeepaymentComponent,
  DashboardstudentComponent,
  FeereceiptComponent,
  DashboardstudentdocumentComponent,
  StudentDocumentComponent,
  GenerateCertificateComponent
]