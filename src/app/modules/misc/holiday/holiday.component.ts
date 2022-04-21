import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-holiday',
  templateUrl: './holiday.component.html',
  styleUrls: ['./holiday.component.scss']
})
export class HolidayComponent implements OnInit {
  @ViewChild(MatPaginator) paging: MatPaginator;
  HolidayTypes =[];
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
  HolidayListName = 'Holidays';
  Applications = [];
  loading = false;
  SelectedBatchId = 0;
  HolidayList: IHoliday[] = [];
  filteredOptions: Observable<IHoliday[]>;
  dataSource: MatTableDataSource<IHoliday>;
  allMasterData = [];
  Holiday = [];
  Permission = 'deny';
  //EmployeeId = 0;
  HolidayData = {
    HolidayId: 0,
    Title: '',
    Description: '',
    StartDate: new Date(),
    EndDate: new Date(),
    HolidayTypeId: 0,
    OrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns = [
    "HolidayId",
    "Title",
    "Description",
    "StartDate",
    "EndDate",
    "HolidayTypeId",
    "Active",
    "Action"
  ];
  SelectedApplicationId=0;
  searchForm: FormGroup;
  constructor(
    private contentservice:ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,    
    private nav: Router,
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
    //this.EmployeeId = +this.tokenstorage.getEmployeeId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
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
      HolidayId: 0,
      Title: '',
      Description: '',
      StartDate: new Date(),
      EndDate: new Date(),
      HolidayTypeId: 0,
      OrgId: 0,
      BatchId: 0,
      Active:0,
      Action: false
    };
    this.HolidayList = [];
    this.HolidayList.push(newdata);
    this.dataSource = new MatTableDataSource<IHoliday>(this.HolidayList);
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

          this.contentservice.openSnackBar(globalconstants.DeletedMessage,globalconstants.ActionText,globalconstants.BlueBackground);

        });
  }
  UpdateOrSave(row) {

    //debugger;
    this.loading = true;
    let checkFilterString = "Title eq '" + row.Title + "' and OrgId eq " + this.LoginUserDetail[0]["orgId"];

    if (row.HolidayId > 0)
      checkFilterString += " and HolidayId ne " + row.HolidayId;
    let list: List = new List();
    list.fields = ["HolidayId"];
    list.PageName = this.HolidayListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.HolidayData.HolidayId = row.HolidayId;
          this.HolidayData.Active = row.Active;
          this.HolidayData.Title = row.Title;
          this.HolidayData.Description = row.Description;
          this.HolidayData.StartDate = row.StartDate;
          this.HolidayData.EndDate = row.EndDate;
          this.HolidayData.HolidayTypeId = row.HolidayTypeId;
          this.HolidayData.OrgId = this.LoginUserDetail[0]["orgId"];

          if (this.HolidayData.HolidayId == 0) {
            this.HolidayData["CreatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            this.HolidayData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.HolidayData["UpdatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            delete this.HolidayData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.HolidayData["CreatedDate"];
            delete this.HolidayData["CreatedBy"];
            this.HolidayData["UpdatedDate"] = new Date();
            this.HolidayData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
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
    this.dataservice.postPatch(this.HolidayListName, this.HolidayData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.HolidayId = data.HolidayId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.HolidayListName, this.HolidayData, this.HolidayData.HolidayId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetHoliday() {
    debugger;

    this.loading = true;
    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();
    list.fields = ["*"];

    list.PageName = this.HolidayListName;
    list.filter = [filterStr];
    this.HolidayList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.HolidayList = [...data.value];
        }
        this.dataSource = new MatTableDataSource<IHoliday>(this.HolidayList);
        this.dataSource.paginator = this.paging;
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"],this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.HolidayTypes = this.getDropDownData(globalconstants.MasterDefinitions.common.HOLIDAYLIST)
        this.GetHoliday();
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
export interface IHoliday {
  HolidayId: number;
  Title: string;
  Description: string;
  StartDate: Date;
  EndDate: Date;
  HolidayTypeId: number;
  OrgId: number;
  BatchId: number;
  Active: number;
  Action: boolean;
}


