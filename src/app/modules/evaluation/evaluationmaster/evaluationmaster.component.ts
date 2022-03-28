import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-evaluationmaster',
  templateUrl: './evaluationmaster.component.html',
  styleUrls: ['./evaluationmaster.component.scss']
})
export class EvaluationMasterComponent implements OnInit {
  @Output() NotifyParent: EventEmitter<number> = new EventEmitter();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  EvaluationTypeId = 0;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  SelectedApplicationId = 0;
  StudentClassId = 0;
  Permission = '';
  StandardFilter = '';
  loading = false;
  EvaluationMasterList: IEvaluationMaster[] = [];
  Sessions = [];
  SelectedBatchId = 0;
  SelectedClassSubjects = [];
  ClassSubjects = [];
  Classes = [];
  RatingOptions = [];
  filteredOptions: Observable<IEvaluationMaster[]>;
  dataSource: MatTableDataSource<IEvaluationMaster>;
  allMasterData = [];
  EvaluationTypes = [];
  //ExamId = 0;
  EvaluationMasterData = {
    EvaluationMasterId: 0,
    ClassId: 0,
    ClassSubjectId: 0,
    Title: 0,
    EvaluationTypeId: 0,
    OrgId: 0,
    Active: 0,
  };
  EvaluationMasterForUpdate = [];
  displayedColumns = [
    'EvaluationMasterId',
    'Title',
    'ClassId',
    'ClassSubjectId',
    'Active',
    'Action'
  ];
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private nav: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.StudentClassId = this.tokenstorage.getStudentClassId();
    this.searchForm = this.fb.group({
      searchEvaluationTypeId: [0],
      searchSubjectId: [0],
      searchClassId: [0]
    })
    this.PageLoad();
  }

  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  PassParent(value: number) {
    debugger;
    this.NotifyParent.emit(value);
  
  }
  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.EVALUATION.EVALUATIONMASTER)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
        this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
        this.GetMasterData();
        if (this.Classes.length == 0) {
          this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
            this.Classes = [...data.value];
          });
        }
      }
    }
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
  GetClassSubjects() {
    let list = new List();
    list.PageName = "ClassSubjects";
    list.fields = ["ClassSubjectId,ClassId,SubjectId"];
    list.lookupFields = ["Class($select=ClassId,ClassName)"];
    list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassSubjects = data.value.map(m => {
          var _subjectname = "";
          var subjectobj = this.allMasterData.filter(f => f.MasterDataId == m.SubjectId);
          if (subjectobj.length > 0)
            _subjectname = subjectobj[0].MasterDataName;
          m.ClassSubject = _subjectname;

          return m;

        });
      });
  }
  // viewchild(row) {
  //   this.evaluationMasterId = row.EvaluationMasterId;
  // }
  AddNew() {
    var newItem = {
      EvaluationMasterId: 0,
      ClassId: 0,
      ClassSubjectId: 0,
      Title: '',
      EvaluationTypeId: 0,
      Active: 0,
      Deleted: "false",
      Action: false
    }
    this.EvaluationMasterList = [];
    this.EvaluationMasterList.push(newItem);
    this.dataSource = new MatTableDataSource(this.EvaluationMasterList);
  }
  UpdateOrSave(row) {

    //debugger;
    var _classId = this.searchForm.get("searchClassId").value;
    var _subjectId = this.searchForm.get("searchSubjectId").value;
    //var _title = this.searchForm.get("searchTitle").value;
    var _evaluationTypeId = this.searchForm.get("searchEvaluationTypeId").value;

    this.loading = true;
    let checkFilterString = '';
    if (row.Title.length > 0)
      checkFilterString = "Title eq '" + row.Title + "'";
    else {
      this.contentservice.openSnackBar("Please enter title.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_evaluationTypeId > 0)
      checkFilterString += " and EvaluationTypeId eq " + _evaluationTypeId;
    else {
      this.contentservice.openSnackBar("Please select evaluation type.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_classId > 0)
      checkFilterString += " and ClassId eq " + _classId;

    if (_subjectId > 0)
      checkFilterString += " and ClassSubjectId eq " + _subjectId;

    if (row.EvaluationMasterId > 0)
      checkFilterString += " and EvaluationMasterId ne " + row.EvaluationMasterId;
    checkFilterString += " and " + this.StandardFilter;
    let list: List = new List();
    list.fields = ["EvaluationMasterId"];
    list.PageName = "EvaluationMasters";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
          this.EvaluationMasterForUpdate = [];
          this.EvaluationMasterForUpdate.push(
            {
              EvaluationMasterId: row.EvaluationMasterId,
              ClassId: _classId,
              ClassSubjectId: _subjectId,
              Title: row.Title,
              EvaluationTypeId: this.searchForm.get("searchEvaluationTypeId").value,
              Active: row.Active,
              Deleted: 0,
              OrgId: this.LoginUserDetail[0]["orgId"]
            });


          if (this.EvaluationMasterForUpdate[0].EvaluationMasterId == 0) {
            this.EvaluationMasterForUpdate[0]["CreatedDate"] = new Date();
            this.EvaluationMasterForUpdate[0]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EvaluationMasterForUpdate[0]["UpdatedDate"] = new Date();
            delete this.EvaluationMasterForUpdate[0]["UpdatedBy"];
            delete this.EvaluationMasterForUpdate[0]["SubCategories"];
            console.log("inserting1", this.EvaluationMasterForUpdate);
            this.insert(row);
          }
          else {
            this.EvaluationMasterForUpdate[0]["CreatedDate"] = new Date(row.CreatedDate);
            this.EvaluationMasterForUpdate[0]["CreatedBy"] = row.CreatedBy;
            this.EvaluationMasterForUpdate[0]["UpdatedDate"] = new Date();
            delete this.EvaluationMasterForUpdate[0]["SubCategories"];
            delete this.EvaluationMasterForUpdate[0]["UpdatedBy"];
            //this.EvaluationMasterForUpdate[0]["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            //this.insert(row);
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false;
  }
  insert(row) {
    //console.log("inserting",this.EvaluationMasterForUpdate);
    //debugger;
    this.dataservice.postPatch('EvaluationMasters', this.EvaluationMasterForUpdate[0], 0, 'post')
      .subscribe(
        (data: any) => {
          row.EvaluationMasterId = data.EvaluationMasterId;
          row.Action = false;
          //this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {
    //console.log("updating",this.EvaluationMasterForUpdate);
    this.dataservice.postPatch('EvaluationMasters', this.EvaluationMasterForUpdate[0], this.EvaluationMasterForUpdate[0].EvaluationMasterId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          //this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetEvaluationMaster() {
    //debugger;
    this.loading = true;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    var _classId = this.searchForm.get("searchClassId").value;
    var _subjectId = this.searchForm.get("searchSubjectId").value;
    var _evaluationTypeId = this.searchForm.get("searchEvaluationTypeId").value;
    //var _examId = this.searchForm.get("searchExamId").value;

    if (_evaluationTypeId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select evaluation type.", globalconstants.ActionText, globalconstants.BlueBackground);
      return;
    }
    else {
      filterStr += " and EvaluationTypeId eq " + _evaluationTypeId;
    }

    if (_classId > 0)
      filterStr += " and ClassId eq " + _classId;
    if (_subjectId > 0)
      filterStr += " and ClassSubjectId eq " + _subjectId;

    let list: List = new List();
    list.fields = [
      'EvaluationMasterId',
      'ClassId',
      'ClassSubjectId',
      'Title',
      'EvaluationTypeId',
      'Active',
    ];

    list.PageName = "EvaluationMasters";

    list.filter = [filterStr];
    this.EvaluationMasterList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.EvaluationMasterList = data.value.map(item => {
            item.Action = false;
            return item;
          })
        }
        else {
          this.EvaluationMasterList = [];
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }
        this.dataSource = new MatTableDataSource<IEvaluationMaster>(this.EvaluationMasterList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.EvaluationTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.EVALUATIONTYPE);
        this.GetClassSubjects();
        this.loading = false;
      });
  }
  onBlur(row) {
    row.Action = true;
  }

  getClassSubjects() {
    debugger;

    this.SelectedClassSubjects = this.ClassSubjects.filter(f => f.ClassId == this.searchForm.get("searchClassId").value);

  }
  GetEvaluationTypeId() {
    this.EvaluationTypeId = this.searchForm.get("searchEvaluationTypeId").value;
  }
  UpdateActive(row, event) {
    row.Active = event.checked ? 1 : 0;
    row.Action = true;
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
  Title: string;
  ClassId: number;
  ClassSubjectId: number;
  EvaluationTypeId: number;
  Active: number;
  Deleted: string;
  Action: boolean;
}

export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}

