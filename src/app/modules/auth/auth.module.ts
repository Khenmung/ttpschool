import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { SharedataService } from '../../shared/sharedata.service'
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    ChangePasswordComponent,

  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    RouterModule,
    SharedModule,
    FlexLayoutModule
  ],
  exports:[    
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
],
providers:[SharedataService]
})
export class AuthModule { }
