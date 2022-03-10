import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { ClassdetailComponent } from '../classdetail/classdetail.component';
import { ClassprerequisiteComponent } from '../classprerequisite/classprerequisite.component';
import { ClassmasterdashboardComponent } from '../classsmastermapping/classmasterdashboard.component';
import { DashboardclassfeeComponent } from '../dashboardclassfee/dashboardclassfee.component';
import { FeeDefinitionComponent } from '../feedefinition/feedefinition.component';
import { SchoolFeeTypesComponent } from '../school-fee-types/school-fee-types.component';
import { ClassEvaluationComponent } from '../../evaluation/classevaluation/classevaluation.component';

@Component({
  selector: 'app-classboard',
  templateUrl: './classboard.component.html',
  styleUrls: ['./classboard.component.scss']
})
export class ClassboardComponent implements AfterViewInit {
  components = [
    ClassdetailComponent,
    FeeDefinitionComponent,    
    DashboardclassfeeComponent,
    SchoolFeeTypesComponent,
    ClassmasterdashboardComponent,
    ClassEvaluationComponent,
    ClassprerequisiteComponent
  ];

  tabNames = [
    { "label": "Class Detail", "faIcon": '' },
    { "label": "Fee", "faIcon": '' },
    { "label": "Pre-requisite", "faIcon": '' },
    { "label": "Class Master", "faIcon": '' },
    { "label": "Fee Type", "faIcon": '' },
    { "label": "Fee Type", "faIcon": '' },
    { "label": "Fee Type", "faIcon": '' }
  ];

  Permissions =
    {
      ParentPermission: '',
      ClassDetailPermission: '',
      FeePermission: '',
      PreRequisitePermission: '',
      ClassMasterPermission: '',
      FeeTypePermission: '',
      FeeDefinition: '',
      StudentEvaluation: ''
    };

  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private contentservice:ContentService,
    private tokenStorage: TokenStorageService,
    private componentFactoryResolver: ComponentFactoryResolver) {
  }

  public ngAfterViewInit(): void {
    this.contentservice.GetApplicationRoleUser(this.tokenStorage.getUserDetail());
    debugger;
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.CLASSCOURSE)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;
      //this.tabNames
    }
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.CLASSDETAIL)
    var comindx = this.components.indexOf(ClassdetailComponent);
    this.GetComponents(perObj, comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.CLASSEVALUATION)
    var comindx = this.components.indexOf(ClassEvaluationComponent);
    this.GetComponents(perObj, comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.CLASSFEE)
    var comindx = this.components.indexOf(DashboardclassfeeComponent);
    this.GetComponents(perObj, comindx)
    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.PREREQUISITE)
    var comindx = this.components.indexOf(ClassprerequisiteComponent);
    this.GetComponents(perObj, comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.CLASSMASTER)
    var comindx = this.components.indexOf(ClassmasterdashboardComponent);
    this.GetComponents(perObj, comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.FEETYPE)
    var comindx = this.components.indexOf(SchoolFeeTypesComponent);
    this.GetComponents(perObj, comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.FEEDEFINITION)
    var comindx = this.components.indexOf(FeeDefinitionComponent);
    this.GetComponents(perObj, comindx)
  
    if (this.Permissions.ParentPermission != 'deny') {
      this.renderComponent(0);
      this.cdr.detectChanges();
    }
  }
  GetComponents(perObj, comindx) {
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
  }
  public tabChange(index: number) {
    //    //console.log("index", index)
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
