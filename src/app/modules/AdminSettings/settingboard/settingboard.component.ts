import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AddMasterDataComponent } from '../../FeesManagement/add-master-data/add-master-data.component';
import { roleuserdashboardComponent } from '../roleuser/roleuserdashboard/roleuserdashboard.component';
import { AppuserdashboardComponent } from '../users/appuserdashboard/appuserdashboard.component';
//import { RegisterComponent } from '../auth/register/register.component';
import { RoleAppdashboardComponent } from '../roleapppermission/RoleAppdashboard/RoleAppdashboard.component';

@Component({
  selector: 'app-signup',
  templateUrl: './settingboard.component.html',
  styleUrls: ['./settingboard.component.scss']
})
export class settingboardComponent implements OnInit,AfterViewInit {
  @ViewChild(AddMasterDataComponent) masterSettingData: AddMasterDataComponent;
  @ViewChild(AppuserdashboardComponent) userdashboard: AppuserdashboardComponent;
  @ViewChild(roleuserdashboardComponent) roleuserdashboard: roleuserdashboardComponent;
  @ViewChild(RoleAppdashboardComponent) roleappdashboard: RoleAppdashboardComponent;
  selectedIndex = 0;
  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.masterSettingData.PageLoad();  
    }, 100);
    
  }
  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    //this.masterSettingData.PageLoad();
  }
  tabChanged(event) {
    //console.log(event);
    switch (event) {
      case 0:
        this.masterSettingData.PageLoad();
        break;
      case 1:
        this.userdashboard.PageLoad();
        break;
      case 2:
        this.roleuserdashboard.PageLoad();
        break;
      case 3:
        this.roleappdashboard.PageLoad();
        break;
      default:
        this.masterSettingData.PageLoad();
        break;
    }
  }
}