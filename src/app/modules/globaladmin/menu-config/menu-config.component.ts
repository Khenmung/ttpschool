import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { IPage, List } from '../../../shared/interface';
import { NaomitsuService } from '../../../shared/databaseService';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { AlertService } from '../../../shared/components/alert/alert.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { globalconstants } from 'src/app/shared/globalconstant';

@Component({
  selector: 'app-menu-config',
  templateUrl: './menu-config.component.html',
  styleUrls: ['./menu-config.component.scss']
})
export class MenuConfigComponent implements OnInit {

  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionsAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  loading = false;
  SelectedAppId = 0;
  oldvalue: any;
  TopMenu = [];
  AllData: any[] = [];
  ParentPages: [{ PageId, PageTitle }];
  PageList = [];
  PageDetail: IPage;
  dataSource: MatTableDataSource<IMenuConfig>;
  DATA: any[] = [];
  LoginUserDetail = [];
  columns: Array<any>;
  title: string;
  Id: number;
  query: string;//displayedColumns: Array<any>;
  list: List;
  MenuConfigData = {
    "PageId": 0,
    "PageTitle": 0,
    "ParentId": 0,
    "ApplicationId": 0,
    "label": 0,
    "link": "",
    "Active": 0,
    "OrgId": 0,
    "faIcon": "",
    "FullPath": "",
    "PhotoPath": "",
    "IsTemplate": 0,
    "DisplayOrder": 0,
    "HasSubmenu": 0,
    "HomePage": 0
  }
  DisplayColumns = [
    "PageId",
    "PageTitle",
    "label",
    "link",
    "faIcon",
    "IsTemplate",
    "DisplayOrder",
    "HasSubmenu",
    "HomePage",
    "Active",
    "Action"
  ];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  searchForm: FormGroup;
  //selection = new SelectionModel<IPage>(true, []);
  Applications = [];
  allMasterData = [];
  Permission = '';
  ngOnInit() {
    debugger;
    this.searchForm = this.fb.group({
      searchApplicationId: [0],
      searchTopMenuId: [0]
    })
    this.route.paramMap.subscribe(params => {
      this.Id = +params.get("parentid");
    })
    this.PageLoad();
    //this.GetParentPage(this.Id);
  }
  PageLoad() {
    this.checklogin();


  }
  constructor(private dataservice: NaomitsuService,
    private fb: FormBuilder,
    private navigate: Router,
    private route: ActivatedRoute,
    private tokenStorage: TokenStorageService,
    private alert: AlertService) {
  }

  checklogin() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    this.LoginUserDetail = this.tokenStorage.getUserDetail();

