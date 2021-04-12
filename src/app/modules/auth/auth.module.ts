import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthHomeComponent } from './authhome/authhome.component';
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
    AuthHomeComponent,
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
    AuthHomeComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
],
providers:[SharedataService]
})
export class AuthModule { }
