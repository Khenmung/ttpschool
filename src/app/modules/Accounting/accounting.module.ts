import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountingComponents, AccountingRoutingModule } from './accounting-routing.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StudentSubjectModule } from '../ClassSubject/student-subject.module';
import { MaterialModule } from 'src/app/shared/material/material.module';

@NgModule({
  declarations: [AccountingComponents],
  imports: [
    CommonModule,
    AccountingRoutingModule,
    SharedhomepageModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    StudentSubjectModule,
    MaterialModule
  ],
  exports:[AccountingComponents]
})
export class AccountingModule { }
