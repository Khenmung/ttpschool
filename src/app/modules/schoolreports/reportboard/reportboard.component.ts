import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { ExamtimetableComponent } from '../examtimetable/examtimetable.component';
import { FeecollectionreportComponent } from '../feecollectionreport/feecollectionreport.component';
import { ChartReportComponent } from '../chartreport/chartreport.component';
import { ResultComponent } from '../result/result.component';
import { TodayCollectionComponent } from '../today-collection/today-collection.component';

@Component({
  selector: 'app-reportboard',
  templateUrl: './reportboard.component.html',
  styleUrls: ['./reportboard.component.scss']
})
export class ReportboardComponent implements AfterViewInit {

  components = [
    TodayCollectionComponent,
    FeecollectionreportComponent,
    ResultComponent,
    ExamtimetableComponent,
    ChartReportComponent
  ];

  tabNames = [
    { 'label': '1Exam Time Table', 'faIcon': '' },
    { 'label': '1Exam Result', 'faIcon': '' },
    { 'label': '1Fee Payment Status', 'faIcon': '' },
    { 'label': '1Date Wise Collection', 'faIcon': '' },
    { 'label': '1Date Wise Collection', 'faIcon': '' },
  ];

  Permissions =
    {
      ParentPermission: '',
      ExamTimeTablePermission: '',
      ExamResultPermission: '',
      FeeCollectionPermission: '',
      DatewisePermission: '',
      ChartPermission: ''
    };
    LoginUserDetail=[];
  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    private contentservice: ContentService,
    private componentFactoryResolver: ComponentFactoryResolver) {
  }

  public ngAfterViewInit(): void {
  
    this.LoginUserDetail =  this.tokenStorage.getUserDetail();
    this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);
    
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.REPORT)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;

    }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.EXAMTIMETABLE)
    var comindx = this.components.indexOf(ExamtimetableComponent);
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

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.RESULT)
    var comindx = this.components.indexOf(ResultComponent);
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


    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.FEEPAYMENTSTATUS)
    var comindx = this.components.indexOf(FeecollectionreportComponent);
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

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.CHARTREPORT)
    var comindx = this.components.indexOf(ChartReportComponent);
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

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.DATEWISECOLLECTION)
    var comindx = this.components.indexOf(TodayCollectionComponent);
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
    //console.log('this.Permissions.ParentPermission', this.Permissions.ParentPermission);
    if (this.Permissions.ParentPermission != 'deny') {
      this.renderComponent(0);
      this.cdr.detectChanges();
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
