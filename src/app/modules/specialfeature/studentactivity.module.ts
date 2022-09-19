import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentActivityComponents, StudentactivityRoutingModule } from './studentactivity-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { NgxPrintModule } from 'ngx-print';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedModule } from 'src/app/shared/shared.module';
//import { AchievementandpointComponent } from './achievementandpoint/achievementandpoint.component';

@NgModule({
  declarations: [StudentActivityComponents],
  imports: [
    CommonModule,
    StudentactivityRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedhomepageModule,
    SharedModule,
    NgxPrintModule,
    FlexLayoutModule
  ]
})
export class StudentactivityModule { }
