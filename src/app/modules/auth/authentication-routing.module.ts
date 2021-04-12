import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//import { CarouselComponent } from 'angular-responsive-carousel';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  {
    path: '', component: LoginComponent,
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
export const AuthRoutingComponents = [
  ChangePasswordComponent,
  LoginComponent,
  ProfileComponent,
  RegisterComponent
]
