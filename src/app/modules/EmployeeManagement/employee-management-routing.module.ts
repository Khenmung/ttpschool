import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { StudenthomeComponent } from '../StudentSubject/studenthome/studenthome.component';
import { EmployeeGradehistoryComponent } from './employee-gradehistory/employee-gradehistory.component';
import { EmployeeSalaryComponentComponent } from './employee-salary-component/employee-salary-component.component';
import { EmpComponentsComponent } from './emp-components/emp-components.component';
import { VariableConfigComponent } from './variable-config/variable-config.component';

const routes: Routes = [
  {
    path:"",component:StudenthomeComponent,
    children:[
      {path:"",component:EmpComponentsComponent},
      {path:"emphistory",component:EmployeeGradehistoryComponent},
      {path:"empsalcomp",component:EmployeeSalaryComponentComponent},
      {path:"var",component:VariableConfigComponent}
    ]

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeManagementRoutingModule { }
export const EmployeeManageComponents=[
  EmpComponentsComponent,
  EmployeeGradehistoryComponent,
  EmployeeSalaryComponentComponent,
  VariableConfigComponent
]