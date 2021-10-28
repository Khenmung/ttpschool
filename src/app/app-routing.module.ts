import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotfoundComponent } from './shared/components/notfound/notfound.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
    //loadChildren: () => import('./modules/website.module').then(m => m.WebsiteModule)
    //loadChildren:()=>import('./shared/components/landingpage/landingpage.module').then(c=>c.LandingpageModule)
  },
  {
    path: 'web/photo',
    loadChildren: () => import('./modules/photogallery/photogallery.module').then(m => m.PhotogalleryModule)
  },
  {
    path: 'web/pages',
    loadChildren: () => import('./modules/define-pages/define-pages.module').then(m => m.DefinePagesModule)
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
    path: 'common',
    loadChildren: () => import('./modules/control/control.module').then(m => m.ControlModule)
  },
  {
    path: 'common/config',
    loadChildren: () => import('./modules/appconfigdata/appconfigdata.module').then(m => m.AppconfigdataModule)
  },
  {
    path: 'common/uploaddownload',
    loadChildren: () => import('./modules/generalreport/generalreport.module').then(m => m.GeneralreportModule)
  },
  {
    path: 'edu',
    loadChildren: () => import('./modules/student/student.module').then(m => m.StudentModule)
  },
  {
    path: 'edu/cls',
    loadChildren: () => import('./modules/classes/classes.module').then(m => m.ClassesModule)
  },
  {
    path: 'edu/setting',
    loadChildren: () => import('./modules/control/control.module').then(m => m.ControlModule)
  },
  {
    path: 'edu/timetable',
    loadChildren: () => import('./modules/schooltimetable/schooltimetable.module').then(m => m.SchooltimetableModule)
  },
  {
    path: 'edu/subject',//runGuardsAndResolvers:'always',
    loadChildren: () => import('./modules/ClassSubject/student-subject.module').then(m => m.StudentSubjectModule)
  },
  {
    path: 'edu/exam',
    loadChildren: () => import('./modules/studentexam/studentexam.module').then(m => m.StudentexamModule)
  },  
  {
    path: 'edu/reports',
    loadChildren: () => import('./modules/schoolreports/reports.module').then(m => m.SchoolReportsModule)
  },  
  {
    path: 'edu/attendance',
    loadChildren: () => import('./modules/attendance/attendance.module').then(m => m.AttendanceModule)
  },
  {
    path: 'employee',
    loadChildren: () => import('./modules/EmployeeManagement/employee-management.module').then(m => m.EmployeeManagementModule)
  },
  {
    path: 'leave',
    loadChildren: () => import('./modules/LeaveManagement/leave-management.module').then(m => m.LeaveManagementModule)
  },
  {
    path: 'accounting',
    loadChildren: () => import('./modules/Accounting/accounting.module').then(m => m.AccountingModule)
  },  
  {
    path: 'globaladmin',
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