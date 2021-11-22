import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular'; 
import dayGridPlugin from '@fullcalendar/daygrid'; 
import interactionPlugin from '@fullcalendar/interaction';
import { MiscComponents, MiscRoutingModule } from './misc-routing.module';
import { MiscboardComponent } from './miscboard/miscboard.component';


FullCalendarModule.registerPlugins([ 
  dayGridPlugin,
  interactionPlugin
]);

@NgModule({
  declarations: [MiscComponents, MiscboardComponent],
  imports: [
    CommonModule,
    MiscRoutingModule,
    FullCalendarModule
  ],
  exports:[MiscComponents]
})
export class MiscModule { }
