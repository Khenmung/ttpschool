import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeDetailComponents, EmployeedetailRoutingModule } from './employeedetail-routing.module';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmployeeactivityComponent } from './employeeactivity/employeeactivity.component';

@NgModule({
  declarations: [EmployeeDetailComponents],
  imports: [
    CommonModule,
    EmployeedetailRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule,
    SharedhomepageModule,
    FlexLayoutModule
  ],
  exports:[EmployeeDetailComponents]
})
export class EmployeedetailModule { }
