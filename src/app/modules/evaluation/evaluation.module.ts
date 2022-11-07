import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EvaluationComponents, EvaluationRoutingModule } from './evaluation-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { NgxPrintModule } from 'ngx-print';
import { SharedModule } from 'src/app/shared/shared.module';
import { EvaluationresultlistComponent } from './evaluationresultlist/evaluationresultlist.component';

@NgModule({
  declarations: [
    EvaluationComponents,
    EvaluationresultlistComponent  
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
