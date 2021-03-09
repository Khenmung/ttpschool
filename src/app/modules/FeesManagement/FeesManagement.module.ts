import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddstudentComponent } from './addstudent/addstudent.component';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { FeesmanagementhomeComponent } from './feesmanagementhome/feesmanagementhome.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [AddstudentComponent, FeesmanagementhomeComponent],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule
  ],
  //exports:[AddstudentComponent]
})
export class StudentsModule { }
