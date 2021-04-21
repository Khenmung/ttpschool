import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import {
  MultilevelNodes, Configuration, ExpandedRTL,
  ExpandedLTR, MultilevelMenuService, ExpandCollapseStatusEnum, SlideInOut
} from 'ng-material-multilevel-menu';
import { List, PagesForMenu } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { NaomitsuService } from '../../shared/databaseService';
@Component({
  selector: 'app-MultiLevelMenu',
  templateUrl: './MultiLevelMenu.component.html',
  styleUrls: ['./MultiLevelMenu.component.scss'],
  animations: [
    SlideInOut,
    ExpandedLTR,
    ExpandedRTL,
  ]
})

export class MultiLevelMenuComponent implements OnInit {
  @Output() openLeftMenu = new EventEmitter();
  module = {
    admin: "admin",
    general: ""
  }
  loading = false;
  selectedIndex: number;
  loggedIn: boolean;
  expandCollapseStatus = 'expand';
  appitem = [];
  config: any;
  token: string = '';
  menuWithID: MultilevelNodes[] = null
  constructor(
    private multilevelMenuService: MultilevelMenuService,
    private shareddata: SharedataService,
    private navigate: Router,
    //private route: ActivatedRoute,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService
  ) {
    this.loggedIn = tokenStorage.getToken() == null ? false : true;
  }
  menuIsReady(menus: MultilevelNodes[]) {
    this.menuWithID = menus;
  }
  getClass(item) {
    return item.faIcon;//]: true

  }
  selectMenuID(MenuID) {
    console.log('menuid', MenuID);
    this.multilevelMenuService.selectMenuByID(MenuID);
  }
  setExpandCollapseStatus(type: ExpandCollapseStatusEnum) {
    this.multilevelMenuService.setMenuExapandCollpaseStatus(type);
  }

