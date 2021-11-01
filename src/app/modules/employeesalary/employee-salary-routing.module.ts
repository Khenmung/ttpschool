import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeGradehistoryComponent } from './employee-gradehistory/employee-gradehistory.component';
import { EmployeeSalaryComponentComponent } from './employee-salary-component/employee-salary-component.component';
import { EmpComponentsComponent } from './emp-components/emp-components.component';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { EmpmanagementboardComponent } from './empmanagementboard/empmanagementboard.component';

const routes: Routes = [
  {
    path:"",component:HomeComponent,
    children:[
      {path:"",component:EmpmanagementboardComponent},
      {path:"emphistory",component:EmployeeGradehistoryComponent},
      {path:"empsalcomp",component:EmployeeSalaryComponentComponent},
     
    ]

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeSalaryRoutingModule { }
export const employeesalaryComponents=[
  EmpComponentsComponent,
  EmployeeGradehistoryComponent,
  EmployeeSalaryComponentComponent,
  EmpmanagementboardComponent
]