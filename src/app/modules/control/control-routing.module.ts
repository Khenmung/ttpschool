import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { roleappAddComponent } from './roleapppermission/roleappadd/roleappadd.component';
import { RoleAppPermissiondashboardComponent } from './roleapppermission/RoleAppPermissiondashboard/RoleAppPermissiondashboard.component';
import { roleuseraddComponent } from './roleuser/roleuseradd/roleuseradd.component';
import { roleuserdashboardComponent } from './roleuser/roleuserdashboard/roleuserdashboard.component';
import { settingboardComponent } from './settingboard/settingboard.component';
import { userComponent } from './users/appuser/user.component';
import { AppuserdashboardComponent } from './users/appuserdashboard/appuserdashboard.component';
import { ControlhomeComponent } from './controlhome/controlhome.component';
import { BatchdashboardComponent } from './batchdashboard/batchdashboard.component';
import { AddMasterDataComponent } from './add-master-data/add-master-data.component';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { OrganizationComponent } from './organization/organization.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent,
    children: [
      { path: '', component: settingboardComponent },
      { path: 'setting', component: settingboardComponent },
      { path: 'roleuser', component: roleuseraddComponent },
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
  RoleAppPermissiondashboardComponent,
  ControlhomeComponent,
  BatchdashboardComponent,
  AddMasterDataComponent,
  OrganizationComponent  
]
