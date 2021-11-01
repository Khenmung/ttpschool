import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeDetailComponents, EmployeedetailRoutingModule } from './employeedetail-routing.module';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { EmployeesearchComponent } from './employeesearch/employeesearch.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [EmployeeDetailComponents],
  imports: [
    CommonModule,
    EmployeedetailRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedhomepageModule,
    FlexLayoutModule
  ],
  exports:[EmployeeDetailComponents]
})
export class EmployeedetailModule { }
