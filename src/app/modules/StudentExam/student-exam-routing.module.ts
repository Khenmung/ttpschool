import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClasssubjectComponent } from './classsubjectmapping/classsubject/classsubject.component';
import { ClasssubjectdashboardComponent } from './classsubjectmapping/classsubjectdashboard/classsubjectdashboard.component';
import { StudenthomeComponent } from './studenthome/studenthome.component';

const routes: Routes = [
  {
    path: '', component: StudenthomeComponent,
    children: [
      { path: '', component: ClasssubjectdashboardComponent }
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
  ClasssubjectComponent
]
