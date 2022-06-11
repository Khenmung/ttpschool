import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EvaluationComponents, EvaluationRoutingModule } from './evaluation-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { NgxPrintModule } from 'ngx-print';
import { SharedModule } from 'src/app/shared/shared.module';
import { EvaluationstatusComponent } from './evaluationstatus/evaluationstatus.component';
//import { EvaluationresultComponent } from './evaluationresult/evaluationresult.component';
//import { EvaluationnameComponent } from './evaluationname/evaluationname.component';

@NgModule({
  declarations: [
    EvaluationComponents,
    EvaluationstatusComponent
  ],
  imports: [
    CommonModule,
    EvaluationRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    SharedhomepageModule,
    NgxPrintModule,
    SharedModule

  ],
  exports:[
    EvaluationComponents
  ]
})
export class EvaluationModule { }
