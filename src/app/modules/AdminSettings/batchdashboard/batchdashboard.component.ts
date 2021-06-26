import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
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
  StandardFilter = '';
  loading = false;
  SelectedBatchId = 0;
  Batches = [];
  BatchList: IBatches[] = [];
  dataSource: MatTableDataSource<IBatches>;
  allMasterData = [];
  // searchForm = this.fb.group({
  //   searchBatchId: [0],
  //   searchSubjectId: [0],
  //   //searchSubjectTypeId: [0],
  //   searchClassId: [0],
  // });
  //ClassSubjectId = 0;
  BatchData = {
    BatchId: 0,
    BatchName: '',
    OrgId: 0,
    CurrentBatch: 0,
    Active: 1
  };
  displayedColumns = [
    'BatchName',
    'CurrentBatch',
    'Active',
    'Action'
  ];

  constructor(
    private fb: FormBuilder,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private nav: Router,
    private shareddata: SharedataService,
  ) { }

  ngOnInit(): void {


  }
  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);

      this.GetBatches();
    }
  }


  GetBatches() {
    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    if (filterStr.length == 0) {
      this.alert.error("Please enter search criteria.", this.optionAutoClose);
      return;
    }

    let list: List = new List();
    list.fields = [
      'BatchId',
      'BatchName',
      'CurrentBatch',
      'OrgId',
      'Active'
    ];

    list.PageName = "Batches";
    list.filter = [filterStr];
    this.BatchList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        this.BatchList = [...data.value];
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
      OrgId: +this.LoginUserDetail[0]["orgId"],
      Active: 1
    }
    this.BatchList.push(newdata);
    this.dataSource = new MatTableDataSource<IBatches>(this.BatchList);
  }
  updateActive(row, value) {

    row.Active = value.checked ? 1 : 0;
    row.Action = true;
    // let toupdate = {
    //   //ApplicationId:element.ApplicationId,      
    //   Active: element.Active == 1 ? 0 : 1
    // }
    // this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'patch')
    //   .subscribe(
    //     (data: any) => {
    //       // this.GetApplicationRoles();
    //       this.alert.success("Data updated successfully.", this.optionAutoClose);

    //     });
  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {
          // this.GetApplicationRoles();
          this.alert.success("Data deleted successfully.", this.optionAutoClose);

        });
  }
  UpdateOrSave(row) {

    debugger;
    if (row.CurrentBatch == 1 && row.Active == 0) {
      this.alert.error("Current batch should be active!", this.optionAutoClose);
      return;
    }
    if (row.CurrentBatch == 1) {
      var existingActive = this.BatchList.filter(b => b.CurrentBatch == 1 && b.BatchId != row.BatchId);
      if (existingActive.length > 0) {
        this.alert.error("There is already another current batch!", this.optionAutoClose);
        return;
      }
    }
    var StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
    let checkFilterString = "BatchName eq '" + row.BatchName + "'" + StandardFilter;

    if (row.BatchId > 0)
      checkFilterString += " and BatchId ne " + row.BatchId;

    let list: List = new List();
    list.fields = ["BatchId"];
    list.PageName = "Batches";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
          row.Ative = 0;
          return;
        }
        else {

          this.BatchData.Active = row.Active;
          this.BatchData.BatchId = row.BatchId;
          this.BatchData.BatchName = row.BatchName;
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
            this.update();
          }
        }
      });
  }

  insert(row) {

    debugger;
    this.dataservice.postPatch('Batches', this.BatchData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.BatchId = data.BatchId;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update() {

    this.dataservice.postPatch('Batches', this.BatchData, this.BatchData.BatchId, 'patch')
      .subscribe(
        (data: any) => {
          this.alert.success("Data updated successfully.", this.optionAutoClose);
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
  CurrentBatch: number;
  OrgId: number;
  Active;
}


