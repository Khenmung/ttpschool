import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-classdetail',
  templateUrl: './classdetail.component.html',
  styleUrls: ['./classdetail.component.scss']
})
export class ClassdetailComponent implements OnInit {
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
  ClassMasterListName = 'ClassMasters';
  Applications = [];
  loading = false;
  SelectedApplicationId = 0;
  SelectedBatchId = 0;
  ClassMasterList: IClassMaster[] = [];
  filteredOptions: Observable<IClassMaster[]>;
  dataSource: MatTableDataSource<IClassMaster>;
  allMasterData = [];
  ClassMasters = [];
  Durations = [];
  StudyArea = [];
  StudyMode = [];
  Permission = 'deny';
  ExamId = 0;
  ClassMasterData = {
    ClassId: 0,
    ClassName: '',
    DurationId: 0,
    MinStudent: 0,
    MaxStudent: 0,
    StartDate: Date,
    EndDate: Date,
    StudyAreaId: 0,
    StudyModeId: 0,
    Sequence: 0,
    BatchId: 0,
    OrgId: 0,
    Active: 0
  };
  PreviousBatchId = 0;
  StandardFilterWithPreviousBatchId = '';
  StandardFilterWithBatchId = '';
  displayedColumns = [
    "ClassId",
    "ClassName",
    "Sequence",
    "DurationId",
    "MinStudent",
    "MaxStudent",
    "StartDate",
    "EndDate",
    "StudyAreaId",
    "StudyModeId",
    "Active",
    "Action"
  ];
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    
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
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.CLASSCOURSE.CLASSDETAIL)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {

        //this.nav.navigate(['/edu'])
      }
      else {
        this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
        this.StandardFilterWithPreviousBatchId = globalconstants.getStandardFilterWithPreviousBatchId(this.tokenstorage);
        if (this.ClassMasters.length == 0) {
          this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
            this.ClassMasters = [...data.value];
          })
        }
        this.GetMasterData();
      }
    }
  }

  AddNew() {

    var newdata = {
      ClassId: 0,
      ClassName: '',
      Sequence: 0,
      DurationId: 0,
      MinStudent: 0,
      MaxStudent: 0,
      StartDate: new Date(),
      EndDate: new Date(),
      StudyAreaId: 0,
      StudyModeId: 0,
      BatchId: 0,
      Active: 0,
      Action: true
    };
    this.ClassMasterList = [];
    this.ClassMasterList.push(newdata);
    this.dataSource = new MatTableDataSource<IClassMaster>(this.ClassMasterList);
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

    if (row.Sequence > 250) {
      this.contentservice.openSnackBar("Sequence can not be greater than 250",globalconstants.ActionText,globalconstants.RedBackground);
      this.loading = false;
      return;
    }
    // if(row.MinStudent<1)
    // {
    //   this.contentservice.openSnackBar("Minimum can not be less than 1",this.optionsNoAutoClose);
    //   this.loading=false;
    //   return;
    // }
    if (row.MaxStudent > 1000) {
      this.contentservice.openSnackBar("Maximum can not be greater than 1000",globalconstants.ActionText,globalconstants.RedBackground);
      this.loading = false;
      return;
    }
    this.loading = true;
    let checkFilterString = "ClassName eq '" + row.ClassName + "' and OrgId eq " + this.LoginUserDetail[0]["orgId"]

    if (row.ClassId > 0)
      checkFilterString += " and ClassId ne " + row.ClassId;
    let list: List = new List();
    list.fields = ["ClassId"];
    list.PageName = this.ClassMasterListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.AddedMessage, globalconstants.RedBackground);
        }
        else {

          this.ClassMasterData.ClassId = row.ClassId;
          this.ClassMasterData.ClassName = row.ClassName;
          this.ClassMasterData.Sequence = row.Sequence;
          this.ClassMasterData.DurationId = row.DurationId;
          this.ClassMasterData.StartDate = row.StartDate;
          this.ClassMasterData.EndDate = row.EndDate;
          this.ClassMasterData.MaxStudent = row.MaxStudent;
          this.ClassMasterData.MinStudent = row.MinStudent;
          this.ClassMasterData.StudyAreaId = row.StudyAreaId;
          this.ClassMasterData.StudyModeId = row.StudyModeId;
          this.ClassMasterData.OrgId = this.LoginUserDetail[0]["orgId"];
          //this.ClassMasterData.BatchId = this.SelectedBatchId;

          this.ClassMasterData.Active = row.Active;
          ////console.log('exam slot', this.ClassMasterData)

          if (this.ClassMasterData.ClassId == 0) {
            this.ClassMasterData["CreatedDate"] = new Date();
            this.ClassMasterData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ClassMasterData["UpdatedDate"] = new Date();
            delete this.ClassMasterData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.ClassMasterData["CreatedDate"];
            delete this.ClassMasterData["CreatedBy"];
            this.ClassMasterData["UpdatedDate"] = new Date();
            this.ClassMasterData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
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
    this.dataservice.postPatch(this.ClassMasterListName, this.ClassMasterData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ClassId = data.ClassId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.ClassMasterListName, this.ClassMasterData, this.ClassMasterData.ClassId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetClassMasters() {
    debugger;

    this.loading = true;
    let filterStr = '';
    filterStr = "OrgId eq " + this.LoginUserDetail[0]["orgId"];

    var _searchClassName = this.searchForm.get("searchClassName").value;
    if (_searchClassName > 0) {
      filterStr += ' and ClassId eq ' + _searchClassName;
    }
    let list: List = new List();
    list.fields = [
      "ClassId",
      "ClassName",
      "Sequence",
      "DurationId",
      "MinStudent",
      "MaxStudent",
      "StartDate",
      "EndDate",
      "StudyAreaId",
      "StudyModeId",
      "BatchId",
      "Active"
    ];

    list.PageName = this.ClassMasterListName;
    list.filter = [filterStr];
    this.ClassMasterList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.ClassMasterList = [...data.value];
        }
        this.dataSource = new MatTableDataSource<IClassMaster>(this.ClassMasterList);
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        //this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.bang);
        this.Durations = this.getDropDownData(globalconstants.MasterDefinitions.school.DURATION);
        this.StudyArea = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDYAREA);
        this.StudyMode = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDYMODE);
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
export interface IClassMaster {
  ClassId: number;
  ClassName: string;
  DurationId: number;
  MinStudent: number;
  MaxStudent: number;
  StartDate: Date;
  EndDate: Date;
  StudyAreaId: number;
  StudyModeId: number;
  Sequence: number;
  BatchId: number;
  Active: number;
  Action: boolean;
}
export interface IApplication {
  ApplicationId: number;
  ApplicationName: string;
}




