import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NaomitsuService } from './databaseService';
import { List } from './interface';
// import { Observable, Subject } from 'rxjs';
// import { IPage } from './interface';

@Injectable({
  providedIn: 'root'
})
export class SharedataService {
  public data$: BehaviorSubject<any> = new BehaviorSubject(null);
  items = [];
  constructor(private http: HttpClient,
    private dataservice: NaomitsuService) {
      //this.GetMenuData();
  }
  ngOnInit() {

  }

  addData(item) {

    this.items = [...item];
  }

  clearData() {
    this.items = [];
    return this.items;
  }

  getData() {
    return this.items;
  }
  GetMenuData() {
    debugger;
    let containAdmin = window.location.href.toLowerCase().indexOf('admin');
    let strFilter = '';
console.log('inside service')
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
          this.data$ = arrPageMenu["value"];
        }
      });
  }
}
