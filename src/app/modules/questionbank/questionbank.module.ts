import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuestionBankComponents, QuestionbankRoutingModule } from './questionbank-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';


@NgModule({
  declarations: [
  QuestionBankComponents    
  ],
  imports: [
    CommonModule,
    SharedModule,
    SharedhomepageModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    QuestionbankRoutingModule
  ],
  exports:[QuestionBankComponents]
})
export class QuestionbankModule { }
