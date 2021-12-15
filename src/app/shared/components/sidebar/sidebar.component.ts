import { Component, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { NaomitsuService } from '../../databaseService';
import { List } from '../../interface';
import { SharedataService } from '../../sharedata.service';
//import {} from './menu'
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  //@Output() openLeftMenu1:new EventEmitter();
  loginUserDetail = [];
  sideMenu = [];
  collapse = false;
  SelectedApplicationId = 0;
  constructor(
    private dataservice: NaomitsuService,
    private shareddata: SharedataService,
    private tokenStorage: TokenStorageService,
    private route: Router) { }

  ngOnInit(): void {
    // this.ar.params.subscribe(param=>{
    //   this.ApplicationId = param["id"];
    // })
    this.loginUserDetail = this.tokenStorage.getUserDetail();
    this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
    if (this.SelectedApplicationId == 0)
      this.route.navigate(['/dashboard']);
    else
      this.GetMenuData();
  }
  open() {

  }
  toggleSidebar() {
    this.collapse = !this.collapse;
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
      //this.sideMenu = [...data.value];
      data.value.forEach(m => {
        permission = this.loginUserDetail[0]["applicationRolePermission"].filter(r => r.applicationFeature.toLowerCase().trim() == m.Page.PageTitle.toLowerCase().trim() && m.Page.ParentId==0)
        if (permission.length > 0 && permission[0].permission !='deny') {
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
      this.sideMenu = this.sideMenu.sort((a,b)=>a.DisplayOrder - b.DisplayOrder);

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


