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
  selector: 'app-EvaluationClassSubjectMap',
  templateUrl: './EvaluationClassSubjectMap.component.html',
  styleUrls: ['./EvaluationClassSubjectMap.component.scss']
})
export class EvaluationClassSubjectMapComponent implements OnInit {
  @Output() NotifyParent: EventEmitter<number> = new EventEmitter();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  EvaluationMasterId = 0;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  SelectedApplicationId = 0;
  StudentClassId = 0;
  Permission = '';
  StandardFilter = '';
  loading = false;
  EvaluationClassSubjectMapList: IEvaluationClassSubjectMap[] = [];
  ExamNames = [];
  Sessions = [];
  SelectedBatchId = 0;
  SelectedClassSubjects = [];
  ClassSubjects = [];
  Classes = [];
  RatingOptions = [];
  filteredOptions: Observable<IEvaluationClassSubjectMap[]>;
  dataSource: MatTableDataSource<IEvaluationClassSubjectMap>;
  allMasterData = [];
  EvaluationNames = [];
  Exams = [];
  EvaluationClassSubjectMapData = {
    EvaluationClassSubjectMapId: 0,
    ClassId: 0,
    ClassSubjectId: 0,
    EvaluationMasterId: 0,
    ExamId: 0,
    OrgId: 0,
    Active: 0,
  };
  EvaluationClassSubjectMapForUpdate = [];
  displayedColumns = [
    'EvaluationClassSubjectMapId',
    'EvaluationName',
    'ClassId',
    'ClassSubjectId',
    'ExamId',
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
      searchEvaluationMasterId: [0],
      searchSubjectId: [0],
      searchClassId: [0],
      searchExamId: [0]
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
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.EVALUATION.EVALUATIONCLASSSUBJECTMAP)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
        this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
        this.GetEvaluationNames();
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
  //   this.EvaluationClassSubjectMapId = row.EvaluationClassSubjectMapId;
  // }
  AddNew() {
    var _EvaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value
    var newItem = {
      EvaluationClassSubjectMapId: 0,
      ClassId: 0,
      ClassSubjectId: 0,
      ExamId: 0,
      EvaluationMasterId: _EvaluationMasterId,
      EvaluationName: this.EvaluationNames.filter(f => f.EvaluationMasterId == _EvaluationMasterId)[0].EvaluationName,
      Active: false,
      Deleted: "false",
      Action: false
    }
    this.EvaluationClassSubjectMapList = [];
    this.EvaluationClassSubjectMapList.push(newItem);
    this.dataSource = new MatTableDataSource(this.EvaluationClassSubjectMapList);
  }
  UpdateOrSave(row) {

    var _EvaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value;

    this.loading = true;
    let checkFilterString = this.StandardFilter;
    if (row.ExamId > 0)
      checkFilterString = " and ExamId eq " + row.ExamId;
    if (_EvaluationMasterId > 0)
      checkFilterString += " and EvaluationMasterId eq " + _EvaluationMasterId;
    else {
      this.contentservice.openSnackBar("Please select evaluation type.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.ClassId > 0)
      checkFilterString += " and ClassId eq " + row.ClassId;

    if (row.ClassSubjectId > 0)
      checkFilterString += " and ClassSubjectId eq " + row.ClassSubjectId;

    if (row.EvaluationClassSubjectMapId > 0)
      checkFilterString += " and EvaluationClassSubjectMapId ne " + row.EvaluationClassSubjectMapId;
    let list: List = new List();
    list.fields = ["EvaluationClassSubjectMapId"];
    list.PageName = "EvaluationClassSubjectMaps";
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
          this.EvaluationClassSubjectMapForUpdate = [];
          this.EvaluationClassSubjectMapForUpdate.push(
            {
              EvaluationClassSubjectMapId: row.EvaluationClassSubjectMapId,
              ClassId: row.ClassId,
              ClassSubjectId: row.ClassSubjectId,
              ExamId: row.ExamId==null?0:row.ExamId,
              EvaluationMasterId: this.searchForm.get("searchEvaluationMasterId").value,
              Active: row.Active,
              Deleted: false,
              OrgId: this.LoginUserDetail[0]["orgId"]
            });

            //console.log("for udpate",this.EvaluationClassSubjectMapForUpdate[0])
          if (this.EvaluationClassSubjectMapForUpdate[0].EvaluationClassSubjectMapId == 0) {
            this.EvaluationClassSubjectMapForUpdate[0]["CreatedDate"] = new Date();
            this.EvaluationClassSubjectMapForUpdate[0]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EvaluationClassSubjectMapForUpdate[0]["UpdatedDate"] = new Date();
            delete this.EvaluationClassSubjectMapForUpdate[0]["UpdatedBy"];
            delete this.EvaluationClassSubjectMapForUpdate[0]["SubCategories"];
            console.log("inserting1", this.EvaluationClassSubjectMapForUpdate);
            this.insert(row);
          }
          else {
            delete this.EvaluationClassSubjectMapForUpdate[0]["CreatedDate"];
            this.EvaluationClassSubjectMapForUpdate[0]["UpdatedDate"] = new Date();
            delete this.EvaluationClassSubjectMapForUpdate[0]["CreatedBy"];            
            delete this.EvaluationClassSubjectMapForUpdate[0]["SubCategories"];
            delete this.EvaluationClassSubjectMapForUpdate[0]["UpdatedBy"];
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false;
  }
  insert(row) {
    //console.log("inserting",this.EvaluationClassSubjectMapForUpdate);
    //debugger;
    this.dataservice.postPatch('EvaluationClassSubjectMaps', this.EvaluationClassSubjectMapForUpdate[0], 0, 'post')
      .subscribe(
        (data: any) => {
          row.EvaluationClassSubjectMapId = data.EvaluationClassSubjectMapId;
          row.Action = false;
          //this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {
    //console.log("updating",this.EvaluationClassSubjectMapForUpdate);
    this.dataservice.postPatch('EvaluationClassSubjectMaps', this.EvaluationClassSubjectMapForUpdate[0], this.EvaluationClassSubjectMapForUpdate[0].EvaluationClassSubjectMapId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          //this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetEvaluationNames() {
    //debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    let filterStr = 'Active eq true and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();
    list.fields = [
      'EvaluationMasterId',
      'EvaluationName',
      'Description',
      'Duration',
      'DisplayResult',
      'ProvideCertificate',
      'FullMark',
      'PassMark',
      'Active'
    ];

    list.PageName = "EvaluationMasters";

    list.filter = [filterStr];
    this.EvaluationNames = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.EvaluationNames = data.value.map(item => {
            return item;
          })
        }
        this.loadingFalse();
      });

  }
  GetEvaluationClassSubjectMap() {
    //debugger;
    this.loading = true;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    var _classId = this.searchForm.get("searchClassId").value;
    var _subjectId = this.searchForm.get("searchSubjectId").value;
    var _EvaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value;
    var _searchExamId = this.searchForm.get("searchExamId").value;
    //var _examId = this.searchForm.get("searchExamId").value;

    if (_EvaluationMasterId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select evaluation.", globalconstants.ActionText, globalconstants.BlueBackground);
      return;
    }
    else {
      filterStr += " and EvaluationMasterId eq " + _EvaluationMasterId;
    }

    if (_classId > 0)
      filterStr += " and ClassId eq " + _classId;
    if (_subjectId > 0)
      filterStr += " and ClassSubjectId eq " + _subjectId;
    if (_searchExamId > 0)
      filterStr += " and ExamId eq " + _searchExamId;

    let list: List = new List();
    list.fields = [
      'EvaluationClassSubjectMapId',
      'ClassId',
      'ClassSubjectId',
      'ExamId',
      'EvaluationMasterId',
      'Active',
    ];

    list.PageName = "EvaluationClassSubjectMaps";

    list.filter = [filterStr];
    this.EvaluationClassSubjectMapList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.EvaluationClassSubjectMapList = data.value.map(item => {
            item.EvaluationName = this.EvaluationNames.filter(f => f.EvaluationMasterId == item.EvaluationMasterId)[0].EvaluationName
            item.Action = false;
            return item;
          })
        }
        else {
          this.EvaluationClassSubjectMapList = [];
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }
        this.dataSource = new MatTableDataSource<IEvaluationClassSubjectMap>(this.EvaluationClassSubjectMapList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loadingFalse();
      });

  }
  GetExams() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];// + ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId"];
    list.PageName = "Exams";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Exams = data.value.map(e => {
          return {
            ExamId: e.ExamId,
            ExamName: this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId)[0].MasterDataName
          }
        })
        this.loading = false;
      })
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        //this.EvaluationNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EvaluationName);
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        this.GetClassSubjects();
        this.GetExams();
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
  GetEvaluationMasterId() {
    this.EvaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value;
  }
  UpdateActive(row, event) {
    row.Active = event.checked;
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

export interface IEvaluationClassSubjectMap {
  EvaluationClassSubjectMapId: number;
  ExamId: number;
  ClassId: number;
  ClassSubjectId: number;
  EvaluationMasterId: number;
  Active: boolean;
  Deleted: string;
  Action: boolean;
}

export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}

