import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignStudentclassdashboardComponent } from './AssignStudentClass/Assignstudentclassdashboard.component';
import { SubjectDetailComponent } from './subjectdetail/subjectdetail.component';
import { StudentSubjectMarkCompComponent } from './student-subject-mark-comp/student-subject-mark-comp.component';
import { studentsubjectdashboardComponent } from './studentsubjectdashboard/studentsubjectdashboard.component';
import { SubjectTypesComponent } from './subject-types/subject-types.component';
import { SubjectBoardComponent } from './subjectboard/subjectboard.component';
//import { ClasssubjectteacherComponent } from './classsubjectteacher/classsubjectteacher.component';
//import { DashboardclassfeeComponent } from '../classes/dashboardclassfee/dashboardclassfee.component';
import { HomeComponent } from 'src/app/shared/components/home/home.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent,
    children: [
      { path: '', component: SubjectBoardComponent,//runGuardsAndResolvers:'always'
     },
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
  SubjectDetailComponent,
  studentsubjectdashboardComponent,
  SubjectTypesComponent,
  StudentSubjectMarkCompComponent, 
  SubjectBoardComponent,
  AssignStudentclassdashboardComponent,
  ]
