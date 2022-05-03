import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminsettingsRoutingModule, settingsComponent } from './control-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { SchoolReportsModule } from '../schoolreports/reports.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SingleorganizationComponent } from './singleorganization/singleorganization.component';
//import { OrganizationComponent } from './organization/organization.component';
//import { DefinePagesModule } from '../define-pages/define-pages.module';

@NgModule({
  declarations: [settingsComponent, SingleorganizationComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    AdminsettingsRoutingModule,
    SharedhomepageModule,
    SchoolReportsModule,
    FlexLayoutModule,
    //DefinePagesModule
  ],
  exports:[settingsComponent]
})
export class ControlModule { }
