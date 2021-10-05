import { Component, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventEmitter } from 'events';
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
  sideMenu=[];
  collapse=false;
  ApplicationId=0;
  constructor(private dataservice:NaomitsuService,
    private shareddata:SharedataService,
    private ar:ActivatedRoute) { }

  ngOnInit(): void {
    this.ar.params.subscribe(param=>{
      this.ApplicationId = param["id"];
    })

    this.GetMenuData();
  }
  open(){
    
  }
  toggleSidebar(){
    this.collapse =!this.collapse;
  }
  GetMenuData() {
    debugger;
    let containAdmin = window.location.href.toLowerCase().indexOf('admin');
    let strFilter = '';
    strFilter = "Active eq 1 and ApplicationId eq " + this.ApplicationId;
    // if (containAdmin > -1)
    //   strFilter = "Active eq 1 and ApplicationId eq 2";
    // else
    //   strFilter = "Active eq 1 and ApplicationId eq 1"

    let list: List = new List();
    list.fields = [
      "PageId"
      , "label"
      , "faIcon"
      , "link"
      , "ParentId"
      , "HasSubmenu"
      ,"UpdateDate"
    ];
    //this.list.lookupFields = ["PageGroup", "PageHistories"];
    list.PageName = "Pages";
    list.orderBy = "DisplayOrder";
    list.filter = [strFilter];
    //const columns = ["PageId", "Page Title", "PageGroupName", "Active", "Action"];
    //if(!this.loggedIn)

    this.dataservice.get(list).subscribe((data: any) => {
      this.sideMenu = [...data.value];
      let NewsNEvents = this.sideMenu.filter(item => {
        return item.Label.toUpperCase() == 'NEWS N EVENTS'
      })
      if (NewsNEvents.length > 0) {
        this.shareddata.ChangeNewsNEventId(NewsNEvents[0].PageId);
      }
      //console.log('this.sideMenu',this.sideMenu)
      this.shareddata.ChangePageData(this.sideMenu);

    });


  }

}
export class MenuItem{
  constructor(
    public label:string,
    public link:string,
    public toolTip:string,
    public faIcon:string=''
  ){}
}

export const menuList=[
  new MenuItem('Chemistry','employee','Chemistry class material','science'),
  new MenuItem('Biology','Biology','Biology class material','biotech'),
  new MenuItem('Math','Math','Math class material','calculate'),
  new MenuItem('Physics','Physics','Physics class material','flash_on'),
];


