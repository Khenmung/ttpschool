import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
//import { MatSort } from '@angular/material/sort';
import { INews, IPage, List } from '../../shared/interface';
import { NaomitsuService } from '../../shared/databaseService';
import { SharedataService } from '../../shared/sharedata.service';
//import { SelectionModel } from '@angular/cdk/collections';
import { DomSanitizer } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-newsdashboard',
  templateUrl: './newsdashboard.component.html',
  styleUrls: ['./newsdashboard.component.scss']
})
export class NewsdashboardComponent implements OnInit {
  PageTitle: string = "News & Events";
  ParentPages: [{ PageId, PageTitle }];
  PageDetail: IPage;
  //SelectedData:PageDetail[] = [];
  DATA = [];
  AllData = [];
  //columns: Array<any>;
  title: string;
  Id: number = 0;
  query: string;//displayedColumns: Array<any>;
  list: List;

  displayedColumns = [];// ['id', 'name', 'progress', 'color'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  //@ViewChild(MatSort) sort: MatSort;

  //selection = new SelectionModel<IPage>(true, []);

  ngOnInit() {
    // this.route.paramMap.subscribe(params => {
    //   this.Id = +params.get("parentid");
    // })
    // if (this.Id == 0)
    //   this.getNewsNEventID()
    // else
    
    this.shareddata.CurrentNewsNEventId.subscribe(e => {
      this.Id = e
      //this.getDetails(this.Id);
      this.shareddata.CurrentPagesData.subscribe(m=>{
        this.DATA=m
        this.getDetails();
      })
    
    });
    
    // console.log('shared data', this.shareddata.getData());
  } 
  getDetails() {

    // this.list.fields = ["PageId", "PageTitle", "ParentId",
    //   "PageHistories/PageHistoryId", "PageHistories/PageBody",
    //   "PageHistories/Version", "UpdateDate", "Active"];
    // this.list.lookupFields = ["PageHistories"];
    // this.list.PageName = "Pages";
    // this.list.filter = ['IsTemplate eq 1' + (parentId == undefined ? '' : " and ParentId eq " + parentId)];
    // this.list.orderBy = "PageId desc";
    // this.list.limitTo = 20;
    // const columns = ["Title", "Body", "Date", "Action", "NewsId"];

    // this.naomitsuService
    //   .get<IPage[]>(this.list)
    //   .subscribe({
    //     next: (arrPage: IPage[]) => {
    //       let arr = [];
    //       Object.keys(arrPage).map(function (key) {
    //         arr.push({ [key]: arrPage[key] })
    //         return arr;
    //       });
    //       //console.log("data", arr[1]);
    //       debugger;
    //       this.DATA = arr[1].value.filter(item => { return item.PageHistories.length > 0 })
    //         .map(item => {
    //           return {
    //             NewsId: item.PageId,
    //             Title: item.PageTitle,
    //             Body: item.PageHistories[0].PageBody.replace(/<[^>]*>/g, ''),//this.sanitize.bypassSecurityTrustHtml(item.PageHistories[0].PageBody),
    //             Date: item.UpdateDate,
    //             PhId: item.PageHistories[0].PageHistoryId,
    //             Action: ""
    //           }
    //         })

          // this.columns = columns.map(column => {
          //   return {
          //     columnDef: column,
          //     header: column,
          //     cell: (element: any) => `${element[column] ? element[column] : ``}`
          //   };
          // });
          //let SelectedArr = [];
          //SelectedArr = this.DATA.filter(key => key.Active === 1)
          //this.AllData = [...this.DATA];
          this.AllData = this.DATA.filter(f=>{
            return f.ParentId==this.Id;
          }).sort((a,b)=> {
            return +new Date(b.UpdateDate) - +new Date(a.UpdateDate)
          })
          .map(item=>{
            return {
              Title:item.label,
              //:item.link.split('/')[3],
              Link:item.link,
              UpdateDate: item.UpdateDate
            }
          })
          this.displayedColumns = ["Title","UpdateDate"];//this.columns.map(c => c.columnDef);
          this.dataSource = new MatTableDataSource(this.AllData);
          this.dataSource.paginator = this.paginator;
          //this.dataSource.sort = this.sort;
          //this.selection = new SelectionModel<IPage>(true, SelectedArr);
          //   });
      //   },
      //   error: console.error
      // });

  }
  constructor(private naomitsuService: NaomitsuService,
    private navigate: Router,
    private route: ActivatedRoute,
    private shareddata: SharedataService,
    private sanitize: DomSanitizer,
    private datePipe: DatePipe) {
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
  HiddenBadge(newsdate): boolean {
    //return false;
    let today = new Date();
    let badgeDate = this.datePipe.transform(today, 'yyyy/MM/dd');//today.setDate(today.getDate()-2);
    let NewsDate = this.datePipe.transform(newsdate, 'yyyy/MM/dd');
    //console.log('newsdate',NewsDate)
    //console.log('badgeDate',badgeDate)
    //console.log(newsdate<badgeDate);
    return NewsDate < badgeDate ? true : false;
  }
  view(element) {
    //this.navigate.navigate(['/home/display/' + element.PhId + '/' + element.PageId], { queryParams: { GroupId: this.Id } });
    this.navigate.navigate([element.Link], { queryParams: { GroupId: this.Id } });
  }
  createNew() {
    this.navigate.navigate(['/home/pages/']);
  }
  applyFilter(filterValue: string) {
    debugger;
    if (filterValue.length > 2) {
      filterValue = filterValue.trim(); // Remove whitespace
      //filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
      this.DATA = this.AllData.filter(item => item.Body.toUpperCase().includes(filterValue.toUpperCase()) || item.Title.toUpperCase().includes(filterValue.toUpperCase()))
      this.dataSource = new MatTableDataSource(this.DATA);//.filter = filterValue;
    }
    else if (filterValue.length == 0) {
      this.dataSource = new MatTableDataSource(this.AllData);
    }
  }

}

