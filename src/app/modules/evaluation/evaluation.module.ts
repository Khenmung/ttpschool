import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EvaluationComponents, EvaluationRoutingModule } from './evaluation-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
//import { EvaluationnameComponent } from './evaluationname/evaluationname.component';

@NgModule({
  declarations: [
    EvaluationComponents
  ],
  imports: [
    CommonModule,
    EvaluationRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    SharedhomepageModule
  ],
  exports:[
    EvaluationComponents
  ]
})
export class EvaluationModule { }
