import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { rightArithShift } from 'mathjs';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-EvaluationMaster',
  templateUrl: './evaluationmaster.component.html',
  styleUrls: ['./evaluationmaster.component.scss']
})
export class EvaluationMasterComponent implements OnInit {
  @ViewChild(MatPaginator) paging: MatPaginator;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  EvaluationMasterListName = 'EvaluationMasters';
  Applications = [];
  loading = false;
  SelectedBatchId = 0;
  EvaluationMasterList: IEvaluationMaster[] = [];
  filteredOptions: Observable<IEvaluationMaster[]>;
  dataSource: MatTableDataSource<IEvaluationMaster>;
  allMasterData = [];
  EvaluationMaster = [];
  Permission = 'deny';
  //EmployeeId = 0;
  EvaluationMasterData = {
    EvaluationMasterId: 0,
    EvaluationName: '',
    Description: '',
    Duration: '',
    DisplayResult: false,
    ProvideCertificate: false,
    FullMark: 0,
    PassMark: 0,
    OrgId:0,
    Active:0
  };
  displayedColumns = [
    "EvaluationMasterId",
    "EvaluationName",
    "Description",
    "Duration",
    "FullMark",
    "PassMark",
    "DisplayResult",
    "ProvideCertificate",    
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
        this.GetEvaluationMaster();
      }
    }
  }

  AddNew() {

    var newdata = {
      EvaluationMasterId: 0,
      EvaluationName: '',
      Description: '',
      Duration: '',
      DisplayResult: false,
      ProvideCertificate: false,
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

    //debugger;
    this.loading = true;
    let checkFilterString = "EvaluationName eq '" + row.EvaluationName + "' and OrgId eq " + this.LoginUserDetail[0]["orgId"];

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
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.AddedMessage, globalconstants.RedBackground);
        }
        else {

          this.EvaluationMasterData.EvaluationMasterId = row.EvaluationMasterId;
          this.EvaluationMasterData.Active = row.Active;
          this.EvaluationMasterData.EvaluationName = row.EvaluationName;
          this.EvaluationMasterData.Description = row.Description;
          this.EvaluationMasterData.DisplayResult = row.DisplayResult;
          this.EvaluationMasterData.Duration = row.Duration;
          this.EvaluationMasterData.FullMark = row.FullMark;
          this.EvaluationMasterData.PassMark = row.PassMark;
          this.EvaluationMasterData.OrgId = this.LoginUserDetail[0]["orgId"];

          if (this.EvaluationMasterData.EvaluationMasterId == 0) {
            this.EvaluationMasterData["CreatedDate"] = new Date();
            this.EvaluationMasterData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EvaluationMasterData["UpdatedDate"] = new Date();
            delete this.EvaluationMasterData["UpdatedBy"];
            console.log("this.EvaluationMasterData",this.EvaluationMasterData)
            this.insert(row);
          }
          else {
            delete this.EvaluationMasterData["CreatedDate"];
            delete this.EvaluationMasterData["CreatedBy"];
            this.EvaluationMasterData["UpdatedDate"] = new Date();
            this.EvaluationMasterData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
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
  GetEvaluationMaster() {
    debugger;

    this.loading = true;
    let filterStr = 'Active eq true and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();
    list.fields = [
    "EvaluationMasterId",
    "EvaluationName",
    "Description",
    "Duration",
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
          this.EvaluationMasterList = data.value.map(d=>{
            d.Action=false;
            return d;
          })
        }
        console.log("this.EvaluationMasterList",this.EvaluationMasterList)
        this.dataSource = new MatTableDataSource<IEvaluationMaster>(this.EvaluationMasterList);
        this.dataSource.paginator = this.paging;
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.GetEvaluationMaster();
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
export interface IEvaluationMaster {
  EvaluationMasterId: number;
  EvaluationName: string;
  Description: string;
  Duration: string;
  DisplayResult: boolean;
  ProvideCertificate
  FullMark: number;
  PassMark: number;
  Active: boolean;
  Action: boolean;
}

