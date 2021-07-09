import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudenthomeComponent } from '../StudentSubject/studenthome/studenthome.component';
import { ExamdashboardComponent } from './examdashboard/examdashboard.component';
import { ExamsComponent } from './exams/exams.component';
import { ExamslotComponent } from './examslot/examslot.component';
import { ExamstudentsubjectresultComponent } from './examstudentsubjectresult/examstudentsubjectresult.component';
import { SlotnclasssubjectComponent } from './slotnclasssubject/slotnclasssubject.component';
import { StudentactivityComponent } from './studentactivity/studentactivity.component';
const routes: Routes = [
  {
    path: '', component: StudenthomeComponent,
    children: [
      { path: '', component: ExamdashboardComponent },
      { path: 'slot', component: ExamslotComponent },
      { path: 'slotsubject', component: SlotnclasssubjectComponent },
      { path: 'subjectresult', component: ExamstudentsubjectresultComponent },
      { path: 'activity', component: StudentactivityComponent },        

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
  StudentactivityComponent
]
