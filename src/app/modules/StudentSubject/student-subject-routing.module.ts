import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClasssubjectdashboardComponent } from './classsubjectmapping/classsubjectdashboard/classsubjectdashboard.component';
import { StudentSubjectMarkCompComponent } from './student-subject-mark-comp/student-subject-mark-comp.component';
import { StudenthomeComponent } from './studenthome/studenthome.component';
import { studentsubjectdashboardComponent } from './studentsubjectdashboard/studentsubjectdashboard.component';
import { SubjectTypesComponent } from './subject-types/subject-types.component';
import { SubjectdashboardComponent } from './subjectdashboard/subjectdashboard.component';

const routes: Routes = [
  {
    path: '', component: StudenthomeComponent,
    children: [
      { path: '', component: SubjectdashboardComponent },
      { path: 'studentsubject', component: studentsubjectdashboardComponent },
      { path: 'subjecttypes', component: SubjectTypesComponent },
      { path: 'components', component: StudentSubjectMarkCompComponent },
      
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentSubjectRoutingModule { }
export const StudentSubjectComponents=[
  StudenthomeComponent,
  ClasssubjectdashboardComponent,
  studentsubjectdashboardComponent,
  SubjectTypesComponent,
  StudentSubjectMarkCompComponent, 
  SubjectdashboardComponent
]
