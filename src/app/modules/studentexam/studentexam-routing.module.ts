import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudenthomeComponent } from '../StudentSubject/studenthome/studenthome.component';
import { ExamsComponent } from './exams/exams.component';
const routes: Routes = [
  {
    path: '', component: StudenthomeComponent,
    children: [
      { path: '', component: ExamsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentexamRoutingModule { }
export const studentexamComponents = [
  ExamsComponent
]
