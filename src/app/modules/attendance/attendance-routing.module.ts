import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { AttendanceComponent } from './attendance/attendance.component';

const routes: Routes = [
  {path:'',component:HomeComponent,
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

