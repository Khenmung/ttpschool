import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AddMasterDataComponent } from '../add-master-data/add-master-data.component';
import { roleuserdashboardComponent } from '../roleuser/roleuserdashboard/roleuserdashboard.component';
import { AppuserdashboardComponent } from '../users/appuserdashboard/appuserdashboard.component';
import { RoleAppPermissiondashboardComponent } from '../roleapppermission/RoleAppPermissiondashboard/RoleAppPermissiondashboard.component';
import { BatchdashboardComponent } from '../batchdashboard/batchdashboard.component';
import { SchoolFeeTypesComponent } from '../school-fee-types/school-fee-types.component';
import { VariableConfigComponent } from '../variable-config/variable-config.component';

@Component({
  selector: 'app-signup',
  templateUrl: './settingboard.component.html',
  styleUrls: ['./settingboard.component.scss']
})
export class settingboardComponent implements OnInit, AfterViewInit {
  @ViewChild(AddMasterDataComponent) masterSettingData: AddMasterDataComponent;
  @ViewChild(AppuserdashboardComponent) userdashboard: AppuserdashboardComponent;
  @ViewChild(roleuserdashboardComponent) roleuserdashboard: roleuserdashboardComponent;
  @ViewChild(RoleAppPermissiondashboardComponent) roleapppermissiondashboard: RoleAppPermissiondashboardComponent;
  @ViewChild(BatchdashboardComponent) batchdashboard: BatchdashboardComponent;
  @ViewChild(SchoolFeeTypesComponent) feetype: SchoolFeeTypesComponent;
  @ViewChild(VariableConfigComponent) varconfig: VariableConfigComponent;
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
        this.batchdashboard.PageLoad();
        break;
      case 2:
        this.userdashboard.PageLoad();
        break;
      case 3:
        this.roleuserdashboard.PageLoad();
        break;
      case 4:
        this.roleapppermissiondashboard.PageLoad();
        break;
      case 5:
        this.feetype.PageLoad();
        break;
      case 6:
        this.varconfig.PageLoad();
        break;
      default:
        this.masterSettingData.PageLoad();
        break;
    }
  }
}
