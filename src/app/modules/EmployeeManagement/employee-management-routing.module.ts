import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { StudenthomeComponent } from '../StudentSubject/studenthome/studenthome.component';
import { EmployeeGradehistoryComponent } from './employee-gradehistory/employee-gradehistory.component';
import { EmployeeSalaryComponentComponent } from './employee-salary-component/employee-salary-component.component';
import { GradeComponentsComponent } from './grade-components/grade-components.component';

const routes: Routes = [
  {
    path:"",component:StudenthomeComponent,
    children:[
      {path:"",component:GradeComponentsComponent},
      {path:"emphistory",component:EmployeeGradehistoryComponent},
      {path:"empsalcomp",component:EmployeeSalaryComponentComponent}
    ]

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeManagementRoutingModule { }
export const EmployeeManageComponents=[
  GradeComponentsComponent,
  EmployeeGradehistoryComponent,
  EmployeeSalaryComponentComponent
]