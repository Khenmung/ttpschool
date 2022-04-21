import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
//import { CalendarComponent } from './calendar/calendar.component';
import { MiscboardComponent } from './miscboard/miscboard.component';
import { EventComponent } from './event/event.component';
import { HolidayComponent } from './holiday/holiday.component';
import { NoOfStudentComponent } from './no-of-student/no-of-student.component';
import { DemoComponent } from './calendar/calendar.component';

const routes: Routes = [
  {
    path: "", component: HomeComponent,
    children: [
      { path: "", component: MiscboardComponent },
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MiscRoutingModule { }
export const MiscComponents = [
  //  CalendarComponent,
  DemoComponent,
  NoOfStudentComponent,
  EventComponent,
  MiscboardComponent,
  HolidayComponent
]
