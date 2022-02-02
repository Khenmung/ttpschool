import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudenthomeComponent } from './studenthome/studenthome.component';
import { studentprimaryinfoComponent } from './studentprimaryinfo/studentprimaryinfo.component';
import { AddstudentclassComponent } from './addstudentclass/addstudentclass.component';
import { searchstudentComponent } from './searchstudent/searchstudent.component';
import { AddstudentfeepaymentComponent } from './studentfeepayment/addstudentfeepayment/addstudentfeepayment.component';
import { FeereceiptComponent } from './studentfeepayment/feereceipt/feereceipt.component';
import { StudentDocumentComponent } from './uploadstudentdocument/uploadstudentdoc.component';
import { GenerateCertificateComponent } from './generatecertificate/generatecertificate.component';
import { StudentattendancereportComponent } from './studentattendancereport/studentattendancereport.component';
import { StudentboardComponent } from './studentboard/studentboard.component';
import { StudentprogressreportComponent } from './studentprogressreport/studentprogressreport.component';
import { StudentactivityComponent } from './studentactivity/studentactivity.component';

const routes: Routes = [
  {
    path: '', component: StudenthomeComponent,
    children: [
      { path: '', component: searchstudentComponent },
      { path: 'addstudent/:id', component: StudentboardComponent },
      { path: 'addstudent', component: StudentboardComponent },
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
  studentprimaryinfoComponent,
  AddstudentclassComponent,
  AddstudentfeepaymentComponent,
  searchstudentComponent,
  FeereceiptComponent,
  StudentDocumentComponent,
  GenerateCertificateComponent,
  StudentattendancereportComponent,
  StudentboardComponent,
  StudentprogressreportComponent,
  StudentactivityComponent
]