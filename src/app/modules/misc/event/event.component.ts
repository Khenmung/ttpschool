import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-news-nevent',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss']
})
export class EventComponent implements OnInit {
@ViewChild(MatPaginator) paging:MatPaginator;

  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  EventsListName = 'Events';
  Applications = [];
  loading = false;
  SelectedBatchId = 0;
  EventsList: IEvent[] = [];
  filteredOptions: Observable<IEvent[]>;
  dataSource: MatTableDataSource<IEvent>;
  allMasterData = [];
  Events = [];
  Permission = 'deny';
  EmployeeId = 0;
  EventsData = {
    EventId: 0,
    EventName: '',
    Description: '',
    EventStartDate: new Date(),
    EventEndDate: new Date(),
    Venue: '',
    OrgId: 0,
    Active: 0,
    Broadcasted: 0
  };
  displayedColumns = [
    "EventId",
    "EventName",
    "Description",
    "EventStartDate",
    "EventEndDate",
    "Venue",
    "Active",
    "Action"
  ];
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
    private datepipe: DatePipe,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchClassName: [0]
    });
    this.PageLoad();
  }

  PageLoad() {

    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    this.EmployeeId = +this.tokenstorage.getEmployeeId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.common.misc.EVENT);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {

        //this.nav.navigate(['/edu'])
      }
      else {

        this.GetMasterData();
      }
    }
  }

  AddNew() {

    var newdata = {
      EventId: 0,
      EventName: '',
      Description: '',
      EventStartDate: new Date(),
      EventEndDate: new Date(),
      Venue: '',
      OrgId: 0,
      Active: 0,
      Broadcasted: 0,
      Action:false
    };
    this.EventsList = [];
    this.EventsList.push(newdata);
    this.dataSource = new MatTableDataSource<IEvent>(this.EventsList);
    this.dataSource.paginator = this.paging;
  }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = value.checked ? 1 : 0;
  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {

          this.alert.success("Data deleted successfully.", this.optionAutoClose);

        });
  }
  UpdateOrSave(row) {

    //debugger;
    this.loading = true;
    let checkFilterString = "EventName eq '" + row.EventName + "' and OrgId eq " + this.LoginUserDetail[0]["orgId"];

    if (row.EventId > 0)
      checkFilterString += " and EventId ne " + row.EventId;
    let list: List = new List();
    list.fields = ["EventId"];
    list.PageName = this.EventsListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {

          this.EventsData.EventId = row.EventId;
          this.EventsData.Active = row.Active;
          this.EventsData.EventName = row.EventName;
          this.EventsData.Description = row.Description;
          this.EventsData.EventStartDate = row.EventStartDate;
          this.EventsData.EventEndDate = row.EventEndDate;
          this.EventsData.Broadcasted = 0;
          this.EventsData.Venue = row.Venue;
          this.EventsData.OrgId = this.LoginUserDetail[0]["orgId"];

          if (this.EventsData.EventId == 0) {
            this.EventsData["CreatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            this.EventsData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EventsData["UpdatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            delete this.EventsData["UpdatedBy"];
            console.log('this.EventsData', this.EventsData)
            this.insert(row);
          }
          else {
            delete this.EventsData["CreatedDate"];
            delete this.EventsData["CreatedBy"];
            this.EventsData["UpdatedDate"] = new Date();
            this.EventsData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false;
  }
  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.EventsListName, this.EventsData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EventId = data.EventId;
          row.Action = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.EventsListName, this.EventsData, this.EventsData.EventId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
          this.loadingFalse();
        });
  }
  GetEvents() {
    debugger;

    this.loading = true;
    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();
    list.fields = ["*"];

    list.PageName = this.EventsListName;
    list.filter = [filterStr];
    this.EventsList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.EventsList = [...data.value];
        }
        this.dataSource = new MatTableDataSource<IEvent>(this.EventsList);
        this.dataSource.paginator = this.paging;
        this.loadingFalse();
      });

  }

  GetMasterData() {

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId", "Description"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 and (ParentId eq 0 or OrgId eq " + this.LoginUserDetail[0]["orgId"] + ")"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        //this.FamilyRelationship = this.getDropDownData(globalconstants.MasterDefinitions.employee.FAMILYRELATIONSHIP);
        this.Events = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEESKILL);
        this.GetEvents();
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
}
export interface IEvent {
  EventId: number;
  EventName: string;
  Description: string;
  EventStartDate: Date;
  EventEndDate: Date;
  Venue: string;
  OrgId: number;
  Active: number;
  Broadcasted: number;
  Action: boolean;
}
