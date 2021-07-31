import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignStudentclassdashboardComponent } from './AssignStudentClass/Assignstudentclassdashboard.component';
import { ClasssubjectdashboardComponent } from './classsubjectmapping/classsubjectdashboard.component';
import { ClassmasterdashboardComponent } from './classsmastermapping/classmasterdashboard.component';
import { StudentSubjectMarkCompComponent } from './student-subject-mark-comp/student-subject-mark-comp.component';
import { StudenthomeComponent } from './studenthome/studenthome.component';
import { studentsubjectdashboardComponent } from './studentsubjectdashboard/studentsubjectdashboard.component';
import { SubjectTypesComponent } from './subject-types/subject-types.component';
import { SubjectdashboardComponent } from './subjectdashboard/subjectdashboard.component';
import { ClasssubjectteacherComponent } from './classsubjectteacher/classsubjectteacher.component';

const routes: Routes = [
  {
    path: '', component: StudenthomeComponent,
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
  StudenthomeComponent,
  ClasssubjectdashboardComponent,
  studentsubjectdashboardComponent,
  SubjectTypesComponent,
  StudentSubjectMarkCompComponent, 
  SubjectdashboardComponent,
  AssignStudentclassdashboardComponent,
  ClassmasterdashboardComponent,
  ClasssubjectteacherComponent
]
