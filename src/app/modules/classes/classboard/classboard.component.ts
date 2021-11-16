import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { ClassdetailComponent } from '../classdetail/classdetail.component';
import { ClassprerequisiteComponent } from '../classprerequisite/classprerequisite.component';
import { ClassmasterdashboardComponent } from '../classsmastermapping/classmasterdashboard.component';
import { DashboardclassfeeComponent } from '../dashboardclassfee/dashboardclassfee.component';
import { SchoolFeeTypesComponent } from '../school-fee-types/school-fee-types.component';

@Component({
  selector: 'app-classboard',
  templateUrl: './classboard.component.html',
  styleUrls: ['./classboard.component.scss']
})
export class ClassboardComponent implements AfterViewInit {
  components = [
    ClassdetailComponent,
    DashboardclassfeeComponent,
    ClassprerequisiteComponent,
    ClassmasterdashboardComponent,
    SchoolFeeTypesComponent
  ];

  tabNames = [
    { "label": "Class Detail", "faIcon": '' },
    { "label": "Fee", "faIcon": '' },
    { "label": "Pre-requisite", "faIcon": '' },
    { "label": "Class Master", "faIcon": '' },
    { "label": "Fee Type", "faIcon": '' }
  ];

  Permissions =
    {
      ParentPermission: '',
      ClassDetailPermission: '',
      FeePermission: '',
      PreRequisitePermission: '',
      ClassMasterPermission: '',
      FeeTypePermission: ''
    };

  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private contentservice:ContentService,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    private componentFactoryResolver: ComponentFactoryResolver) {
  }

  public ngAfterViewInit(): void {
    this.contentservice.GetApplicationRoleUser(this.tokenStorage.getUserDetail());
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.CLASSCOURSE)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;
      //this.tabNames
    }
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.DETAIL)
    if (perObj.length > 0) {
      this.tabNames[0].faIcon = perObj[0].faIcon;
      this.Permissions.ClassDetailPermission = perObj[0].permission;
    }
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.FEE)
    if (perObj.length > 0) {
      this.Permissions.FeePermission = perObj[0].permission;
      this.tabNames[1].faIcon = perObj[0].faIcon;
    }
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.PREREQUISITE)
    if (perObj.length > 0) {
      this.Permissions.PreRequisitePermission = perObj[0].permission;
      this.tabNames[2].faIcon = perObj[0].faIcon;
    }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.CLASSMASTER)
    if (perObj.length > 0) {
      this.Permissions.ClassMasterPermission = perObj[0].permission;
      this.tabNames[3].faIcon = perObj[0].faIcon;
    }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.FEETYPE)
    if (perObj.length > 0) {
      this.Permissions.FeeTypePermission = perObj[0].permission;
      this.tabNames[4].faIcon = perObj[0].faIcon;
    }


    this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);

    console.log("this.Permissions.ParentPermission", this.Permissions.ParentPermission);
    console.log("this.Permissions.ClassDetailPermission", this.Permissions.ClassDetailPermission);
    console.log("this.Permissions.FeePermission", this.Permissions.FeePermission);
    console.log("this.Permissions.PreRequisitePermission", this.Permissions.PreRequisitePermission);
    console.log("this.Permissions.FeeTypePermission", this.Permissions.FeeTypePermission);
    console.log("this.Permissions.ClassMasterPermission", this.Permissions.ClassMasterPermission);
    if (this.Permissions.ClassDetailPermission == 'deny') {
      var comindx = this.components.indexOf(ClassdetailComponent);
      this.components.splice(comindx, 1);
      this.tabNames.splice(comindx, 1);
    }
    if (this.Permissions.ClassMasterPermission == 'deny') {
      var comindx = this.components.indexOf(ClassmasterdashboardComponent);
      this.components.splice(comindx, 1);
      this.tabNames.splice(comindx, 1);
    }
    if (this.Permissions.FeePermission == 'deny') {
      var comindx = this.components.indexOf(DashboardclassfeeComponent);
      this.components.splice(comindx, 1);
      this.tabNames.splice(comindx, 1);
    }
    if (this.Permissions.FeeTypePermission == 'deny') {
      var comindx = this.components.indexOf(SchoolFeeTypesComponent);
      this.components.splice(comindx, 1);
      this.tabNames.splice(comindx, 1);
    }
    if (this.Permissions.PreRequisitePermission == 'deny') {
      var comindx = this.components.indexOf(ClassprerequisiteComponent);
      this.components.splice(comindx, 1);
      this.tabNames.splice(comindx, 1);
    }


    if (this.Permissions.ParentPermission != 'deny') {
      this.renderComponent(0);
      this.cdr.detectChanges();
    }
  }

  public tabChange(index: number) {
    //    console.log("index", index)
    setTimeout(() => {
      this.renderComponent(index);
    }, 550);

  }
  selectedIndex = 0;


  private renderComponent(index: number): any {
    const factory = this.componentFactoryResolver.resolveComponentFactory<any>(this.components[index]);
    this.viewContainer.createComponent(factory);
    //ClassprerequisiteComponent this.componentFactoryResolver.resolveComponentFactory
  }
}
