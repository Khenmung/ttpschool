import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/shared/material/material.module';

import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import {NgxPrintModule} from 'ngx-print';
import { NgxFileDropModule } from 'ngx-file-drop';
import { FeeManagementComponent, FeeManagementRoutingModule } from './fee-management-routing.module';
import { MultiLevelMenuModule } from '../dynamicMultiLevelMenu/MultiLevelMenu.module';
import { SharedhomepageModule } from '../sharedhomepage.module';


@NgModule({
  declarations: [
    FeeManagementComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    MultiLevelMenuModule,
    NgxPrintModule,
    NgxFileDropModule,
    FeeManagementRoutingModule,
    SharedhomepageModule
  ],
  providers:[
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ],
  exports:[FeeManagementComponent]
})
export class FeesmanagementModule { }
