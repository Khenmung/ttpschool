import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { ExamtimetableComponent } from '../examtimetable/examtimetable.component';
import { FeecollectionreportComponent } from '../feecollectionreport/feecollectionreport.component';
import { ResultsComponent } from '../results/results.component';
import { TodayCollectionComponent } from '../today-collection/today-collection.component';

@Component({
  selector: 'app-reportboard',
  templateUrl: './reportboard.component.html',
  styleUrls: ['./reportboard.component.scss']
})
export class ReportboardComponent implements AfterViewInit {

  components = [
    ExamtimetableComponent,
    ResultsComponent,
    FeecollectionreportComponent,
    TodayCollectionComponent
  ];

  tabNames = [];

  Permissions =
    {
      ParentPermission: '',
      ExamTimeTablePermission: '',
      ExamResultPermission: '',
      FeeCollectionPermission: '',
      DatewisePermission: ''
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

    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.REPORT)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].Permission;

    }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.EXAMTIMETABLE)
    if (perObj.length > 0) {
      if (perObj[0].Permission == 'deny') {
        var comindx = this.components.indexOf(ExamtimetableComponent);
        this.components.splice(comindx, 1);
      }
      else
        this.tabNames.push({ 'label': perObj[0].label, 'faIcon': perObj[0].faIcon });
    }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.EXAMRESULT)
    if (perObj.length > 0) {
      if (perObj[0].Permission == 'deny') {
        var comindx = this.components.indexOf(ResultsComponent);
        this.components.splice(comindx, 1);
      }
      else
        this.tabNames.push({ 'label': perObj[0].label, 'faIcon': perObj[0].faIcon });
    }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.FEECOLLECTION)
    if (perObj.length > 0) {
      if (perObj[0].Permission == 'deny') {
        var comindx = this.components.indexOf(FeecollectionreportComponent);
        this.components.splice(comindx, 1);
      }
      else
        this.tabNames.push({ 'label': perObj[0].label, 'faIcon': perObj[0].faIcon });
    }
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.DATEWISECOLLECTION)
    if (perObj.length > 0) {
      if (perObj[0].Permission == 'deny') {
        var comindx = this.components.indexOf(TodayCollectionComponent);
        this.components.splice(comindx, 1);
      }
      else
        this.tabNames.push({ 'label': perObj[0].label, 'faIcon': perObj[0].faIcon });
    }

    this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);

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