    if (this.LoginUserDetail == null) {
      this.alert.error("Access denied! login required.", options);
      this.navigate.navigate(['/auth/login']);
    }
    this.SelectedAppId = +this.tokenStorage.getSelectedAPPId();
    this.GetMasterData();
  }
  GetTopMenu() {
    let list: List = new List();
    list.fields = ["PageId,PageTitle,label,ApplicationId,ParentId,DisplayOrder"];
    list.PageName = "Pages";
    list.filter = ["Active eq 1 and ParentId eq 0 and ApplicationId eq " + this.searchForm.get("searchApplicationId").value];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.TopMenu = [...data.value].sort((a, b) => a.DisplayOrder - b.DisplayOrder);
      })

    //console.log("topmenu", this.TopMenu)
  }
  GetMasterData() {

    var orgIdSearchstr = 'and (ParentId eq 0  or OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ')';

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "Description", "ParentId", "Sequence", "ApplicationId"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.bang);

        this.loading = false;
      });
  }
  getDropDownData(dropdowntype) {
    let Id = 0;
    let Ids = this.allMasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();//globalconstants.GENDER
    })
    if (Ids.length > 0) {
      Id = Ids[0].MasterDataId;
      return this.allMasterData.filter((item, index) => {
        return item.ParentId == Id
      })
    }
    else
      return [];

  }
  getDetails(parentId) {

    this.list.fields = ["*"];
    this.list.PageName = "Pages";
    this.list.orderBy = "PageId desc";
    //const columns = ["PageId", "PageTitle", "ParentPage", "ParentId", "Active", "Action"];

    this.dataservice
      .get(this.list)
      .subscribe({
        next: (arrPage) => {
          debugger;
          ////console.log('arrpage', arrPage);
          let arr = [];
          Object.keys(arrPage).map(function (key) {
            arr.push({ [key]: arrPage[key] })
            return arr;
          });

          arr[1].value.forEach((ele, key) => {

            let pPage = this.ParentPages.filter(page => { return page.PageId === ele.ParentId });
            this.DATA.push({
              PageId: ele.PageId,
              PageTitle: ele.PageTitle,
              ParentId: ele.ParentId,
              label: ele.label,
              faIcon: ele.faIcon,
              link: ele.link,
              IsTemplate: ele.IsTemplate,
              DisplayOrder: ele.DisplayOrder,
              HasSubmenu: ele.HasSubmenu,
              ParentPage: pPage.length > 0 ? pPage[0].PageTitle : '',
              Active: ele.Active,
              UpdateDate: ele.UpdateDate,
              HomePage: ele.HomePage,
              Action: ""
            })
          });
          this.AllData = [...this.DATA];

        },
        error: console.error
      });

  }


  /**
   * Set the paginator and sort after the view init since this component will
   * be able to query its view for the initialized paginator and sort.
   */
  ngAfterViewInit() {
    // if (this.paginator != undefined) {
    //   this.dataSource.paginator = this.paginator;
    //   this.dataSource.sort = this.sort;
    // }
  }
  createpage() {
    this.navigate.navigate(['/home/editor']);
  }
  view(pageId, pageTitle, parentId) {

    this.navigate.navigate(['/home/page/' + pageId], { queryParams: { pgid: parentId, pid: pageId, ptitle: pageTitle } });
  }
  createNew() {
    this.navigate.navigate(['/home/pages/']);
  }
  applyFilter(filterValue: string) {
    ////console.log("this.AllData", this.AllData.length)
    if (filterValue.length > 2) {
      let filtered = this.AllData.filter(item => {
        let parentPage = false;
        let title = item.PageTitle.toUpperCase().includes(filterValue.toUpperCase())
        if (item.ParentPage.length > 0) {
          parentPage = item.ParentPage.toUpperCase().includes(filterValue.toUpperCase())
        }
        else
          parentPage = false;
        return (title || parentPage)

      });

      if (filtered.length > 0)
        this.DATA = [...filtered];
      else
        this.DATA = [];
    }
    else if (filterValue.length == 0) {
      this.DATA = [...this.AllData];
    }

    // else if (filterValue == "")
    //   this.DATA == this.AllData.filter((item, indx) => {
    //     return indx < 10;
    //   });
  }
  // isAllSelected() {
  //   const numSelected = this.selection.selected.length;
  //   const numRows = this.dataSource.data.length;
  //   return numSelected === numRows;
  // }
  getoldvalue(value: string) {
    this.oldvalue = value;
    //  //console.log('old value', this.oldvalue);
  }
  onBlur(row) {
    row.Action = true;
  }
  SaveAll() {

  }
  AddNew() {
    if (this.searchForm.get("searchApplicationId").value == 0) {
      this.loading = false;
      this.alert.error("Please select application.", this.optionsAutoClose);
      return;
    }
    var newdata = {
      PageId: 0,
      PageTitle: "",
      ParentId: 0,
      label: "",
      faIcon: "",
      link: "",
      IsTemplate: 0,
      DisplayOrder: 0,
      HasSubmenu: 0,
      ParentPage: '',
      ApplicationId: this.searchForm.get("searchApplicationId").value,
      Active: 0,
      UpdateDate: new Date(),
      HomePage: 0,
      Action: ""

    }
    this.PageList = [];
    this.PageList.push(newdata);
    this.dataSource = new MatTableDataSource<any>(this.PageList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loading = false;

  }
  UpdateOrSave(row) {
    debugger;

    let ErrorMessage = '';
    // if (this.AppUsersForm.get("ContactNo").value == 0) {
    //   ErrorMessage += "Please select contact.<br>";
    // }
    if (row.PageTitle.length == 0) {
      ErrorMessage += "Page Title is required.<br>";
    }
    if (row.label.length == 0) {
      ErrorMessage += "Label is required.<br>";
    }

    if (ErrorMessage.length > 0) {
      this.alert.error(ErrorMessage, this.optionsNoAutoClose);
      return;
    }
    var _ParentId = 0;
    if (this.searchForm.get("searchTopMenuId").value > 0) {
      _ParentId = this.searchForm.get("searchTopMenuId").value;
    }
    var duplicatecheck = "ApplicationId eq " + this.SelectedAppId + 
                         " and PageTitle eq '" + row.PageTitle + "' and OrgId eq " + this.LoginUserDetail[0]["orgId"]

    if (row.PageId > 0)
      duplicatecheck += " and PageId ne " + row.PageId;

    let list = new List();
    list.fields = ["*"];
    list.PageName = "Pages";
    list.filter = ["Active eq 1 and " + duplicatecheck]
    this.dataservice.get(list).subscribe((data: any) => {
      if (data.value.length > 0) {
        this.alert.error("Page already exists.", this.optionsAutoClose);
        return;
      }
      else {

        this.MenuConfigData.Active = row.Active;
        this.MenuConfigData.PageId = row.PageId;
        this.MenuConfigData.PageTitle = row.PageTitle;
        this.MenuConfigData.label = row.label;
        this.MenuConfigData.link = row.link;
        this.MenuConfigData.PhotoPath = row.PhotoPath;
        this.MenuConfigData.faIcon = row.faIcon;
        this.MenuConfigData.FullPath = row.FullPath;

        this.MenuConfigData.ApplicationId = row.ApplicationId;
        this.MenuConfigData.DisplayOrder = row.DisplayOrder;
        this.MenuConfigData.ParentId = _ParentId;
        this.MenuConfigData.IsTemplate = row.IsTemplate;
        this.MenuConfigData.HomePage = row.HomePage;
        this.MenuConfigData.HasSubmenu = row.HasSubmenu;

        this.MenuConfigData.OrgId = this.LoginUserDetail[0]["orgId"];
        if (this.MenuConfigData.PageId == 0) {
          this.MenuConfigData["CreatedDate"] = new Date();
          this.MenuConfigData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
          this.MenuConfigData["UpdatedDate"] = new Date();
          delete this.MenuConfigData["UpdatedBy"];
          this.insert(row);
        }
        else {
          delete this.MenuConfigData["CreatedDate"];
          delete this.MenuConfigData["CreatedBy"];
          this.MenuConfigData["UpdatedDate"] = new Date();
          this.MenuConfigData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
          this.update(row);
        }

      }
    })
  }
  tabChanged($event) {

  }
  insert(row) {

    //debugger;
    this.dataservice.postPatch('Pages', this.MenuConfigData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.PageId = data.PageId;
          row.Action = false;
          this.loading = false;
          this.alert.success("Data saved successfully", this.optionsAutoClose);

        });

  }
  update(row) {

    this.dataservice.postPatch('Pages', this.MenuConfigData, this.MenuConfigData.PageId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.Action = false;
          this.alert.success("Data updated successfully", this.optionsAutoClose);
        });
  }

  updateActive(element, event) {

    element.Action = true;
    element.Active = event.checked ? 1 : 0;
  }

  GetPages() {
    var filterStr = '';
    if (this.searchForm.get("searchApplicationId").value == 0) {
      this.alert.info("Please select application.", this.optionsAutoClose);
      return;
    }
    this.loading = true;
    filterStr = "ApplicationId eq " + this.searchForm.get("searchApplicationId").value
    var _ParentId = 0;
    if (this.searchForm.get("searchTopMenuId").value > 0)
      _ParentId = this.searchForm.get("searchTopMenuId").value

    filterStr += " and ParentId eq " + _ParentId;
    let list: List = new List();
    list.fields = ["*"];
    list.PageName = "Pages";
    list.filter = [filterStr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.PageList = data.value.map(f => {
          f.Action = false;
          return f;
        }).sort((a, b) => a.DisplayOrder - b.DisplayOrder);

        this.dataSource = new MatTableDataSource<any>(this.PageList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
        ////console.log('data',this.PageList)
      });

  }
}
export interface IMenuConfig {
  PageId: number;
  PageTitle: string;
  ParentId: number;
  ApplicationId: number;
  label: string;
  link: string;
  Active: number;
  OrgId: number;
  faIcon: string;
  FullPath: string;
  PhotoPath: string;
  IsTemplate: number;
  DisplayOrder: number;
  HasSubmenu: number;
  HomePage: number;
}


