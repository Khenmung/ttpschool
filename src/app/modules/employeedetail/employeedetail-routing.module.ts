import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { EducationhistoryComponent } from './educationhistory/educationhistory.component';
import { EmployeeComponent } from './employee/employee.component';
import { EmployeedocumentsComponent } from './employeedocuments/employeedocuments.component';
import { EmployeesearchComponent } from './employeesearch/employeesearch.component';
import { FamilyComponent } from './family/family.component';
import { WorkhistoryComponent } from './workhistory/workhistory.component';

const routes: Routes = [
  {
    path: "", component: HomeComponent,
    children: [
      {path: "", component: EmployeesearchComponent},
      {path: "info", component: EmployeeComponent}      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeedetailRoutingModule { }
export const EmployeeDetailComponents = [
  EmployeeComponent,
  EmployeedocumentsComponent,
  WorkhistoryComponent,
  EducationhistoryComponent,
  FamilyComponent,
  EmployeesearchComponent
]
