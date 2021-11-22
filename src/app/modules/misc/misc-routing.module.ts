import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalendarComponent } from './calendar/calendar.component';
import { NewsNEventComponent } from './news-nevent/news-nevent.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MiscRoutingModule { }
export const MiscComponents=[
  CalendarComponent,
  NewsNEventComponent
]
