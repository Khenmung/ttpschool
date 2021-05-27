import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material/material.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { SharedataService } from '../../shared/sharedata.service'
import { FlexLayoutModule } from '@angular/flex-layout';
import { AuthComponents, AuthenticationRoutingModule } from './authentication-routing.module';
import { SharedhomepageModule } from '../sharedhomepage.module';

@NgModule({
  declarations: [
    AuthComponents,

    
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    FlexLayoutModule,
    SharedhomepageModule,
    AuthenticationRoutingModule
  ],
  exports: [
    AuthComponents
  ],
  providers: [SharedataService]
})
export class AuthModule { }
