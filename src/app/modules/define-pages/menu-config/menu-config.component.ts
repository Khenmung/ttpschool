import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { IPage, List } from '../../../shared/interface';
import { NaomitsuService } from '../../../shared/databaseService';
import { SharedataService } from '../../../shared/sharedata.service';
import { SelectionModel } from '@angular/cdk/collections';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { AlertService } from '../../../shared/components/alert/alert.service';

@Component({
  selector: 'app-menu-config',
  templateUrl: './menu-config.component.html',
  styleUrls: ['./menu-config.component.scss']
})
export class MenuConfigComponent implements OnInit {
  oldvalue: any;
  AllData: any[] = [];
  ParentPages: [{ PageId, PageTitle }];
  PageDetail: IPage;
  //SelectedData:PageDetail[] = [];
  DATA: any[] = [];

  columns: Array<any>;
  title: string;
  Id: number;
  query: string;//displayedColumns: Array<any>;
  list: List;

  displayedColumns = [];// ['id', 'name', 'progress', 'color'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  selection = new SelectionModel<IPage>(true, []);

  ngOnInit() {
    this.checklogin();
    this.route.paramMap.subscribe(params => {
      this.Id = +params.get("parentid");
    })
    this.GetParentPage(this.Id);
  }
  checklogin() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    let token = this.tokenStorage.getToken();

    if (token == null) {
      this.alert.error("Access denied! login required.", options);
      this.navigate.navigate(['/home']);
    }
  }
  getDetails(parentId) {

    this.list.fields = ["*", "PageHistories/PageBody", "PageHistories/Version"];
    this.list.lookupFields = ["PageHistories"];
    this.list.PageName = "Pages";
    //this.list.filter = ['Module eq 1'];
    this.list.orderBy = "PageId desc";
    const columns = ["PageId", "PageTitle", "ParentPage", "ParentId", "Active", "Action"];

    this.naomitsuService
      .get(this.list)
      .subscribe({
        next: (arrPage) => {
          //console.log('arrpage', arrPage);
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
  constructor(private naomitsuService: NaomitsuService,
    private navigate: Router,
    private route: ActivatedRoute,
    private shareddata: SharedataService,
    private tokenStorage:TokenStorageService,
    private alert:AlertService) {
    this.list = new List();
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
    //console.log("this.AllData", this.AllData.length)
    if (filterValue.length > 2) {
      let filtered = this.AllData.filter(item => {
      let parentPage=false;
        let title= item.PageTitle.toUpperCase().includes(filterValue.toUpperCase())
        if(item.ParentPage.length>0)
        {
          parentPage= item.ParentPage.toUpperCase().includes(filterValue.toUpperCase())
        }
        else
           parentPage= false;
        return (title || parentPage)
        
      });

      if (filtered.length > 0)
        this.DATA = [...filtered];
      else
        this.DATA = [];
    }
    else if (filterValue.length==0) {
      this.DATA =[...this.AllData];
    }

    // else if (filterValue == "")
    //   this.DATA == this.AllData.filter((item, indx) => {
    //     return indx < 10;
    //   });
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  getoldvalue(value: string) {
    this.oldvalue = value;
    //  console.log('old value', this.oldvalue);
  }
  updateActive(columnName, element, event) {
    if (this.oldvalue == event)
      return;

    let PartialPage = {};
    //debugger;
    switch (columnName) {
      case "falcon":
        element.falcon = event;
        //PartialPage.push({ "falcon": event });
        break;
      case "link":
        element.link = event;
        //PartialPage.push({ "link": event });
        break;
      case "label":
        element.label = event;
        //PartialPage.push({ "label": event });
        break;
      case "DisplayOrder":
        element.DisplayOrder = +event;
        //PartialPage.push({ "DisplayOrder": event });
        break;
      case "HasSubmenu":
        element.HasSubmenu = +event;
        //PartialPage.push({ "HasSubmenu": event });
        break;
      case "IsTemplate":
        element.IsTemplate = +event;
        //PartialPage.push({ "IsTemplate": event });
        break;
      case "Active":
        element.Active = +event;
        //PartialPage.push({ "Active": event });
        break;
      case "PageTitle":
        element.PageTitle = event;
        //PartialPage.push({ "PageTitle": event });
        break;
      case "HomePage":
        element.HomePage = event;
        //PartialPage.push({ "PageTitle": event });
        break;
    }
    //let checked = this.selection.toggle(element);
    //console.log('event', event);
    element.DisplayOrder = element.DisplayOrder == null ? 0 : element.DisplayOrder;
    element.faIcon = element.faIcon == undefined ? "" : element.faIcon;
    element.UpdateDate = new Date();
    let Id = element.PageId;
    delete element.PageId;
    delete element.Action;
    delete element.ParentPage;
    //PartialPage.push(element.faIcon);
    //PartialPage.UpdateDate = new Date();
    //console.log('PageDetail', PartialPage);
    //PageDetail.Active = event.checked == true ? 1 : 0;
    //PageDetail.UpdateDate = new Date();
    PartialPage = element;
    this.naomitsuService.postPatch('Pages', PartialPage, Id, 'patch')
      .subscribe(
        (data: any) => {
          //alert('data updated.')
          this.getDetails(Id);
        })
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  GetParentPage(parentId) {
    let list: List = new List();
    list.fields = ["PageId", "PageTitle"];
    list.PageName = "Pages";
    if (parentId == undefined)
      list.filter = ["Active eq 1 and ParentId eq 0"];
    else
      list.filter = ["Active eq 1 and ParentId eq " + parentId];

    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        this.ParentPages = data.value;
        //console.log("parent pages", this.ParentPages);

        this.getDetails(parentId);
        //return data.value;

      });

  }
}

function flatten(data) {
  var result = {};
  function recurse(cur, prop) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      for (var i = 0, l = cur.length; i < l; i++)
        recurse(cur[i], prop + "[" + i + "]");
      if (l == 0)
        result[prop] = [];
    } else {
      var isEmpty = true;
      for (var p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop + "." + p : p);
      }
      if (isEmpty && prop)
        result[prop] = {};
    }
  }
  recurse(data, "");
  return result;
}

