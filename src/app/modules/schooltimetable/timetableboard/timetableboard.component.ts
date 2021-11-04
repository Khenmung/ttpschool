import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { globalconstants } from 'src/app/shared/globalconstant';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { ClassperiodComponent } from '../classperiod/classperiod.component';
import { SchooltimetableComponent } from '../schooltimetable/schooltimetable.component';

@Component({
  selector: 'app-timetableboard',
  templateUrl: './timetableboard.component.html',
  styleUrls: ['./timetableboard.component.scss']
})
export class TimetableboardComponent implements AfterViewInit {

  components = [
    ClassperiodComponent,
    SchooltimetableComponent
  ];

  tabNames = [
    { label: 'Class Period', faIcon: '' },
    { label: 'Class time table', faIcon: '' },
  ];

  Permissions =
    {
      ParentPermission: '',
      ClassPeriodPermission: '',
      ClassTimeTablePermission: ''
    };
  selectedIndex = 0;

  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private tokenStorage: TokenStorageService,
    private componentFactoryResolver: ComponentFactoryResolver) {
  }

  public ngAfterViewInit(): void {

    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.TIMETABLE.TIMETABLE)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].Permission;

    }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.TIMETABLE.CLASSPERIOD)
    var comindx = this.components.indexOf(ClassperiodComponent);
    if (perObj.length > 0) {
      if (perObj[0].Permission == 'deny') {
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

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.TIMETABLE.CLASSTIMETABLE)
    var comindx = this.components.indexOf(SchooltimetableComponent);
    if (perObj.length > 0) {
      if (perObj[0].Permission == 'deny') {
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
    if (this.Permissions.ParentPermission != 'deny') {
      this.renderComponent(0);
      this.cdr.detectChanges();
    }

  }

  public tabChange(index: number) {
        console.log("index", index)
    setTimeout(() => {
      this.renderComponent(index);
    }, 800);

  }



  private renderComponent(index: number): any {
    const factory = this.componentFactoryResolver.resolveComponentFactory<any>(this.components[index]);
    this.viewContainer.createComponent(factory);
  }
}
