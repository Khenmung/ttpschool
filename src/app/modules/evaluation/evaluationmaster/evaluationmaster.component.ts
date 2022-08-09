import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-EvaluationMaster',
  templateUrl: './evaluationmaster.component.html',
  styleUrls: ['./evaluationmaster.component.scss']
})
export class EvaluationMasterComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paging: MatPaginator;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  EvaluationMasterListName = 'EvaluationMasters';
  Applications = [];
  ClassGroups = [];
  loading = false;
  SelectedBatchId = 0;
  EvaluationMasterList: IEvaluationMaster[] = [];
  filteredOptions: Observable<IEvaluationMaster[]>;
  dataSource: MatTableDataSource<IEvaluationMaster>;
  allMasterData = [];
  EvaluationMaster = [];
  Permission = 'deny';
  EvaluationMasterData = {
    EvaluationMasterId: 0,
    EvaluationName: '',
    Description: '',
    Duration: 0,
    ClassGroupId: 0,
    DisplayResult: false,
    AppendAnswer: false,
    ProvideCertificate: false,
    FullMark: 0,
    PassMark: 0,
    OrgId: 0,
    Active: 0
  };
  displayedColumns = [
    "EvaluationMasterId",
    "EvaluationName",
    "ClassGroupId",
    "Duration",
    "FullMark",
    "PassMark",
    "AppendAnswer",
    //"DisplayResult",
    //"ProvideCertificate",
    "Active",
    "Action"
  ];
  SelectedApplicationId = 0;
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private nav: Router,
    private datepipe: DatePipe,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchClassGroupId: [0]
    });
    this.PageLoad();
  }

  PageLoad() {

    debugger;
    this.loading = true;
    console.log("environment", globalconstants.apiUrl);
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    //this.EmployeeId = +this.tokenstorage.getEmployeeId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.EVALUATION.EVALUATIONTYPE);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {
        //this.nav.navigate(['/edu'])
      }
      else {

        this.GetMasterData();
        //this.GetEvaluationMaster();
      }
    }
  }

  AddNew() {

    var newdata = {
      EvaluationMasterId: 0,
      EvaluationName: '',
      Description: '',
      Duration: 0,
      ClassGroupId: 0,
      DisplayResult: false,
      ProvideCertificate: false,
      AppendAnswer: false,
      FullMark: 0,
      PassMark: 0,
      Active: false,
      Action: false
    };
    this.EvaluationMasterList = [];
    this.EvaluationMasterList.push(newdata);
    this.dataSource = new MatTableDataSource<IEvaluationMaster>(this.EvaluationMasterList);
    this.dataSource.paginator = this.paging;
  }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = value.checked; //? 1: 0;
  }
  updateDisplayResult(row, value) {
    row.Action = true;
    row.DisplayResult = value.checked;
  }
  updateProvideCertificate(row, value) {
    row.Action = true;
    row.ProvideCertificate = value.checked;
  }
  updateUpdatable(row, value) {
    debugger;
    row.Action = true;
    row.AppendAnswer = value.checked; //? 1: 0;
  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {

          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  UpdateOrSave(row) {

    debugger;
    this.loading = true;
    
    if (row.ClassGroupId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select class group.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    let checkFilterString = "EvaluationName eq '" + globalconstants.encodeSpecialChars(row.EvaluationName) + 
    " and ClassGroupId eq " + row.ClassGroupId +
    "' and OrgId eq " + this.LoginUserDetail[0]["orgId"];
    
    if (row.EvaluationMasterId > 0)
      checkFilterString += " and EvaluationMasterId ne " + row.EvaluationMasterId;
    let list: List = new List();
    list.fields = ["EvaluationMasterId"];
    list.PageName = this.EvaluationMasterListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.EvaluationMasterData.EvaluationMasterId = row.EvaluationMasterId;
          this.EvaluationMasterData.Active = row.Active;
          this.EvaluationMasterData.EvaluationName = globalconstants.encodeSpecialChars(row.EvaluationName);
          this.EvaluationMasterData.Description = globalconstants.encodeSpecialChars(row.Description);
          this.EvaluationMasterData.DisplayResult = row.DisplayResult;
          this.EvaluationMasterData.ProvideCertificate = row.ProvideCertificate;
          this.EvaluationMasterData.AppendAnswer = row.AppendAnswer;
          this.EvaluationMasterData.Duration = row.Duration == null ? 0 : row.Duration;
          this.EvaluationMasterData.ClassGroupId = row.ClassGroupId;
          this.EvaluationMasterData.FullMark = row.FullMark == null ? 0 : row.FullMark;
          this.EvaluationMasterData.PassMark = row.PassMark == null ? 0 : row.PassMark;
          this.EvaluationMasterData.OrgId = this.LoginUserDetail[0]["orgId"];

          if (this.EvaluationMasterData.EvaluationMasterId == 0) {
            this.EvaluationMasterData["CreatedDate"] = new Date();
            this.EvaluationMasterData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EvaluationMasterData["UpdatedDate"] = new Date();
            delete this.EvaluationMasterData["UpdatedBy"];
            console.log("this.EvaluationMasterData", this.EvaluationMasterData)
            this.insert(row);
          }
          else {
            delete this.EvaluationMasterData["CreatedDate"];
            delete this.EvaluationMasterData["CreatedBy"];
            this.EvaluationMasterData["UpdatedDate"] = new Date();
            this.EvaluationMasterData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            console.log("this.EvaluationMasterData update", this.EvaluationMasterData)
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.EvaluationMasterListName, this.EvaluationMasterData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EvaluationMasterId = data.EvaluationMasterId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.EvaluationMasterListName, this.EvaluationMasterData, this.EvaluationMasterData.EvaluationMasterId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  Delete(row) {

    this.openDialog(row)
  }
  openDialog(row) {
    debugger;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'Are you sure want to delete?',
        buttonText: {
          ok: 'Save',
          cancel: 'No'
        }
      }
    });

    dialogRef.afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.UpdateAsDeleted(row);
        }
      });
  }

  UpdateAsDeleted(row) {
    debugger;
    let toUpdate = {
      Active: false,
      Deleted: true,
      UpdatedDate: new Date()
    }

    this.dataservice.postPatch('EvaluationMasters', toUpdate, row.EvaluationMasterId, 'patch')
      .subscribe(res => {
        row.Action = false;
        this.loading = false; this.PageLoading = false;
        var idx = this.EvaluationMasterList.findIndex(x => x.EvaluationMasterId == row.EvaluationMasterId)
        this.EvaluationMasterList.splice(idx, 1);
        this.dataSource = new MatTableDataSource<any>(this.EvaluationMasterList);
        this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

      });
  }
  GetEvaluationMaster() {
    debugger;

    this.loading = true;
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    var _classGroupId = this.searchForm.get("searchClassGroupId").value;
    if (_classGroupId > 0)
      filterStr += ' and ClassGroupId eq ' + _classGroupId

    let list: List = new List();
    list.fields = [
      "EvaluationMasterId",
      "EvaluationName",
      "Description",
      "AppendAnswer",
      "Duration",
      "ClassGroupId",
      "FullMark",
      "PassMark",
      "DisplayResult",
      "ProvideCertificate",
      "Active"
    ];

    list.PageName = this.EvaluationMasterListName;
    list.filter = [filterStr];
    this.EvaluationMasterList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.EvaluationMasterList = data.value.map(d => {
            
            d.EvaluationName = globalconstants.encodeSpecialChars(d.EvaluationName);
            d.Description = globalconstants.encodeSpecialChars(d.Description);
            d.Action = false;
            return d;
          })
        }
        //console.log("this.EvaluationMasterList",this.EvaluationMasterList)
        this.dataSource = new MatTableDataSource<IEvaluationMaster>(this.EvaluationMasterList);
        this.dataSource.paginator = this.paging;
        this.loadingFalse();
      });

  }
  AlreadyUsedEvaluation = [];
  GetUsedEvaluationType(pEvaluationMasterId) {
    var filterStr = "EvaluationMasterId eq " + pEvaluationMasterId +
      " and Active eq 1 and OrgId eq " + this.LoginUserDetail[0]['orgId'];

    let list: List = new List();
    list.fields = [
      'EvaluationMasterId'
    ];
    list.PageName = "EvaluationExamMaps";
    list.lookupFields = ["StudentEvaluationResult($filter=EvaluationMasterId eq " + pEvaluationMasterId + ";$select=EvaluationExamMapId,ClassEvaluationId)"]
    list.filter = [filterStr];
    this.AlreadyUsedEvaluation = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.AlreadyUsedEvaluation = data.value.filter(f => f.StudentEvaluationResult.length > 0)
        }
      })
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];

        this.contentservice.GetClassGroups(this.LoginUserDetail[0]["orgId"])
          .subscribe((data: any) => {
            this.ClassGroups = [...data.value];
          });

        //this.GetEvaluationMaster();
        this.loading = false; this.PageLoading = false;
      });
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenstorage, this.allMasterData);
    // let Id = 0;
    // let Ids = this.allMasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();//globalconstants.GENDER
    // })
    // if (Ids.length > 0) {
    //   Id = Ids[0].MasterDataId;
    //   return this.allMasterData.filter((item, index) => {
    //     return item.ParentId == Id
    //   })
    // }
    // else
    //   return [];

  }
}
export interface IEvaluationMaster {
  EvaluationMasterId: number;
  EvaluationName: string;
  Description: string;
  Duration: number;
  ClassGroupId: number;
  DisplayResult: boolean;
  AppendAnswer: boolean;
  ProvideCertificate
  FullMark: number;
  PassMark: number;
  Active: boolean;
  Action: boolean;
}

