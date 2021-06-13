import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClasssubjectComponent } from './classsubjectmapping/classsubject/classsubject.component';
import { ClasssubjectdashboardComponent } from './classsubjectmapping/classsubjectdashboard/classsubjectdashboard.component';
import { StudenthomeComponent } from './studenthome/studenthome.component';
import { studentsubjectdashboardComponent } from './studentsubjectdashboard/studentsubjectdashboard.component';
import { SubjectTypesComponent } from './subject-types/subject-types.component';

const routes: Routes = [
  {
    path: '', component: StudenthomeComponent,
    children: [
      { path: '', component: ClasssubjectdashboardComponent },
      { path: 'studentsubject', component: studentsubjectdashboardComponent },
      { path: 'subjecttypes', component: SubjectTypesComponent }
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentExamRoutingModule { }
export const StudentExamComponents=[
  StudenthomeComponent,
  ClasssubjectdashboardComponent,
  ClasssubjectComponent,
  studentsubjectdashboardComponent,
  SubjectTypesComponent
]
