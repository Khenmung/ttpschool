import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GlobalAdminComponents, GlobaladminRoutingModule } from './globaladmin-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { ControlModule } from '../control/control.module';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations: [GlobalAdminComponents],
  imports: [
    CommonModule,
    GlobaladminRoutingModule,
    SharedModule,
    SharedhomepageModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    ControlModule,
    FlexLayoutModule

    //DefinePagesModule
  ],
  exports:[GlobalAdminComponents]
})
export class GlobaladminModule { }
