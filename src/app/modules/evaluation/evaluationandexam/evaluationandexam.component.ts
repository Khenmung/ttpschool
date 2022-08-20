import { Component, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-evaluationandexam',
  templateUrl: './evaluationandexam.component.html',
  styleUrls: ['./evaluationandexam.component.scss']
})
export class EvaluationandExamComponent implements OnInit {
    PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  selectedIndex = 0;
  selectedRowIndex = -1;
  EvaluationTypes = [];
  //EvaluationExamIdTopass = 0;
  SelectedApplicationId = 0;
  StudentClassId = 0;
  Permission = '';
  StandardFilter = '';
  loading = false;
  EvaluationExamOptionList = [];
  EvaluationExamList: IEvaluationExam[] = [];
  EvaluationMasterId = 0;
  SelectedBatchId = 0;
  Categories = [];
  SubCategories = [];
  Classes = [];
  ClassSubjects = [];
  Exams = [];
  ExamNames = [];
  SelectedClassSubjects = [];
  filteredOptions: Observable<IEvaluationExam[]>;
  dataSource: MatTableDataSource<IEvaluationExam>;
  allMasterData = [];
  EvaluationExamData = {
    EvaluationExamId: 0,
    EvaluationMasterId: 0,
    ExamId: 0,
    OrgId: 0,
    Deleted: false,
    Active: 0
  };
  EvaluationExamForUpdate = [];
  displayedColumns = [
    "EvaluationExamId",
    "EvaluationMasterId",
    "ExamId",
    "Active",
    "Action"
  ];
  EvaluationMasters = [];
  searchForm: UntypedFormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private nav: Router,
    private fb: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    debugger;
    this.StudentClassId = this.tokenstorage.getStudentClassId();
    this.searchForm = this.fb.group({
      searchEvaluationMasterId: [0],
      searchExamId: [0]
    })
    this.PageLoad();
  }

  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.STUDENT.STUDENTAPROFILE)
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
            this.loading = false; this.PageLoading = false;
          });

        }

      }
    }
  }
  GetExams() {
    this.contentservice.GetExams(this.LoginUserDetail[0]["orgId"], this.SelectedBatchId)
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.forEach(e => {
          var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
          if (obj.length > 0)
            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: obj[0].MasterDataName,
              ClassGroupId: e.ClassGroupId
            })
        });
        this.loading = false; this.PageLoading = false;
      })
  }
  SelectSubCategory(pCategoryId) {
    this.SubCategories = this.allMasterData.filter(f => f.ParentId == pCategoryId.value);
  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {
          // this.GetApplicationRoles();
          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  tabchanged(indx) {
    this.selectedIndex += indx;
  }
  Detail(value) {
    debugger;
    this.EvaluationMasterId = value.EvaluationMasterId;
    this.selectedIndex += 1;
    this.PageLoad();
  }
  highlight(rowId) {
    if (this.selectedRowIndex == rowId)
      this.selectedRowIndex = -1;
    else
      this.selectedRowIndex = rowId
  }
  AddNew() {
    var newItem = {
      EvaluationExamId: 0,
      EvaluationMasterId: this.searchForm.get("searchEvaluationMasterId").value,
      ExamId: this.searchForm.get("searchExamId").value,
      OrgId: 0,
      Deleted: 0,
      Active: 0,
      Action: false
    }
    this.EvaluationExamList = [];
    this.EvaluationExamList.push(newItem);
    this.dataSource = new MatTableDataSource(this.EvaluationExamList);
  }
  UpdateOrSave(row) {

    debugger;
    this.loading = true;
    let checkFilterString = this.StandardFilter;

    if (row.EvaluationMasterId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select evaluation master.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      checkFilterString += " and EvaluationMasterId eq " + row.EvaluationMasterId
    }
    if (row.ExamId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select exam.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      checkFilterString += " and ExamId eq " + row.ExamId;
    }

    if (row.EvaluationExamId > 0)
      checkFilterString += " and EvaluationExamId ne " + row.EvaluationExamId;

    //checkFilterString += " and " + this.StandardFilter;
    let list: List = new List();
    list.fields = ["EvaluationExamId"];
    list.PageName = "EvaluationExams";
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
          this.EvaluationExamData.EvaluationExamId = row.EvaluationExamId;
          this.EvaluationExamData.EvaluationMasterId = row.EvaluationMasterId
          this.EvaluationExamData.ExamId = row.ExamId;
          this.EvaluationExamData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.EvaluationExamData.Deleted = false;
          this.EvaluationExamData.Active = row.Active;

          if (this.EvaluationExamData.EvaluationExamId == 0) {
            this.EvaluationExamData["CreatedDate"] = new Date();
            this.EvaluationExamData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EvaluationExamData["UpdatedDate"] = new Date();
            delete this.EvaluationExamData["UpdatedBy"];
            delete this.EvaluationExamData["SubCategories"];
            console.log("this.EvaluationExamData", this.EvaluationExamData)
            this.insert(row);
          }
          else {

            //this.EvaluationExamData["CreatedDate"] = new Date(row.CreatedDate);
            //this.EvaluationExamData["CreatedBy"] = row.CreatedBy;
            this.EvaluationExamData["UpdatedDate"] = new Date();
            //delete this.EvaluationExamData["SubCategories"];
            this.EvaluationExamData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            console.log("this.EvaluationExamData", this.EvaluationExamData)
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {
    this.dataservice.postPatch('EvaluationExams', this.EvaluationExamData, 0, 'post')
      .subscribe(
        (data: any) => {

          row.EvaluationExamId = data.EvaluationExamId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {
    this.dataservice.postPatch('EvaluationExams', this.EvaluationExamData, this.EvaluationExamData.EvaluationExamId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetEvaluationExam() {
    debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    var _searchEvaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value;
    var _searchExamId = this.searchForm.get("searchExamId").value;

    if (_searchEvaluationMasterId > 0)
      filterStr += " and EvaluationMasterId eq " + _searchEvaluationMasterId;
    if (_searchExamId > 0)
      filterStr += " and ExamId eq " + _searchExamId

    //filterStr += ' and StudentClassId eq ' + this.StudentClassId
    let list: List = new List();
    list.fields = [
      'EvaluationExamId',
      'EvaluationMasterId',
      'ExamId',
      'Deleted',
      'Active'
    ];

    list.PageName = "EvaluationExams";

    list.filter = [filterStr];
    this.EvaluationExamList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.EvaluationExamList = data.value.map(item => {
            item.Action = false;
            return item;
          })
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }

        this.dataSource = new MatTableDataSource<IEvaluationExam>(this.EvaluationExamList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loadingFalse();
      });

  }

  GetEvaluationMasters() {
    let list = new List();
    list.PageName = "EvaluationMasters";
    list.fields = ["EvaluationMasterId", "Title", "ClassId", "ClassSubjectId", "EvaluationTypeId"];
    list.filter = ['Active eq true and OrgId eq ' + this.LoginUserDetail[0]["orgId"]];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.EvaluationMasters = data.value.map(m => {
          var _subjectname = "";
          var subjectobj = this.allMasterData.filter(f => f.MasterDataId == m.SubjectId);
          if (subjectobj.length > 0)
            _subjectname = subjectobj[0].MasterDataName;
          var _evaluationtypename = "";
          var Evaluationtypeobj = this.allMasterData.filter(f => f.MasterDataId == m.EvaluationTypeId);
          if (Evaluationtypeobj.length > 0)
            _evaluationtypename = Evaluationtypeobj[0].MasterDataName;
          var _classname = "";
          var classobj = this.Classes.filter(f => f.ClassId == m.ClassId)
          if (classobj.length > 0)
            _classname = classobj[0].ClassName;

          m.SubjectName = _subjectname;
          m.TitleClassSubject = _evaluationtypename + "-" + m.Title + "-" + _classname + "-" + _subjectname;
          return m;

        });
      });
  }

  GetMasterData() {
    debugger;
    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.EvaluationTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.EVALUATIONTYPE);
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        this.GetExams();
        this.loading = false; this.PageLoading = false;
        this.GetEvaluationMasters();
      });
  }
  onBlur(row) {
    row.Action = true;
  }
  UpdateMultiAnswer(row, event) {
    row.MultipleAnswer = event.checked ? 1 : 0;
    row.Action = true;
  }
  UpdateActive(row, event) {
    row.Active = event.checked ? 1 : 0;
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

export interface IEvaluationExam {
  EvaluationExamId: number;
  EvaluationMasterId: number;
  ExamId: number;
  OrgId: number;
  Deleted: number;
  Active: number;
  Action: boolean;
}




