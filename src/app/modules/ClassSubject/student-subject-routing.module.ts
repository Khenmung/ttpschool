import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignStudentclassdashboardComponent } from './AssignStudentClass/Assignstudentclassdashboard.component';
import { ClasssubjectdashboardComponent } from './classsubjectmapping/classsubjectdashboard.component';
import { ClassmasterdashboardComponent } from './classsmastermapping/classmasterdashboard.component';
import { StudentSubjectMarkCompComponent } from './student-subject-mark-comp/student-subject-mark-comp.component';
import { studentsubjectdashboardComponent } from './studentsubjectdashboard/studentsubjectdashboard.component';
import { SubjectTypesComponent } from './subject-types/subject-types.component';
import { SubjectdashboardComponent } from './classsubjectdashboard/subjectdashboard.component';
import { ClasssubjectteacherComponent } from './classsubjectteacher/classsubjectteacher.component';
import { DashboardclassfeeComponent } from './classfee/dashboardclassfee/dashboardclassfee.component';
import { HomeComponent } from 'src/app/shared/components/home/home.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent,
    children: [
      { path: '', component: SubjectdashboardComponent,//runGuardsAndResolvers:'always'
     },
      { path: 'studentsubject', component: studentsubjectdashboardComponent },
      { path: 'subjecttypes', component: SubjectTypesComponent },
      { path: 'components', component: StudentSubjectMarkCompComponent },
      { path: 'classteacher', component: ClassmasterdashboardComponent },
      { path: 'classsubjteacher', component: ClasssubjectteacherComponent },
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentSubjectRoutingModule { }
export const StudentSubjectComponents=[
  ClasssubjectdashboardComponent,
  studentsubjectdashboardComponent,
  SubjectTypesComponent,
  StudentSubjectMarkCompComponent, 
  SubjectdashboardComponent,
  AssignStudentclassdashboardComponent,
  ClassmasterdashboardComponent,
  ClasssubjectteacherComponent,
  DashboardclassfeeComponent
]
