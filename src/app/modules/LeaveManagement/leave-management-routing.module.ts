import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeLeaveComponent } from './employee-leave/employee-leave.component';
import { EmpLeaveComponent } from './emp-leave/emp-leave.component';
import { LeaveboardComponent } from './leaveboard/leaveboard.component';
import { HomeComponent } from 'src/app/shared/components/home/home.component';

const routes: Routes = [
  {
    path: "", component: HomeComponent,
    children: [
      { path: "gleave", component: LeaveboardComponent },
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
  EmployeeLeaveComponent,
  LeaveboardComponent
]
