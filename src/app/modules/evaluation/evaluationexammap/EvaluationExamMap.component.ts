import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
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
  selector: 'app-EvaluationExamMap',
  templateUrl: './EvaluationExamMap.component.html',
  styleUrls: ['./EvaluationExamMap.component.scss']
})
export class EvaluationExamMapComponent implements OnInit {
  PageLoading = true;
  @Output() NotifyParent: EventEmitter<number> = new EventEmitter();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  EvaluationUpdatable: any = null;
  EvaluationMasterId = 0;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  SelectedApplicationId = 0;
  StudentClassId = 0;
  Permission = '';
  StandardFilter = '';
  loading = false;
  EvaluationExamMapList: IEvaluationExamMap[] = [];
  //ExamModes = [];
  ExamNames = [];
  Sessions = [];
  SelectedBatchId = 0;
  //SelectedClassSubjects = [];
  //ClassGroups = [];
  ClassGroupMappings = [];
  //ClassSubjects = [];
  Classes = [];
  RatingOptions = [];
  filteredOptions: Observable<IEvaluationExamMap[]>;
  dataSource: MatTableDataSource<IEvaluationExamMap>;
  allMasterData = [];
  EvaluationNames = [];
  Exams = [];
  EvaluationExamMapData = {
    EvaluationExamMapId: 0,
    //ClassGroupId: 0,
    //ClassSubjectId: 0,
    EvaluationMasterId: 0,
    ExamId: 0,
    OrgId: 0,
    Active: 0,
  };
  EvaluationExamMapForUpdate = [];
  displayedColumns = [
    'EvaluationExamMapId',
    'EvaluationName',
    //'ClassGroupId',
    'ExamId',
    //'ClassSubjectId',
    'Active',
    'Action'
  ];
  ClassGroups = [];
  searchForm: UntypedFormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private nav: Router,
    private fb: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.StudentClassId = this.tokenstorage.getStudentClassId();
    this.searchForm = this.fb.group({
      searchEvaluationMasterId: [0],
      searchClassGroupId: [0],
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
    debugger;
    console.log("EvaluationUpdatable", this.EvaluationUpdatable)
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.EVALUATION.EvaluationExamMap)
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
        this.contentservice.GetClassGroups(this.LoginUserDetail[0]["orgId"])
          .subscribe((data: any) => {
            this.ClassGroups = [...data.value];
          });
        // this.contentservice.GetClassGroupMapping(this.LoginUserDetail[0]["orgId"], 1)
        //   .subscribe((data: any) => {
        //     this.ClassGroupMappings = [...data.value];
        //     this.loading = false; this.PageLoading = false;
        //   })
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
  // GetClassSubjects() {
  //   let list = new List();
  //   list.PageName = "ClassSubjects";
  //   list.fields = ["ClassSubjectId,ClassId,SubjectId"];
  //   list.lookupFields = ["Class($select=ClassId,ClassName)"];
  //   list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       this.ClassSubjects = data.value.map(m => {
  //         var _subjectname = "";
  //         var subjectobj = this.allMasterData.filter(f => f.MasterDataId == m.SubjectId);
  //         if (subjectobj.length > 0)
  //           _subjectname = subjectobj[0].MasterDataName;
  //         m.ClassSubject = _subjectname;

  //         return m;

  //       });
  //     });
  // }
  // viewchild(row) {
  //   this.EvaluationExamMapId = row.EvaluationExamMapId;
  // }
  AddNew() {
    var _EvaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value
    var newItem = {
      EvaluationExamMapId: 0,
      //ClassGroupId: 0,
      //ClassSubjectId: 0,
      ExamId: 0,
      EvaluationMasterId: _EvaluationMasterId,
      EvaluationName: this.EvaluationNames.filter(f => f.EvaluationMasterId == _EvaluationMasterId)[0].EvaluationName,
      Active: false,
      Deleted: "false",
      Action: false
    }
    this.EvaluationExamMapList = [];
    this.EvaluationExamMapList.push(newItem);
    this.dataSource = new MatTableDataSource(this.EvaluationExamMapList);
  }
  UpdateOrSave(row) {
    debugger;
    var _EvaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value;

    this.loading = true;
    let checkFilterString = this.StandardFilter + " and Active eq true";
    if (!this.EvaluationUpdatable) {

      if (row.ExamId > 0)
        checkFilterString += " and ExamId eq " + row.ExamId;
      else {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar("Please select evaluation session or examination.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
    }

    if (_EvaluationMasterId > 0)
      checkFilterString += " and EvaluationMasterId eq " + _EvaluationMasterId;
    else {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select evaluation.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.EvaluationExamMapId > 0)
      checkFilterString += " and EvaluationExamMapId ne " + row.EvaluationExamMapId;
    let list: List = new List();
    list.fields = ["EvaluationExamMapId"];
    list.PageName = "EvaluationExamMaps";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
          this.EvaluationExamMapForUpdate = [];
          this.EvaluationExamMapForUpdate.push(
            {
              EvaluationExamMapId: row.EvaluationExamMapId,
              //ClassGroupId: row.ClassGroupId,
              //ClassSubjectId: row.ClassSubjectId,
              ExamId: row.ExamId == null ? 0 : row.ExamId,
              EvaluationMasterId: this.searchForm.get("searchEvaluationMasterId").value,
              Active: row.Active,
              Deleted: false,
              OrgId: this.LoginUserDetail[0]["orgId"]
            });

          //console.log("for udpate",this.EvaluationExamMapForUpdate[0])
          if (this.EvaluationExamMapForUpdate[0].EvaluationExamMapId == 0) {
            this.EvaluationExamMapForUpdate[0]["CreatedDate"] = new Date();
            this.EvaluationExamMapForUpdate[0]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EvaluationExamMapForUpdate[0]["UpdatedDate"] = new Date();
            delete this.EvaluationExamMapForUpdate[0]["UpdatedBy"];
            delete this.EvaluationExamMapForUpdate[0]["SubCategories"];
            //console.log("inserting1", this.EvaluationExamMapForUpdate);
            this.insert(row);
          }
          else {
            delete this.EvaluationExamMapForUpdate[0]["CreatedDate"];
            this.EvaluationExamMapForUpdate[0]["UpdatedDate"] = new Date();
            delete this.EvaluationExamMapForUpdate[0]["CreatedBy"];
            delete this.EvaluationExamMapForUpdate[0]["SubCategories"];
            delete this.EvaluationExamMapForUpdate[0]["UpdatedBy"];
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {
    //console.log("inserting",this.EvaluationExamMapForUpdate);
    //debugger;
    this.dataservice.postPatch('EvaluationExamMaps', this.EvaluationExamMapForUpdate[0], 0, 'post')
      .subscribe(
        (data: any) => {
          row.EvaluationExamMapId = data.EvaluationExamMapId;
          row.Action = false;
          //this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {
    //console.log("updating",this.EvaluationExamMapForUpdate);
    this.dataservice.postPatch('EvaluationExamMaps', this.EvaluationExamMapForUpdate[0], this.EvaluationExamMapForUpdate[0].EvaluationExamMapId, 'patch')
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
      'ClassGroupId',
      'Duration',
      'DisplayResult',
      'AppendAnswer',
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
  SelectEvaluation(){
    var _searchClassGroupId = this.searchForm.get("searchClassGroupId").value;
    this.EvaluationMasterForClassGroup = this.EvaluationNames.filter(d => d.ClassGroupId == _searchClassGroupId)
  }
  EvaluationMasterForClassGroup=[];
  GetEvaluationExamMap() {
    //debugger;
    this.loading = true;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    //var _classGroupId = this.searchForm.get("searchClassGroupId").value;
    //var _subjectId = this.searchForm.get("searchSubjectId").value;
    var _EvaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value;
    var _searchExamId = this.searchForm.get("searchExamId").value;
    var _searchClassGroupId = this.searchForm.get("searchClassGroupId").value;


    if (_searchClassGroupId == 0) {
      this.loading = false;
      this.PageLoading = false;
      this.contentservice.openSnackBar("Please select class group.", globalconstants.ActionText, globalconstants.BlueBackground);
      return;
    }

    if (_EvaluationMasterId > 0)
      filterStr += " and EvaluationMasterId eq " + _EvaluationMasterId;

    if (_searchExamId > 0)
      filterStr += " and ExamId eq " + _searchExamId;

    let list: List = new List();
    list.fields = [
      'EvaluationExamMapId',
      'ExamId',
      'EvaluationMasterId',
      'Active',
    ];

    list.PageName = "EvaluationExamMaps";
    list.filter = [filterStr];
    this.EvaluationExamMapList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          
          if (this.EvaluationMasterForClassGroup.length > 0) {
            var _evaluationMappedForSelectedClassGroup = data.value.filter(f => {
              return this.EvaluationMasterForClassGroup.filter(e => e.EvaluationMasterId == f.EvaluationMasterId).length > 0
            });
            var _filter = "OrgId eq " + this.LoginUserDetail[0]["orgId"] + " and (";
            _evaluationMappedForSelectedClassGroup.forEach((mapdata, indx) => {
              _filter += 'EvaluationExamMapId eq ' + mapdata.EvaluationExamMapId
              if (indx < _evaluationMappedForSelectedClassGroup.length - 1)
                _filter += " or "
              else
                _filter += ")"
            })

            list.fields = ['EvaluationExamMapId'];
            list.PageName = "StudentEvaluationResults";
            list.filter = [_filter];
            this.dataservice.get(list)
              .subscribe((useddata: any) => {
                this.EvaluationExamMapList = _evaluationMappedForSelectedClassGroup.map(item => {
                  item.EvaluationName = this.EvaluationNames.filter(f => f.EvaluationMasterId == item.EvaluationMasterId)[0].EvaluationName
                  item.AlreadyUsed = useddata.value.filter(f => f.EvaluationExamMapId == item.EvaluationExamMapId).length > 0;
                  item.Action = false;
                  return item;
                })
                this.dataSource = new MatTableDataSource<IEvaluationExamMap>(this.EvaluationExamMapList);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.loadingFalse();
              })
          }
          else {
            this.loadingFalse();
            this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.dataSource = new MatTableDataSource<IEvaluationExamMap>(this.EvaluationExamMapList);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          }  
        }
        else {
          this.loadingFalse();
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.dataSource = new MatTableDataSource<IEvaluationExamMap>(this.EvaluationExamMapList);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
        

        //this.loading = false;
      });

  }
  GetExams() {
    this.contentservice.GetExams(this.LoginUserDetail[0]["orgId"], this.SelectedBatchId)
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.map(e => {
          var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
          if (obj.length > 0) {
            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: obj[0].MasterDataName,
              ClassGroupId: obj[0].ClassGroupId
            })
          }
        })
        this.loading = false; this.PageLoading = false;
      })
    //this.Exams =
    // //var _gradingExamModeId = this.ExamModes.filter(f => f.MasterDataName.toLowerCase() == globalconstants.ExamGrading.toLowerCase())[0].MasterDataId;
    // var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] +
    //   ' and BatchId eq ' + this.SelectedBatchId
    // //  ' and ExamModeId eq ' + _gradingExamModeId;

    // let list: List = new List();

    // list.fields = ["ExamId", "ExamNameId","ClassGroupId"];
    // list.PageName = "Exams";
    // list.filter = ["Active eq 1 " + orgIdSearchstr];

    // this.dataservice.get(list)
    // .subscribe((data: any) => {
    //   this.Exams = data.value.map(e => {
    //     var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
    //     if (obj.length > 0) {
    //       this.Exams.push({
    //         ExamId: e.ExamId,
    //         ExamName: obj[0].MasterDataName,
    //         ClassGroupId:obj[0].ClassGroupId
    //       })
    //     }
    //   })
    //   this.loading = false; this.PageLoading = false;
    // })
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        //this.ExamModes = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMMODE);
        this.GetExams();
        this.loading = false; this.PageLoading = false;
      });
  }
  onBlur(row) {
    row.Action = true;
  }

  GetEvaluationMasterId() {
    this.EvaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value;
    this.EvaluationUpdatable = this.EvaluationNames.filter(f => f.EvaluationMasterId == this.EvaluationMasterId)[0].AppendAnswer;
    //console.log("EvaluationUpdatable", this.EvaluationUpdatable);
  }
  UpdateActive(row, event) {
    row.Active = event.checked;
    row.Action = true;
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

export interface IEvaluationExamMap {
  EvaluationExamMapId: number;
  ExamId: number;
  //ClassGroupId: number;
  //ClassSubjectId: number;
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

