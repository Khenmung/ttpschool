import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular'; 
import dayGridPlugin from '@fullcalendar/daygrid'; 
import interactionPlugin from '@fullcalendar/interaction';
import { MiscComponents, MiscRoutingModule } from './misc-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FlatpickrModule } from 'angularx-flatpickr';
import { CalendarModule,DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
// import {
//   NgxMatDatetimePickerModule,
//   NgxMatNativeDateModule,
//   NgxMatTimepickerModule
// } from '@angular-material-components/datetime-picker';
import {
  //NgxMatDateAdapter,
  NgxMatDateFormats,
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule,
  //NGX_MAT_DATE_FORMATS
} from '@angular-material-components/datetime-picker';
import { RulesorpolicyComponent } from './rulesorpolicy/rulesorpolicy.component';
import { RulesnpolicyreportComponent } from './rulesnpolicyreport/rulesnpolicyreport.component';
//import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';

const CUSTOM_DATE_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: "DD/MM/YYYY HH:MM"
  },
  display: {
    dateInput: "l, LTS",
    //dateInput:'DD-MM-YYYY HH:MM',
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY"
  }
}
FullCalendarModule.registerPlugins([ 
  dayGridPlugin,
  interactionPlugin
]);

@NgModule({
  declarations: [MiscComponents],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedhomepageModule,
    SharedModule,
    MiscRoutingModule,
    FullCalendarModule,
    NgbModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    NgbModalModule,
    FlatpickrModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ],
  providers:[
    //{ provide: ErrorStateMatcher, useClass: TouchedErrorStateMatcher },
    //{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ],
  exports:[MiscComponents]
})
export class MiscModule { }