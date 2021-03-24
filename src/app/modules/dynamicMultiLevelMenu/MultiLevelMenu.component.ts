import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MultilevelNodes, Configuration, ExpandedRTL, ExpandedLTR, MultilevelMenuService, ExpandCollapseStatusEnum, SlideInOut } from 'ng-material-multilevel-menu';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List, PagesForMenu } from 'src/app/shared/interface';
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
  module={
    admin:"admin",
    general:""
  }
  loading=false;
  selectedIndex: number;
  loggedIn: boolean;
  expandCollapseStatus = 'expand';
  appitems = [];
  config: any;
  token: string = '';
  menuWithID: MultilevelNodes[] = null
  constructor(
    private multilevelMenuService: MultilevelMenuService,
    private navigate: Router,
    private route: ActivatedRoute,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService
  ) {
    this.loggedIn = tokenStorage.getToken() == null ? false : true;
    this.GetMenuData();
  }
  menuIsReady(menus: MultilevelNodes[]) {
    this.menuWithID = menus;
  }
  getClass(item) {
    return {
      [item.faIcon]: true
    }
  }
  selectMenuID(MenuID) {
    this.multilevelMenuService.selectMenuByID(MenuID);
  }
  setExpandCollapseStatus(type: ExpandCollapseStatusEnum) {
    this.multilevelMenuService.setMenuExapandCollpaseStatus(type);
  }

  selectedItem(menu: any) {
    console.log('menu', menu);
    //this.navigate.navigate(['/display', menu.data])
  }

  ngOnInit(): void {
    this.loading==true;
    this.config = {
      paddingAtStart: true,
      interfaceWithRoute: true,
      classname: 'my-custom-class',
      //listBackgroundColor: `rgb(208, 241, 239)`,
      fontColor: `white`,
    
      //backgroundColor: '#',//`rgb(208, 241, 239)`,
      selectedListFontColor: `orange`,//`rgb(197, 101, 76)`,
      
      highlightOnSelect: true,
      collapseOnSelect: true,
      useDividers: false,
      rtlLayout: false,
      customTemplate: true
    };
    //console.log('url',this.navigate.url);
  }
ngAfterViewInit(): void {
  //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
  //Add 'implements AfterViewInit' to the class.
  this.loading=false;
}
  setRow(_index: number) {
    this.selectedIndex = _index;
  }
  GetMenuData() {
    let list: List = new List();
    list.fields = [
      "PageId"
      , "LatestPublishedId"
      , "label"
      , "faIcon"
      , "link"
      , "ParentId"
      , "HasSubmenu"
    ];
    //this.list.lookupFields = ["PageGroup", "PageHistories"];
    list.PageName = "Pages";
    list.orderBy = "DisplayOrder";
    list.filter = ["Active eq 1 and Module eq 2"];
    //const columns = ["PageId", "Page Title", "PageGroupName", "Active", "Action"];
    //if(!this.loggedIn)

    this.dataservice
      .get<PagesForMenu[]>(list)
      .subscribe({
        next: (arrPageMenu: PagesForMenu[]) => {

          let arr = [];
          Object.keys(arrPageMenu).map(function (key) {
            arr.push({ [key]: arrPageMenu[key] })
            return arr;
          });
          let topmenu: PagesForMenu[] = [];
          arr[1].value.forEach((ele, key) => {
            ele.items = [];
            ele.data = ele.LatestPublishedId;
            topmenu.push(ele);

          });

          //console.log('after copy',topmenu);  
          let adminId: any;
          let top: PagesForMenu[] = topmenu.filter(ele => {
            return ele.ParentId == 0
          })

          if (!this.loggedIn) {
            top = top.filter(item => item.label != "Admin");
            //top.splice(adminId,1);
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
            else {
              item.items.push();
            }
          });
          //console.log('top',top);
          let final = top.map((reqIds) => {
            return {
              label: reqIds.label.toUpperCase(),
              faIcon: 'fab fa-500px',// reqIds.faIcon,
              link: reqIds.link,
              //data: reqIds.ParentId,
              items: reqIds.items.map(inner => {
                return {
                  label: inner.label.toUpperCase(),
                  link: inner.link,//'/display/' + inner.data,//inner.link,
                  faIcon: "fab fa-accusoft",//inner.faIcon,
                  activeIcon: 'favorite',
                  items: []
                }
              })
            }
            //hidden:false;
          });

          this.appitems = [...final];

          //         console.log('final', this.appitems);
        }
      });

    //   this.appitems =  [
    //   {
    //     label: 'Item 1 (with Font awesome icon)',
    //     faIcon: 'fab fa-500px',
    //     items: [
    //       {
    //         label: 'Item 1.1',
    //         link: '/item-1-1',
    //         faIcon: 'fab fa-accusoft'
    //       },
    //       {
    //         label: 'Item 1.2',
    //         faIcon: 'fab fa-accessible-icon',
    //         items: [
    //           {
    //             label: 'Item 1.2.1',
    //             link: '/item-1-2-1',
    //             faIcon: 'fas fa-allergies'
    //           },
    //           {
    //             label: 'Item 1.2.2',
    //             faIcon: 'fas fa-ambulance',
    //             items: [
    //               {
    //                 label: 'Item 1.2.2.1',
    //                 link: 'item-1-2-2-1',
    //                 faIcon: 'fas fa-anchor'
    //               }
    //             ]
    //           }
    //         ]
    //       }
    //     ]
    //   },
    //   {
    //     label: 'Item 2',
    //     icon: 'alarm',
    //     items: [
    //       {
    //         label: 'Item 2.1',
    //         link: '/item-2-1',
    //         icon: 'favorite'
    //       },
    //       {
    //         label: 'Item 2.2',
    //         link: '/item-2-2',
    //         icon: 'favorite_border'
    //       }
    //     ]
    //   },
    //   {
    //     label: 'Item 3',
    //     link: '/item-3',
    //     icon: 'offline_pin'
    //   },
    //   {
    //     label: 'Item 4',
    //     link: '/item-4',
    //     icon: 'star_rate',
    //     hidden: true
    //   }
    // ];
    // console.log("dd",this.appitems);
  }
  // GetMasterData() {
  //   let list: List = new List();
  //   list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
  //   list.PageName = "MasterDatas";
  //   list.filter = ["Active eq 1"];
    
  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       this.allMasterData = [...data.value];
  //       this.FeeNames = this.getDropDownData(globalconstants.FEENAMES);
    
  //     });

  // }
  // getDropDownData(dropdowntype) {
  //   let Id = this.allMasterData.filter((item, indx) => {
  //     return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
  //   })[0].MasterDataId;
  //   return this.allMasterData.filter((item, index) => {
  //     return item.ParentId == Id
  //   });
  // }
}