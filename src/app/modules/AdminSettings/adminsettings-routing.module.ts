import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { roleappAddComponent } from './roleapppermission/roleappadd/roleappadd.component';
import { RoleAppdashboardComponent } from './roleapppermission/RoleAppdashboard/RoleAppdashboard.component';
import { roleuseraddComponent } from './roleuser/roleuseradd/roleuseradd.component';
import { roleuserdashboardComponent } from './roleuser/roleuserdashboard/roleuserdashboard.component';
import { settingboardComponent } from './settingboard/settingboard.component';
import { userComponent } from './users/appuser/user.component';
import { AppuserdashboardComponent } from './users/appuserdashboard/appuserdashboard.component';
import { ControlhomeComponent } from './controlhome/controlhome.component';
import { BatchdashboardComponent } from './batchdashboard/batchdashboard.component';

const routes: Routes = [
  {
    path: '', component: ControlhomeComponent,
    children: [
      { path: '', component: settingboardComponent },
      { path: 'addapproleuser', component: roleuseraddComponent },
      { path: 'appuser', component: userComponent },
      { path: 'appuserdashboard', component: AppuserdashboardComponent },
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminsettingsRoutingModule { }
export const settingsComponent = [
  userComponent,
  AppuserdashboardComponent,
  roleuseraddComponent,
  roleuserdashboardComponent,
  settingboardComponent,
  roleappAddComponent,
  RoleAppdashboardComponent,
  ControlhomeComponent,
  BatchdashboardComponent
]