  selectedItem(menu: any) {
    debugger;
    console.log('menu', menu);
    this.openLeftMenu.emit('1');
    this.navigate.navigate([menu.link]);
  }
  selectedLabel(event) {
    console.log('selectedLabel', event);
  }
  ngOnInit(): void {
    this.loading == true;
    this.config = {
      //customTemplate: true,
      paddingAtStart: true,
      interfaceWithRoute: false,
      //classname: 'my-custom-class',
      //listBackgroundColor: `rgb(208, 241, 239)`,
      fontColor: `#fafafa`,

      //backgroundColor: '#',//`rgb(208, 241, 239)`,
      selectedListFontColor: `orange`,//`rgb(197, 101, 76)`,
      selectedListFontStyle: 'bold',
      highlightOnSelect: true,
      collapseOnSelect: true,
      useDividers: false,
      rtlLayout: false,
      customTemplate: false
    };
    this.GetMenuData();

    //console.log('url',this.navigate.url);
  }
  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    this.loading = false;
  }
  setRow(_index: number) {
    this.selectedIndex = _index;
  }
  GetMenuData() {
    debugger;
    let containAdmin = window.location.href.toLowerCase().indexOf('admin');
    let strFilter = '';

    if (containAdmin > -1)
      strFilter = "Active eq 1 and Module eq 2";
    else
      strFilter = "Active eq 1 and Module eq 1"

    let list: List = new List();
    list.fields = [
      "PageId"
      , "label"
      , "faIcon"
      , "link"
      , "ParentId"
      , "HasSubmenu"
    ];
    //this.list.lookupFields = ["PageGroup", "PageHistories"];
    list.PageName = "Pages";
    list.orderBy = "DisplayOrder";
    list.filter = [strFilter];
    //const columns = ["PageId", "Page Title", "PageGroupName", "Active", "Action"];
    //if(!this.loggedIn)

    this.dataservice
      .get(list)
      .subscribe({
        next: (arrPageMenu) => {
          //console.log('menudata',arrPageMenu);
          //          this.shareddata.addData(arrPageMenu["value"]);
          //console.log('stored',this.shareddata.getData());
          let arr = [...arrPageMenu["value"]];
          // Object.keys(arrPageMenu).map(function (key) {
          //   arr.push({ [key]: arrPageMenu[key] })
          //   return arr;
          // });

          //let topmenu: PagesForMenu[] = [];
          let topmenu = [];
          arr.forEach((ele, key) => {
            ele.items = [];
            //ele.data = ele.LatestPublishedId;
            topmenu.push(ele);

          });

          //console.log('after copy',topmenu);  
          let adminId: any;
          let top = topmenu.filter(ele => {
            return ele.ParentId == 0
          })

          if (!this.loggedIn) {
            top = top.filter(item => item.label != "Admin");
          }
          top = top.filter(item => item.label.toUpperCase() != "NEWS N EVENTS");
          top.forEach(item => {

            if (item.HasSubmenu == true) {
              let subelement = topmenu.filter((inner, index) => {
                return inner.ParentId == item.PageId
              })
              subelement.forEach(filtered => {
                item.items.push(filtered)
              })
              item.items.sort((prev, current) => current.DisplayOrder - prev.DisplayOrder)
            }
          });
          //console.log('top',top);
          this.appitem = [];
          let final: IMenu[] = [];
          this.appitem = top.map<IMenu>(element => {
            return {
              label: element.label.toUpperCase(),
              faIcon: 'fab fa-500px', //'/assets/images/25years.png',// reqIds.faIcon,
              link: element.link,
              items: element.items.map(inner => {
                return {
                  label: inner.label.toUpperCase(),
                  link: inner.link,//'/display/' + inner.data,//inner.link,
                  faIcon: "fab fa-accusoft",//inner.faIcon,
                  //activeIcon: 'favorite',
                  //items: []
                }
              })
            }
          });
          //this.appitem =final;


          // ((reqIds) => {
          //   return {
          //     label: reqIds.label.toUpperCase(),
          //     faIcon: 'fab fa-500px', //'/assets/images/25years.png',// reqIds.faIcon,
          //     link: reqIds.link,
          //     //data: reqIds.ParentId,
          //     // items: reqIds.items.map(inner => {
          //     //   return {
          //     //     label: inner.label.toUpperCase(),
          //     //     link: inner.link,//'/display/' + inner.data,//inner.link,
          //     //     faIcon: "fab fa-accusoft",//inner.faIcon,
          //     //     //activeIcon: 'favorite',
          //     //     //items: []
          //     //   }
          //     // })
          //   }
          //   //hidden:false;
          // });

          //this.appitems = [...final];
          //this.appitem =this.menudata();
          console.log('final', this.appitem);
          console.log('ori', this.menudata());
        }
      });
  }
  menudata() {
    let appitems = [
      {
        label: 'Item 1 (with Font awesome icon)',
        faIcon: 'fab fa-500px',
        id: 'klkasdfh',
        hasChilden: true,
        items: [
          {
            label: 'Item 1.1',
            link: '/item-1-1',
            faIcon: 'fab fa-accusoft',
            id: 'klkasdfha',
            hasChilden: false,
          },
          {
            label: 'Item 1.2',
            faIcon: 'fab fa-accessible-icon',
            items: [
              {
                label: 'Item 1.2.1',
                link: '/item-1-2-1',
                faIcon: 'fas fa-allergies'
              },
              {
                label: 'Item 1.2.2',
                faIcon: 'fas fa-ambulance',
                items: [
                  {
                    label: 'Item 1.2.2.1',
                    link: 'item-1-2-2-1',
                    faIcon: 'fas fa-anchor'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        label: 'Item 2',
        icon: 'alarm',
        items: [
          {
            label: 'Item 2.1',
            link: '/item-2-1',
            icon: 'favorite'
          },
          {
            label: 'Item 2.2',
            link: '/item-2-2',
            icon: 'favorite_border'
          }
        ]
      },
      {
        label: 'Item 3',
        link: '/item-3',
        icon: 'offline_pin'
      },
      {
        label: 'Item 4',
        link: '/item-4',
        icon: 'star_rate',
        hidden: true
      }
    ];
    return appitems;
  }
}
export interface IMenu {
  label: string,
  link: string,
  faIcon: string,
  items: []
}