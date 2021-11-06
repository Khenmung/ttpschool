import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AddMasterDataComponent } from '../add-master-data/add-master-data.component';
import { roleuserdashboardComponent } from '../roleuser/roleuserdashboard/roleuserdashboard.component';
import { AppuserdashboardComponent } from '../users/appuserdashboard/appuserdashboard.component';
import { RoleAppPermissiondashboardComponent } from '../roleapppermission/RoleAppPermissiondashboard/RoleAppPermissiondashboard.component';
import { BatchdashboardComponent } from '../batchdashboard/batchdashboard.component';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-signup',
  templateUrl: './settingboard.component.html',
  styleUrls: ['./settingboard.component.scss']
})
export class settingboardComponent implements AfterViewInit {
    components = [
      AddMasterDataComponent,
      AppuserdashboardComponent,
      roleuserdashboardComponent,
      RoleAppPermissiondashboardComponent,
      BatchdashboardComponent
    ];
  
    tabNames = [
      { "label": "khat peuhpeuh", "faIcon": '' },
      { "label": "khat peuhpeuh", "faIcon": '' },
      { "label": "khat peuhpeuh", "faIcon": '' },
      { "label": "khat peuhpeuh", "faIcon": '' },
      { "label": "Khat peuhpeuh", "faIcon": '' }
    ];
    //tabNames = ["Subject Type","Subject Detail","Subject Mark Component", "Class Student", "Student Subject"];
    Permissions =
      {
        ParentPermission: '',
        DataDownloadPermission: '',
        DataUploadPermission: ''
      };
  
    @ViewChild('container', { read: ViewContainerRef, static: false })
    public viewContainer: ViewContainerRef;
  
    constructor(
      private cdr: ChangeDetectorRef,
      private tokenStorage: TokenStorageService,
      private shareddata: SharedataService,
      private componentFactoryResolver: ComponentFactoryResolver) {
    }
  
    public ngAfterViewInit(): void {
      debugger
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.CONTROL)
      if (perObj.length > 0) {
        this.Permissions.ParentPermission = perObj[0].permission;
  
      }
  
      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.MASTERS)
      var comindx = this.components.indexOf(AddMasterDataComponent);
      if (perObj.length > 0) {
        if (perObj[0].permission == 'deny') {
          this.components.splice(comindx, 1);
          this.tabNames.splice(comindx, 1);
        }
        else {
          this.tabNames[comindx].faIcon = perObj[0].faIcon;
          this.tabNames[comindx].label = perObj[0].label;
        }
      }
      else {
        this.components.splice(comindx, 1);
        this.tabNames.splice(comindx, 1);
      }
  
      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.BATCHDASHBOARD)
      var comindx = this.components.indexOf(BatchdashboardComponent);
      if (perObj.length > 0) {
        if (perObj[0].permission == 'deny') {
          this.components.splice(comindx, 1);
          this.tabNames.splice(comindx, 1);
        }
        else {
          this.tabNames[comindx].faIcon = perObj[0].faIcon;
          this.tabNames[comindx].label = perObj[0].label;
        }
      }
      else {
        this.components.splice(comindx, 1);
        this.tabNames.splice(comindx, 1);
      }
  
      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.USERS)
      var comindx = this.components.indexOf(AppuserdashboardComponent);
      if (perObj.length > 0) {
        if (perObj[0].permission == 'deny') {
          this.components.splice(comindx, 1);
          this.tabNames.splice(comindx, 1);
        }
        else {
          this.tabNames[comindx].faIcon = perObj[0].faIcon;
          this.tabNames[comindx].label = perObj[0].label;
        }
      }
      else {
        this.components.splice(comindx, 1);
        this.tabNames.splice(comindx, 1);
      }

      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.ROLEUSER)
      var comindx = this.components.indexOf(roleuserdashboardComponent);
      if (perObj.length > 0) {
        if (perObj[0].permission == 'deny') {
          this.components.splice(comindx, 1);
          this.tabNames.splice(comindx, 1);
        }
        else {
          this.tabNames[comindx].faIcon = perObj[0].faIcon;
          this.tabNames[comindx].label = perObj[0].label;
        }
      }
      else {
        this.components.splice(comindx, 1);
        this.tabNames.splice(comindx, 1);
      }

      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.APPLICATIONFEATUREPERMISSION)
      var comindx = this.components.indexOf(RoleAppPermissiondashboardComponent);
      if (perObj.length > 0) {
        if (perObj[0].permission == 'deny') {
          this.components.splice(comindx, 1);
          this.tabNames.splice(comindx, 1);
        }
        else {
          this.tabNames[comindx].faIcon = perObj[0].faIcon;
          this.tabNames[comindx].label = perObj[0].label;
        }
      }
      else {
        this.components.splice(comindx, 1);
        this.tabNames.splice(comindx, 1);
      }
      
      this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);
      if (this.Permissions.ParentPermission != 'deny') {
        this.renderComponent(0);
        this.cdr.detectChanges();
      }
    }
  
    public tabChange(index: number) {
      setTimeout(() => {
        this.renderComponent(index);
      }, 550);
  
    }
    selectedIndex = 0;
  
  
    private renderComponent(index: number): any {
      const factory = this.componentFactoryResolver.resolveComponentFactory<any>(this.components[index]);
      this.viewContainer.createComponent(factory);
    }
  }
  