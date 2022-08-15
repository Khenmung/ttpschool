import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MediaObserver } from '@angular/flex-layout'
import { NaomitsuService } from '../../databaseService';
import { SharedataService } from '../../sharedata.service';
import { List } from '../../interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    PageLoading = true;
  mediaSub: Subscription;
  deviceXs: boolean;
  mode = 'side';
  contentcls: string;
  sidebarcls: string;
  openSideBar = true;
  //MenuData = [];
  NewsNEventPageId = 0;
  //////////////////////////
  SelectedBatchId = 0;
  loginUserDetail = [];
  sideMenu = [];
  collapse = false;
  SelectedApplicationId = 0;
  MenuData = [];
  /////////////////////////

  constructor(private mediaObserver: MediaObserver,
    private tokenStorage: TokenStorageService,
    private dataservice: NaomitsuService,
    private shareddata: SharedataService
  ) { }

  ngOnInit(): void {
    this.mediaSub = this.mediaObserver.asObservable().subscribe((result) => {
      ////console.log('result',result);
      this.deviceXs = result[0].mqAlias === "xs" ? true : false;
      if (this.deviceXs) {
        this.openSideBar = false;
        this.mode = "over";
        this.contentcls = 'DeviceXs';
        //this.sidebarcls = 'sidebartop110width100'
      }
      else {
        if (!this.openSideBar)
          this.openSideBar = true;
        this.mode = "side";
        this.contentcls = "NotDeviceXs";
        //this.sidebarcls = "sidebartop65width100";
      }
      ////////////////
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
      this.loginUserDetail = this.tokenStorage.getUserDetail();
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
      this.shareddata.CurrentPagesData.subscribe((data: any) => {
        this.MenuData = [...data];
        /////////////////////
      })
      debugger;
      if (this.MenuData.length == 0 && this.loginUserDetail!=null)
        this.GetMenuData();
    })
    //this.GetMenuData();

  }
  ngOnDestroy() {
    this.mediaSub.unsubscribe();
  }
  busy(event){
    
    event.stopPropagation()
  }
  toggleSidebar() {
    this.collapse = !this.collapse;
  }
  DownFromMenu(value) {
    ////console.log('from menu',value);
    if (this.deviceXs)
      this.openSideBar = !this.openSideBar;
  }
  sideBarToggler() {
    //debugger;
    this.openSideBar = !this.openSideBar;
    ////console.log('this.deviceXs in toggle',this.deviceXs)
    if (!this.openSideBar && this.deviceXs)
      this.contentcls = "DeviceXs";
    else if (this.openSideBar && this.deviceXs)
      this.contentcls = 'OpenAndDeviceXs';
    else
      this.contentcls = "NotDeviceXs";
    //this.ref.detectChanges();

  }
  GetMenuData() {
    debugger;
    //let containAdmin = window.location.href.toLowerCase().indexOf('admin');
    let strFilter = '';
    strFilter = "PlanId eq " + this.loginUserDetail[0]["planId"] + " and Active eq 1 and ApplicationId eq " + this.SelectedApplicationId;

    let list: List = new List();
    list.fields = [
      "PlanFeatureId",
      "PlanId",
      "PageId",
      "ApplicationId"
    ];

    list.PageName = "PlanFeatures";
    list.lookupFields = ["Page($select=PageId,PageTitle,label,faIcon,link,ParentId,HasSubmenu,UpdateDate,DisplayOrder)"];
    //list.orderBy = "DisplayOrder";
    list.filter = [strFilter];
    var permission;
    this.dataservice.get(list).subscribe((data: any) => {
      this.sideMenu = [];
      data.value.forEach(m => {
        permission = this.loginUserDetail[0]["applicationRolePermission"].filter(r => r.applicationFeature.toLowerCase().trim() == m.Page.PageTitle.toLowerCase().trim() && m.Page.ParentId == 0)
        if (permission.length > 0 && permission[0].permission != 'deny') {
          m.PageId = m.Page.PageId;
          m.PageTitle = m.Page.PageTitle;
          m.label = m.Page.label;
          m.faIcon = m.Page.faIcon;
          m.link = m.Page.link;
          m.ParentId = m.Page.ParentId;
          m.HasSubmenu = m.Page.HasSubmenu;
          m.DisplayOrder = m.Page.DisplayOrder;
          this.sideMenu.push(m);
        }
      })
      this.sideMenu = this.sideMenu.sort((a, b) => a.DisplayOrder - b.DisplayOrder);

      let NewsNEvents = this.sideMenu.filter(item => {
        return item.label.toUpperCase() == 'NEWS N EVENTS'
      })
      if (NewsNEvents.length > 0) {
        this.shareddata.ChangeNewsNEventId(NewsNEvents[0].PageId);
      }

      var appName = location.pathname.split('/')[1];
      if (appName.length > 0) {
        this.shareddata.ChangePageData(this.sideMenu);
      }
    });


  }

}
export class MenuItem {
  constructor(
    public label: string,
    public link: string,
    public toolTip: string,
    public faIcon: string = ''
  ) { }
}

export const menuList = [
  new MenuItem('Chemistry', 'employee', 'Chemistry class material', 'science'),
  new MenuItem('Biology', 'Biology', 'Biology class material', 'biotech'),
  new MenuItem('Math', 'Math', 'Math class material', 'calculate'),
  new MenuItem('Physics', 'Physics', 'Physics class material', 'flash_on'),
];

