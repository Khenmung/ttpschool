import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { EducationhistoryComponent } from '../educationhistory/educationhistory.component';
import { EmployeeComponent } from '../employee/employee.component';
import { EmployeeactivityComponent } from '../employeeactivity/employeeactivity.component';
import { EmployeedocumentsComponent } from '../employeedocuments/employeedocuments.component';
import { EmployeeskillComponent } from '../employeeskill/employeeskill.component';
import { FamilyComponent } from '../family/family.component';
import { GradehistoryComponent } from '../gradehistory/gradehistory.component';
import { WorkhistoryComponent } from '../workhistory/workhistory.component';

@Component({
  selector: 'app-employeeboard',
  templateUrl: './employeeboard.component.html',
  styleUrls: ['./employeeboard.component.scss']
})
export class EmployeeboardComponent implements AfterViewInit {
  components = [
    EmployeeComponent,
    EmployeedocumentsComponent,
    FamilyComponent,
    EducationhistoryComponent,
    WorkhistoryComponent,
    EmployeeskillComponent,
    GradehistoryComponent,
    EmployeeactivityComponent
  ];

  tabNames = [
    { "label": "Employee", "faIcon": '' },
    { "label": "Document", "faIcon": '' },
    { "label": "Family", "faIcon": '' },
    { "label": "Education History", "faIcon": '' },
    { "label": "Work History", "faIcon": '' },
    { "label": "Employee Skill", "faIcon": '' },
    { "label": "Employement History", "faIcon": '' },
    { "label": "Employement Activity", "faIcon": '' }
  ];
  EmployeeName='';
  Permissions =
    {
      ParentPermission: '',
      DataDownloadPermission: '',
      DataUploadPermission: ''
    };
    LoginUserDetail =[];
  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private contentservice: ContentService,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    private componentFactoryResolver: ComponentFactoryResolver) {
  }

  public ngAfterViewInit(): void {
    debugger
    this.shareddata.CurrentEmployeeName.subscribe(s => (this.EmployeeName = s));
    this.LoginUserDetail =  this.tokenStorage.getUserDetail();
    this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employee.EMPLOYEE)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;  
    }
    
    this.GenerateComponent(globalconstants.Pages.emp.employee.EMPLOYEEDETAIL)
    this.GenerateComponent(globalconstants.Pages.emp.employee.EDUCATIONHISTORY)
    this.GenerateComponent(globalconstants.Pages.emp.employee.FAMILY)
    this.GenerateComponent(globalconstants.Pages.emp.employee.WORKHISTORY)
    this.GenerateComponent(globalconstants.Pages.emp.employee.DOCUMENT)
    this.GenerateComponent(globalconstants.Pages.emp.employee.EMPLOYEESKILL)
    this.GenerateComponent(globalconstants.Pages.emp.employee.EMPLOYMENTHISTORY)
    this.GenerateComponent(globalconstants.Pages.emp.employee.EMPLOYEEACTIVITY)

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
  GenerateComponent(featureName){
    
    var perObj = globalconstants.getPermission(this.tokenStorage, featureName)
    var comindx =0;
    switch(featureName)
    {
      case "employee detail":
        comindx =this.components.indexOf(EmployeeComponent);
        break;
      case "employee document":
        comindx =this.components.indexOf(EmployeedocumentsComponent);
        break;
      case "family":
        comindx =this.components.indexOf(FamilyComponent);
        break;
      case "employee skill":
        comindx =this.components.indexOf(EmployeeskillComponent);
        break;
      case "education history":
        comindx =this.components.indexOf(EducationhistoryComponent);
        break;
      case "work history":
        comindx =this.components.indexOf(WorkhistoryComponent);
        break;
      case "employment history":
        comindx =this.components.indexOf(GradehistoryComponent);
        break;
      case "employment activity":
        comindx =this.components.indexOf(EmployeeactivityComponent);
        break;
    } 
    
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
}
