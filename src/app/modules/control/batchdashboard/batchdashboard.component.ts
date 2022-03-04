import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-batchdashboard',
  templateUrl: './batchdashboard.component.html',
  styleUrls: ['./batchdashboard.component.scss']
})
export class BatchdashboardComponent implements OnInit {

  @ViewChild("table") mattable;
  //@ViewChild(ClasssubjectComponent) classSubjectAdd: ClasssubjectComponent;
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  Permission = '';
  StandardFilter = '';
  loading = false;
  SelectedBatchId = 0;
  Batches = [];
  BatchList: IBatches[] = [];
  dataSource: MatTableDataSource<IBatches>;
  allMasterData = [];
  BatchData = {
    BatchId: 0,
    BatchName: '',
    StartDate: Date,
    EndDate: Date,
    OrgId: 0,
    CurrentBatch: 0,
    Active: 1
  };
  displayedColumns = [
    'BatchId',
    'BatchName',
    'StartDate',
    'EndDate',
    'CurrentBatch',
    'Active',
    'Action'
  ];

  constructor(
    private fb: FormBuilder,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    
    private nav: Router,
    private contentservice: ContentService,
  ) { }

  ngOnInit(): void {
    this.PageLoad();
  }
  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.common.CONTROL.BATCHDASHBOARD)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);

        this.GetBatches();
      }
    }
  }

  onBlur(row) {
    row.Action = true;
  }
  GetBatches() {
    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    if (filterStr.length == 0) {
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }

    let list: List = new List();
    list.fields = [
      'BatchId',
      'BatchName',
      'StartDate',
      'EndDate',
      'CurrentBatch',
      'OrgId',
      'Active'
    ];

    list.PageName = "Batches";
    list.filter = [filterStr];
    this.BatchList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        this.BatchList = [...data.value.sort((a, b) => new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime())];
        this.dataSource = new MatTableDataSource<IBatches>(this.BatchList);
        this.loading = false;
      });
  }
  updateCurrentBatch(row, value) {
    row.CurrentBatch = value.checked ? 1 : 0;
    row.Action = true;
  }
  addnew() {
    var newdata = {
      BatchId: 0,
      BatchName: 'new batch name',
      CurrentBatch: 0,
      StartDate: new Date(),
      EndDate: new Date(),
      OrgId: +this.LoginUserDetail[0]["orgId"],
      Active: 1
    }
    this.BatchList.push(newdata);
    this.dataSource = new MatTableDataSource<IBatches>(this.BatchList);
  }
  updateActive(row, value) {

    row.Active = value.checked ? 1 : 0;
    row.Action = true;

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
    if (row.CurrentBatch == 1 && row.Active == 0) {
      this.contentservice.openSnackBar("Current batch should be active!", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    if (row.CurrentBatch == 1) {
      var existingActive = this.BatchList.filter(b => b.CurrentBatch == 1 && b.BatchId != row.BatchId);
      if (existingActive.length > 0) {
        this.contentservice.openSnackBar("There is already another current batch!", globalconstants.ActionText,globalconstants.RedBackground);
        return;
      }
    }
    this.loading = true;
    var StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
    let checkFilterString = "BatchName eq '" + row.BatchName + "' and " + StandardFilter;

    if (row.BatchId > 0)
      checkFilterString += " and BatchId ne " + row.BatchId;

    let list: List = new List();
    list.fields = ["BatchId"];
    list.PageName = "Batches";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.AddedMessage, globalconstants.RedBackground);
          row.Ative = 0;
          this.loading = false;
          return;
        }
        else {

          this.BatchData.Active = row.Active;
          this.BatchData.BatchId = row.BatchId;
          this.BatchData.BatchName = row.BatchName;
          this.BatchData.StartDate = row.StartDate;
          this.BatchData.EndDate = row.EndDate;
          this.BatchData.CurrentBatch = row.CurrentBatch;
          this.BatchData.OrgId = this.LoginUserDetail[0]["orgId"];
          if (this.BatchData.BatchId == 0) {
            this.BatchData["CreatedDate"] = new Date();
            this.BatchData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.BatchData["UpdatedDate"];
            delete this.BatchData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.BatchData["CreatedDate"];
            delete this.BatchData["CreatedBy"];
            this.BatchData["UpdatedDate"] = new Date();
            this.BatchData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('Batches', this.BatchData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.BatchId = data.BatchId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch('Batches', this.BatchData, this.BatchData.BatchId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
        });
  }
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

}
export interface IBatches {
  BatchId: number;
  BatchName: string;
  StartDate: Date;
  EndDate: Date;
  CurrentBatch: number;
  OrgId: number;
  Active;
}


