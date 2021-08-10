import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudenthomeComponent } from '../student/studenthome/studenthome.component';
import { EmployeeLeaveComponent } from './employee-leave/employee-leave.component';
import { EmpLeaveComponent } from './emp-leave/emp-leave.component';

const routes: Routes = [
  {
    path: "", component: StudenthomeComponent,
    children: [
      { path: "gleave", component: EmpLeaveComponent },
      { path: "empleave", component: EmployeeLeaveComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaveManagementRoutingModule { }
export const LeaveManagementComponents=[
  EmpLeaveComponent,
  EmployeeLeaveComponent
]
