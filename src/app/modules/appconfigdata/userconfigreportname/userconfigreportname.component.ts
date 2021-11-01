import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-userconfigreportname',
  templateUrl: './userconfigreportname.component.html',
  styleUrls: ['./userconfigreportname.component.scss']
})
export class UserconfigreportnameComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  BaseReportId = 0;
  ParentId = 0;
  Permission = '';
  DisplayColumns = [
    "ReportName",
    //"DisplayName",
    //"Formula",
    //"TableNames",
    "Active",
    "Action"
  ];
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
  ColumnsOfAvailableReports = [];
  StandardFilterWithBatchId = '';
  loading = false;
  AvailableReportNames = [];
  AppReportNames = [];
  Applications = [];
  ReportNames = [];
  ReportConfigItemListName = "ReportConfigItems";
  ReportConfigItemList = [];
  dataSource: MatTableDataSource<IReportConfigItem>;
  allMasterData = [];
  PagePermission = '';
  ReportConfigItemData = {
    ReportConfigItemId: 0,
    ReportName: '',
    DisplayName: '',
    ParentId: 0,
    Formula: '',
    ColumnSequence: 0,
    ApplicationId: 0,
    TableNames: '',
    OrgId: 0,
    UserId: '',
    Active: 0
  };
  ApplicationName = '';
  searchForm: FormGroup;
  constructor(
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private nav: Router,
    private fb: FormBuilder
  ) {

  }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchApplicationId: [0],
      searchAvailableReportName: [0]
    });
    //this.dataSource = new MatTableDataSource<IReportConfigItem>([]);
    this.Applications = this.tokenstorage.getPermittedApplications();
  }

  PageLoad() {
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    this.ApplicationName = this.LoginUserDetail[0]["org"];

    this.GetBaseReportId();
  }
  updateActive(row, value) {
    debugger;
    row.Action = true;
    row.Active = value.checked ? 1 : 0;

  }

  addnew() {
    debugger;
    var appId = this.searchForm.get("searchApplicationId").value;
    if (appId == 0) {
      this.alert.error("Please select application", this.optionAutoClose);
      return;
    }

    var newdata = {
      ReportConfigItemId: 0,
      ReportName: '',
      DisplayName: '',
      ParentId: 0,
      Formula: '',
      ColumnSequence: 0,
      ApplicationId: appId,
      TableNames: '',
      OrgId: 0,
      UserId: '',
      Active: 0,
      Action: false
    }
    //console.log('DisplayColumns', this.DisplayColumns)
    //console.log('this.ReportConfigItemList', this.ReportConfigItemList)
    this.ReportConfigItemList.push(newdata);
    this.dataSource = new MatTableDataSource(this.ReportConfigItemList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  UpdateOrSave(row) {

    //debugger;
    var AvailableReportId = this.searchForm.get("searchAvailableReportName").value;
    var ApplicationId = this.searchForm.get("searchApplicationId").value;
    if (ApplicationId == 0) {
      this.alert.error("Please select application name", this.optionAutoClose);
      return;
    }
    if (AvailableReportId == 0) {
      this.alert.error("Please select available report name", this.optionAutoClose);
      return;
    }
    this.loading = true;
    let checkFilterString = "ReportName eq '" + row.ReportName + "'" +
      " and ApplicationId eq " + row.ApplicationId + " and OrgId eq " + this.LoginUserDetail[0]["orgId"] +
      " and ParentId eq " + AvailableReportId;
    
    if (row.ReportConfigItemId > 0)
      checkFilterString += " and ReportConfigItemId ne " + row.ReportConfigItemId;

    this.loading = true;
    let list: List = new List();
    list.fields = ["*"];
    list.PageName = this.ReportConfigItemListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {

          this.ReportConfigItemData.ReportConfigItemId = row.ReportConfigItemId;
          this.ReportConfigItemData.ApplicationId = row.ApplicationId;
          this.ReportConfigItemData.DisplayName = row.DisplayName;
          this.ReportConfigItemData.ColumnSequence = row.ColumnSequence;
          this.ReportConfigItemData.Formula = row.Formula;
          this.ReportConfigItemData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ReportConfigItemData.ParentId = AvailableReportId;
          this.ReportConfigItemData.UserId = row.UserId;
          this.ReportConfigItemData.Active = row.Active;
          this.ReportConfigItemData.ReportName = row.ReportName;
          this.ReportConfigItemData.TableNames = row.TableNames;

          //console.log('data', this.ReportConfigItemData);

          if (this.ReportConfigItemData.ReportConfigItemId == 0) {
            this.ReportConfigItemData["CreatedDate"] = new Date();
            this.ReportConfigItemData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ReportConfigItemData["UpdatedDate"] = new Date();
            delete this.ReportConfigItemData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.ReportConfigItemData["CreatedDate"];
            delete this.ReportConfigItemData["CreatedBy"];
            this.ReportConfigItemData["UpdatedDate"] = new Date();
            this.ReportConfigItemData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.ReportConfigItemListName, this.ReportConfigItemData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ReportConfigItemId = data.ReportConfigItemId;
          row.Action = false;
          this.loading = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.ReportConfigItemListName, this.ReportConfigItemData, this.ReportConfigItemData.ReportConfigItemId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }
  ReSequence(editedrow) {
    //debugger;
    var diff = 0;
    if (editedrow.Sequence != editedrow.OldSequence) {

      if (editedrow.Sequence > editedrow.OldSequence) {
        var filteredData = this.ReportConfigItemList.filter(currentrow => currentrow.MasterDataId != editedrow.MasterDataId
          && currentrow.Sequence > editedrow.OldSequence
          && currentrow.Sequence <= editedrow.Sequence)

        filteredData.forEach(currentrow => {

          currentrow.Sequence -= 1;
          currentrow.OldSequence -= 1;
          currentrow.Action = true;

        });
      }
      else if (editedrow.Sequence < editedrow.OldSequence) {
        var filteredData = this.ReportConfigItemList.filter(currentrow => currentrow.MasterDataId != editedrow.MasterDataId
          && currentrow.Sequence >= editedrow.Sequence
          && currentrow.Sequence < editedrow.OldSequence)

        filteredData.forEach(currentrow => {
          currentrow.Sequence += 1;
          currentrow.OldSequence += 1;
          currentrow.Action = true;
        })
      }
      editedrow.Action = true;
      editedrow.OldSequence = editedrow.Sequence;
      this.ReportConfigItemList.sort((a, b) => a.Sequence - b.Sequence);
      this.dataSource = new MatTableDataSource<IReportConfigItem>(this.ReportConfigItemList);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }
  get f() {
    return this.searchForm.controls;
  }
  GetReportConfigItem() {
    debugger;
    this.ReportConfigItemList = [];
    var filterstr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    
    var ApplicationId = this.searchForm.get("searchApplicationId").value;
    var AvailableReportId = this.searchForm.get("searchAvailableReportName").value;
    
    if (ApplicationId == 0) {
      this.alert.error("Please select application name", this.optionAutoClose);
      return;
    }
    if (AvailableReportId == 0) {
      this.alert.error("Please select available report name", this.optionAutoClose);
      return;
    }

    this.loading = true;
    filterstr += " and ApplicationId eq " + this.searchForm.get("searchApplicationId").value
    filterstr += " and ParentId eq " + AvailableReportId;

    let list: List = new List();
    list.fields = [
      "ReportConfigItemId",
      "ReportName",
      "DisplayName",
      "ParentId",
      "Formula",
      "ColumnSequence",
      "ApplicationId",
      "TableNames",
      "OrgId",
      "UserId",
      "Active"
    ];
    list.PageName = this.ReportConfigItemListName;
    //list.lookupFields = ["SchoolClassPeriod"]
    list.filter = [filterstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ReportConfigItemList = [];
          this.ReportConfigItemList = data.value.map(d => {
            d.Action = false;
            return d;
          });
    
        this.dataSource = new MatTableDataSource<IReportConfigItem>(this.ReportConfigItemList);
        this.loading = false;
      })
  }

  onBlur(element) {
    element.Action = true;
  }
  GetBaseReportId() {

    let list: List = new List();
    list.fields = [
      "ReportConfigItemId"
    ]
    list.PageName = this.ReportConfigItemListName;
    list.filter = ["Active eq 1 and ReportName eq 'Reports'"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.BaseReportId = data.value[0].ReportConfigItemId;
          this.GetReportNames();
        }
        else {
          this.alert.error("Base report Id not found!", this.optionAutoClose);
        }
        this.loading = false;
      });
  }
  GetReportNames() {

    let list: List = new List();
    list.fields = [
      "ReportConfigItemId",
      "ReportName",
      "DisplayName",
      "ParentId",
      "ApplicationId",
      "TableNames",
      "OrgId",
      "UserId",
      "Active"]
    list.PageName = this.ReportConfigItemListName;
    list.filter = ["Active eq 1 and ParentId eq " + this.BaseReportId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ReportNames = [...data.value];
        this.loading = false;
      });
  }
  GetAvailableReportNames() {
    this.ReportConfigItemList = [];
    this.AvailableReportNames = this.ReportNames.filter(a => a.ApplicationId == this.searchForm.get("searchApplicationId").value
      && a.ParentId == this.BaseReportId);
    this.dataSource = new MatTableDataSource(this.ReportConfigItemList);
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
export interface IReportConfigItem {
  ReportConfigItemId: number;
  ReportName: string;
  DisplayName: string;
  ParentId: number;
  Formula: string;
  ColumnSequence: number;
  ApplicationId: number;
  TableNames: string;
  OrgId: number;
  UserId: string;
  Active: number;
  CreatedBy: string;
  CreatedDate: Date;
  UpdatedBy: string;
  UpdatedDate: Date;

}






