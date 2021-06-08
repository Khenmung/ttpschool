import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { roleuseraddComponent } from '../AdminSettings/roleuser/roleuseradd/roleuseradd.component';
// import { roleuserdashboardComponent } from '../AdminSettings/roleuser/roleuserdashboard/roleuserdashboard.component';
// import { userComponent } from '../AdminSettings/users/appuser/user.component';
// import { AppuserdashboardComponent } from '../AdminSettings/users/appuserdashboard/appuserdashboard.component';
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
  
]
