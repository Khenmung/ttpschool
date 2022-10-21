import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotfoundComponent } from './shared/components/notfound/notfound.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'edu/photo',
    loadChildren: () => import('./modules/collection/photogallery.module').then(m => m.PhotogalleryModule)
  },
  {
    path: 'edu/questionbank',
    loadChildren: () => import('./modules/questionbank/questionbank.module').then(m => m.QuestionbankModule)
  },
  {
    path: 'web/photo',
    loadChildren: () => import('./modules/collection/photogallery.module').then(m => m.PhotogalleryModule)
  },
  {
    path: 'web/page',
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
    path: 'edu/reportconfig',
    loadChildren: () => import('./modules/fieldconfiguration/appconfigdata.module').then(m => m.AppconfigdataModule)
  },
  {
    path: 'emp/reportconfig',
    loadChildren: () => import('./modules/fieldconfiguration/appconfigdata.module').then(m => m.AppconfigdataModule)
  },
  {
    path: 'edu/uploaddownload',
    loadChildren: () => import('./modules/DataUploadDownload/generalreport.module').then(m=>m.GeneralreportModule)
  },
  {
    path: 'emp/uploaddownload',
    loadChildren: () => import('./modules/DataUploadDownload/generalreport.module').then(m=>m.GeneralreportModule)
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
    path: 'edu/misc',
    loadChildren: () => import('./modules/frontoffice/misc.module').then(m => m.MiscModule)
  },
  {
    path: 'emp/attendance',
    loadChildren: () => import('./modules/attendance/attendance.module').then(m => m.AttendanceModule)
  },
  {
    path: 'edu/specialfeature',
    loadChildren: () => import('./modules/specialfeature/studentactivity.module').then(m => m.StudentactivityModule)
  },
  {
    path: 'employee',
    loadChildren: () => import('./modules/employeedetail/employeedetail.module').then(m => m.EmployeedetailModule)
  },
  {
    path: 'employee/sal',
    loadChildren: () => import('./modules/employeesalary/employee-salary.module').then(m => m.EmployeeManagementModule)
  },
  {
    path: 'employee/setting',
    loadChildren: () => import('./modules/control/control.module').then(m => m.ControlModule)
  },
  {
    path: 'accounting/setting',
    loadChildren: () => import('./modules/control/control.module').then(m => m.ControlModule)
  },
  {
    path: 'leave',
    loadChildren: () => import('./modules/LeaveManagement/leave-management.module').then(m => m.LeaveManagementModule)
  },
  {
    path: 'edu/evaluation',
    loadChildren: () => import('./modules/evaluation/evaluation.module').then(m => m.EvaluationModule)
  },
  {
    path: 'accounting',
    loadChildren: () => import('./modules/Accounting/accounting.module').then(m => m.AccountingModule)
  },  
  {
    path: 'globaladmin',
    loadChildren: () => import('./modules/globaladmininitial/globaladminInitial.module').then(m => m.GlobaladminInitialModule)
  },  
  {
    path: 'edu/page',
    loadChildren: () => import('./modules/define-pages/define-pages.module').then(m => m.DefinePagesModule)
  },
  {
    path: 'globaladmin/inv',
    loadChildren: () => import('./modules/globaladmininvoice/globaladmininvoice.module').then(m => m.GlobaladmininvoiceModule)
  },
  {
    path: 'emp/employeeactivity',
    loadChildren: () => import('./modules/employeeactivity/employeeactivity.module').then(m=>m.EmployeeactivityModule)
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