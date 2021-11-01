import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralreportComponents, GeneralreportRoutingModule } from './generalreport-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations: [GeneralreportComponents],
  imports: [
    CommonModule,
    GeneralreportRoutingModule,
    SharedModule,
    SharedhomepageModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule

  ],
  exports:[GeneralreportComponents]
})
export class GeneralreportModule { }