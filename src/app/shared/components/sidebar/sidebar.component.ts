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
  sideMenu = [];
  collapse = false;
  ApplicationId = 0;
  constructor(
    private dataservice: NaomitsuService,
    private shareddata: SharedataService,
    private tokenStorage: TokenStorageService,
    private route: Router) { }

  ngOnInit(): void {
    // this.ar.params.subscribe(param=>{
    //   this.ApplicationId = param["id"];
    // })
    this.ApplicationId = +this.tokenStorage.getSelectedAPPId();
    if (this.ApplicationId == 0)
      this.route.navigate(['/dashboard']);
    this.GetMenuData();
  }
  open() {

  }
  toggleSidebar() {
    this.collapse = !this.collapse;
  }
  GetMenuData() {
    //debugger;
    let containAdmin = window.location.href.toLowerCase().indexOf('admin');
    let strFilter = '';
    strFilter = "ParentId eq 0 and Active eq 1 and ApplicationId eq " + this.ApplicationId;

    let list: List = new List();
    list.fields = [
      "PageId"
      , "label"
      , "faIcon"
      , "link"
      , "ParentId"
      , "HasSubmenu"
      , "UpdateDate"
    ];
    
    list.PageName = "Pages";
    list.orderBy = "DisplayOrder";
    list.filter = [strFilter];
    
    this.dataservice.get(list).subscribe((data: any) => {
      this.sideMenu = [...data.value];
      let NewsNEvents = this.sideMenu.filter(item => {
        return item.Label.toUpperCase() == 'NEWS N EVENTS'
      })
      if (NewsNEvents.length > 0) {
        this.shareddata.ChangeNewsNEventId(NewsNEvents[0].PageId);
      }
      
      var appName =location.pathname.split('/')[1];
      if(appName.length>0)
      {
        
      
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


