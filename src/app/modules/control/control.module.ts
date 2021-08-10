import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminsettingsRoutingModule, settingsComponent } from './control-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { SchoolReportsModule } from '../Reports/reports.module';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [settingsComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    AdminsettingsRoutingModule,
    SharedhomepageModule,
    SchoolReportsModule,
    FlexLayoutModule
  ],
  exports:[settingsComponent]
})
export class ControlModule { }
