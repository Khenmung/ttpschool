import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { ExamdashboardComponent } from './examdashboard/examdashboard.component';
import { ExamhomeComponent } from './examhome/examhome.component';
import { ExamsComponent } from './exams/exams.component';
import { ExamslotComponent } from './examslot/examslot.component';
import { ExamstudentsubjectresultComponent } from './examstudentsubjectresult/examstudentsubjectresult.component';
import { VerifyResultsComponent } from './verifyresults/verifyresults.component';
import { SlotnclasssubjectComponent } from './slotnclasssubject/slotnclasssubject.component';
const routes: Routes = [
  {
    path: '', component: HomeComponent,
    children: [
      { path: '', component: ExamdashboardComponent },
      { path: 'slot', component: ExamslotComponent },
      { path: 'slotsubject', component: SlotnclasssubjectComponent },
      { path: 'subjectresult', component: ExamstudentsubjectresultComponent },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentexamRoutingModule { }
export const studentexamComponents = [
  ExamsComponent,
  ExamslotComponent,
  ExamdashboardComponent,
  ExamstudentsubjectresultComponent,
  SlotnclasssubjectComponent,
  ExamhomeComponent,
  VerifyResultsComponent
]
