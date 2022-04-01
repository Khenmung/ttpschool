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
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import {
//   NgxMatDatetimePickerModule,
//   NgxMatNativeDateModule,
//   NgxMatTimepickerModule
// } from '@angular-material-components/datetime-picker';
import {
  NgxMatDateAdapter,
  NgxMatDateFormats,
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule,
  NGX_MAT_DATE_FORMATS
} from '@angular-material-components/datetime-picker';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { NoOfStudentComponent } from './no-of-student/no-of-student.component';

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
  declarations: [MiscComponents, NoOfStudentComponent],
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
    NgxMatNativeDateModule
  ],
  providers:[
    //{ provide: ErrorStateMatcher, useClass: TouchedErrorStateMatcher },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ],
  exports:[MiscComponents]
})
export class MiscModule { }
