import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudenthomeComponent } from '../StudentSubject/studenthome/studenthome.component';
import { ExamsComponent } from './exams/exams.component';
import { ExamslotComponent } from './examslot/examslot.component';
import { ExamstudentsubjectresultComponent } from './examstudentsubjectresult/examstudentsubjectresult.component';
import { SlotnclasssubjectComponent } from './slotnclasssubject/slotnclasssubject.component';
const routes: Routes = [
  {
    path: '', component: StudenthomeComponent,
    children: [
      { path: '', component: ExamsComponent },
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
  ExamslotComponent
]
