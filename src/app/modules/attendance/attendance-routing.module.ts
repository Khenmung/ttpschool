import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { AttendanceboardComponent } from './attendanceboard/attendanceboard.component';
import { AttendancelistComponent } from './attendancelist/attendancelist.component';
import { AttendancereportComponent } from './attendancereport/attendancereport.component';
import { EmployeetotalattendanceComponent } from './employeetotalattendance/employeetotalattendance.component';
import { StudentAttendanceComponent } from './studentattendance/studentattendance.component';
import { StudenttotalattendanceComponent } from './studenttotalattendance/studenttotalattendance.component';
import { TeacherAttendanceComponent } from './teacherattendance/teacherattendance.component';

const routes: Routes = [
  {path:'',component:HomeComponent,
  children:[
    {path:'',component:AttendanceboardComponent},
    {path:'teacher',component:TeacherAttendanceComponent}
  ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendanceRoutingModule { }
export const AttendanceComponents=[
  AttendanceboardComponent,
  StudentAttendanceComponent,
  TeacherAttendanceComponent,
  AttendanceboardComponent, 
  StudenttotalattendanceComponent, 
  EmployeetotalattendanceComponent,
  AttendancereportComponent,
  AttendancelistComponent
]

