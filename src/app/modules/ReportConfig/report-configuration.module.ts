import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportConfigComponents, ReportConfigurationRoutingModule } from './report-configuration-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { FlexLayoutModule } from '@angular/flex-layout';



@NgModule({
  declarations: [ReportConfigComponents],
  imports: [
    CommonModule,
    ReportConfigurationRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule,
    SharedhomepageModule,
    FlexLayoutModule
  ],
  exports:[ReportConfigComponents]
})
export class ReportConfigurationModule { }
