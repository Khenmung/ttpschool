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
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'subject',
    loadChildren: () => import('./modules/StudentSubject/student-subject.module').then(m => m.StudentSubjectModule)
  },
  {
    path: 'exam',
    loadChildren: () => import('./modules/studentexam/studentexam.module').then(m => m.StudentexamModule)
  },
  {
    path: 'control',
    loadChildren: () => import('./modules/AdminSettings/adminsettings.module').then(m => m.AdminsettingsModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/FeesManagement/FeesManagement.module').then(m => m.FeesmanagementModule)
  },
  {
    path: 'attendance',
    loadChildren: () => import('./modules/attendance/attendance.module').then(m => m.AttendanceModule)
  },
  { path: '**', component: NotfoundComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    //  ExpandCollapseRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }