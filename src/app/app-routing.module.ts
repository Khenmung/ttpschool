import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotfoundComponent } from './shared/components/notfound/notfound.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/website.module').then(m => m.WebsiteModule)
    //loadChildren:()=>import('./shared/components/landingpage/landingpage.module').then(c=>c.LandingpageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./modules/website.module').then(m => m.WebsiteModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'admin/:id',
    loadChildren: () => import('./modules/control/control.module').then(m => m.ControlModule)
  },
  {
    path: 'edu/:id/cls',
    loadChildren: () => import('./modules/classes/classes.module').then(m => m.ClassesModule)
  },
  {
    path: 'edu/:id/subject',//runGuardsAndResolvers:'always',
    loadChildren: () => import('./modules/ClassSubject/student-subject.module').then(m => m.StudentSubjectModule)
  },
  {
    path: 'edu/:id/exam',
    loadChildren: () => import('./modules/studentexam/studentexam.module').then(m => m.StudentexamModule)
  },  
  {
    path: 'edu/:id/reports',
    loadChildren: () => import('./modules/schoolreports/reports.module').then(m => m.SchoolReportsModule)
  },
  {
    path: 'edu/:id/reportconfig',
    loadChildren: () => import('./modules/ReportConfig/report-configuration.module').then(m => m.ReportConfigurationModule)
  },
  {
    path: 'edu/:id',
    loadChildren: () => import('./modules/student/student.module').then(m => m.StudentModule)
  },
  {
    path: 'edu/:id/attendance',
    loadChildren: () => import('./modules/attendance/attendance.module').then(m => m.AttendanceModule)
  },
  {
    path: 'employee/:id',
    loadChildren: () => import('./modules/EmployeeManagement/employee-management.module').then(m => m.EmployeeManagementModule)
  },
  {
    path: 'leave/:id',
    loadChildren: () => import('./modules/LeaveManagement/leave-management.module').then(m => m.LeaveManagementModule)
  },
  {
    path: 'accounting/:id',
    loadChildren: () => import('./modules/Accounting/accounting.module').then(m => m.AccountingModule)
  },
  {
    path: 'edu/:id/timetable',
    loadChildren: () => import('./modules/schooltimetable/schooltimetable.module').then(m => m.SchooltimetableModule)
  },
  {
    path: 'globaladmin/:id',
    loadChildren: () => import('./modules/globaladmin/globaladmin.module').then(m => m.GlobaladminModule)
  },
  { path: '**', component: NotfoundComponent },
  

];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    //  ExpandCollapseRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }