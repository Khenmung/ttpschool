import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { CalendarComponent } from '../calendar/calendar.component';
import { EventComponent } from '../event/event.component';
import { HolidayComponent } from '../holiday/holiday.component';

@Component({
  selector: 'app-miscboard',
  templateUrl: './miscboard.component.html',
  styleUrls: ['./miscboard.component.scss']
})
export class MiscboardComponent implements AfterViewInit {

  components = [
    CalendarComponent,
    EventComponent,
    HolidayComponent
  ];

  tabNames = [
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
  ];
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
    private componentFactoryResolver: ComponentFactoryResolver
    ) {
  }

  public ngAfterViewInit(): void {
    debugger
    this.LoginUserDetail =  this.tokenStorage.getUserDetail();
    this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.misc.MISC)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;  
    }
    
    this.GenerateComponent(globalconstants.Pages.common.misc.CALENDAR)
    this.GenerateComponent(globalconstants.Pages.common.misc.HOLIDAY)
    this.GenerateComponent(globalconstants.Pages.common.misc.EVENT)

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
      case "calendar":
        comindx =this.components.indexOf(CalendarComponent);
        break;
      case "event":
        comindx =this.components.indexOf(EventComponent);
        break;     
      case "holiday":
        comindx =this.components.indexOf(HolidayComponent);
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

