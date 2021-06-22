import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudenthomeComponent } from '../StudentSubject/studenthome/studenthome.component';
import { AttendanceComponent } from './attendance/attendance.component';

const routes: Routes = [
  {path:'',component:StudenthomeComponent,
  children:[
    {path:'',component:AttendanceComponent}
  ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendanceRoutingModule { }

