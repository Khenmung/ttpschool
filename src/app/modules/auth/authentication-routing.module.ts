import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApproleuseraddComponent } from './approleuseradd/approleuseradd.component';
import { ApproleuserdashboardComponent } from './approleuserdashboard/approleuserdashboard.component';
import { AppuserComponent } from './appuser/appuser.component';
import { AppuserdashboardComponent } from './appuserdashboard/appuserdashboard.component';
import { AuthHomeComponent } from './authhome/authhome.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  {
    path: '', component: AuthHomeComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'changepassword', component: ChangePasswordComponent },
      { path: 'createlogin', component: RegisterComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'signup', component: AppuserComponent },
      { path: 'addapproleuser', component: ApproleuseraddComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
export const AuthComponents = [
  AuthHomeComponent,
  ChangePasswordComponent,
  LoginComponent,
  ProfileComponent,
  RegisterComponent,
  AuthHomeComponent,
  AppuserComponent,
  AppuserdashboardComponent,
  ApproleuseraddComponent,
  ApproleuserdashboardComponent,
]
