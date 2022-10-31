import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
//import alasql from 'alasql';
import { evaluate,resize,sort } from 'mathjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-exammarkconfig',
  templateUrl: './exammarkconfig.component.html',
  styleUrls: ['./exammarkconfig.component.scss']
})
export class ExammarkconfigComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  PageLoading = true;
  ResultReleased = 0;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  ClassSubjects = [];
  AllowedSubjectIds = [];
  StandardFilterWithBatchId = '';
  loading = false;
  rowCount = 0;
  ExamMarkConfigList: IExamMarkConfig[] = [];
  SelectedBatchId = 0;
  SelectedApplicationId = 0;
  StoredForUpdate = [];
  Classes = [];
  ClassGroups = [];
  Subjects = [];
  Sections = [];
  ExamNames = [];
  Exams = [];
  Batches = [];
  StudentSubjects = [];
  SelectedClassSubjects = [];
  Students = [];
  dataSource: MatTableDataSource<IExamMarkConfig>;
  allMasterData = [];
  Permission = 'deny';
  ExamId = 0;
  ExamMarkConfigData = {
    ExamMarkConfigId: 0,
    ExamId: 0,
    ClassId: 0,
    ClassSubjectId: 0,
    Formula: '',
    Active: 0,
    OrgId: 0,
    BatchId: 0
  }
  displayedColumns = [
    'ExamMarkConfigId',
    'SubjectName',
    'Formula',
    'Active',
    'Action',
  ];
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,

    private contentservice: ContentService,
    private nav: Router,
    private fb: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.servicework.activateUpdate().then(() => {
      this.servicework.checkForUpdate().then((value) => {
        if (value) {
          location.reload();
        }
      })
    })
    debugger;
    this.searchForm = this.fb.group({
      searchExamId: [0],
      searchClassId: [0],
      //searchClassSubjectId: [0],
    });
    this.PageLoad();
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.EXAM.EXAMMARKCONFIG)
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
        this.GetMasterData();
        this.GetClassGroupMapping();
        this.GetStudentGradeDefn();

      }
    }
  }
  Calculatemark(){
    debugger;
  var arr =[1, 2, 3, 4, 5];
    var a=evaluate("x=sort([11, 23, 34, 45, 5],'desc');b=x[2];c=x[2]*.15")// // returns Array  [1, 2, 3]
    console.log("three elment of a",a._data)
  }
  GetExamMarkConfig() {
    var _classId = this.searchForm.get("searchClassId").value;
    //var _classSubjectId = this.searchForm.get("searchClassSubjectId").value;
    var _examId = this.searchForm.get("searchExamId").value
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    filterStr += " and BatchId eq " + this.SelectedBatchId;

    if (_examId == 0) {
      this.contentservice.openSnackBar("Please select exam", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      filterStr += ' and ExamId eq ' + _examId
    }
    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      filterStr += ' and ClassId eq ' + _classId
    }
    // if (_classSubjectId == 0) {
    //   this.contentservice.openSnackBar("Please select subject", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }

    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    //var _classSubjectId = this.ClassSubjects.filter(c => c.ClassId == _classId && c.SubjectId == _subjectId)[0].ClassSubjectId;
    // if (_classSubjectId > 0) {
    //   filterStr += " and ClassSubjectId eq " + _classSubjectId;
    // }
    let list: List = new List();
    list.fields = [
      'ExamMarkConfigId',
      'ExamId',
      'ClassId',
      'ClassSubjectId',
      'Formula',
      'Active'
    ];

    list.PageName = "ExamMarkConfigs";
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ExamMarkConfigList = [];
        var clsssubjects = this.ClassSubjects.filter(clssubject => clssubject.ClassId == _classId);
        clsssubjects.forEach(s => {
          var existing = data.value.filter(f => f.ClassSubjectId == s.ClassSubjectId)
          if (existing.length > 0) {
            existing[0].SubjectName = s.SubjectName;
            this.ExamMarkConfigList.push(existing[0]);
          }
          else {
            this.ExamMarkConfigList.push({
              ExamMarkConfigId: 0,
              ExamId: _examId,
              ClassId: _classId,
              ClassSubjectId: s.ClassSubjectId,
              SubjectName: s.SubjectName,
              Formula: '',
              Active: false,
              Action: false
            })
          }
        })
        if (this.ExamMarkConfigList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.dataSource = new MatTableDataSource(this.ExamMarkConfigList);
      })
  }
  GetResultReleased(source) {
    this.ResultReleased = this.Exams.filter(e => e.ExamId == source.value)[0].ReleaseResult;
    this.FilterClass();
  }
  updateActive(row, value) {
    //if(!row.Action)
    row.Action = true;
    row.Active = value.checked;
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
  UpdateOrSave(row) {

    debugger;
    if (row.Formula.length == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please enter formula", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.loading = true;
    var _examId = this.searchForm.get("searchExamId").value;
    var _classId = this.searchForm.get("searchClassId").value;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    let checkFilterString = "ExamId eq " + _examId +
      " and ClassSubjectId eq " + row.ClassSubjectId +
      " and ClassId eq " + _classId;



    if (row.ExamMarkConfigId > 0)
      checkFilterString += " and ExamMarkConfigId ne " + row.ExamMarkConfigId;
    checkFilterString += " and " + this.StandardFilterWithBatchId;

    let list: List = new List();
    list.fields = ["ExamMarkConfigId"];
    list.PageName = "ExamMarkConfigs";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          // let _examstatus = 0;
          // if (row.Marks >= row.PassMark)
          //   _examstatus = this.ExamStatuses.filter(f => f.MasterDataName.toLowerCase() == "pass")[0].MasterDataId;
          // else
          //   _examstatus = this.ExamStatuses.filter(f => f.MasterDataName.toLowerCase() == "fail")[0].MasterDataId;

          this.ExamMarkConfigData.ExamMarkConfigId = row.ExamMarkConfigId;
          this.ExamMarkConfigData.ExamId = _examId;
          this.ExamMarkConfigData.Active = row.Active;
          this.ExamMarkConfigData.ClassSubjectId = row.ClassSubjectId;
          this.ExamMarkConfigData.Formula = row.Formula;
          this.ExamMarkConfigData.ClassId = _classId;
          this.ExamMarkConfigData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ExamMarkConfigData.BatchId = this.SelectedBatchId;
          console.log("this.ExamMarkConfigData", this.ExamMarkConfigData)
          if (this.ExamMarkConfigData.ExamMarkConfigId == 0) {
            this.ExamMarkConfigData["CreatedDate"] = new Date();
            this.ExamMarkConfigData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ExamMarkConfigData["UpdatedDate"] = new Date();
            delete this.ExamMarkConfigData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.ExamMarkConfigData["CreatedDate"];
            delete this.ExamMarkConfigData["CreatedBy"];
            this.ExamMarkConfigData["UpdatedDate"] = new Date();
            this.ExamMarkConfigData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('ExamMarkConfigs', this.ExamMarkConfigData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ExamMarkConfigId = data.ExamMarkConfigId;
          row.Action = false;
          if (this.rowToUpdate == 0) {
            this.loading = false;
            this.PageLoading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
          //this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch('ExamMarkConfigs', this.ExamMarkConfigData, this.ExamMarkConfigData.ExamMarkConfigId, 'patch')
      .subscribe(
        (data: any) => {
          //this.loading = false; this.PageLoading=false;
          row.Action = false;
          if (this.rowToUpdate == 0) {
            this.loading = false;
            this.PageLoading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
          //this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
        });
  }
  GetClassGroupMapping() {
    this.contentservice.GetClassGroupMapping(this.LoginUserDetail[0]["orgId"], 1)
      .subscribe((data: any) => {
        this.ClassGroupMapping = data.value.map(f => {
          f.ClassName = f.Class.ClassName;
          return f;
        });
        this.loading = false;
        this.PageLoading = false;
      })
  }
  FilteredClasses = [];
  FilterClass() {
    var _examId = this.searchForm.get("searchExamId").value
    var _classGroupId = 0;
    var obj = this.Exams.filter(f => f.ExamId == _examId);
    if (obj.length > 0)
      _classGroupId = obj[0].ClassGroupId;
    this.FilteredClasses = this.ClassGroupMapping.filter(f => f.ClassGroupId == _classGroupId);
    this.SelectedClassStudentGrades = this.StudentGrades.filter(f => f.ClassGroupId == _classGroupId);
  }

  SelectClassSubject() {
    debugger;
    this.SelectedClassSubjects = this.ClassSubjects.filter(f => f.ClassId == this.searchForm.get("searchClassId").value);
    //this.GetSpecificStudentGrades();
  }

  GetClassSubject() {

    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]

    let list: List = new List();
    list.fields = [
      "ClassSubjectId",
      "Active",
      "SubjectId",
      "ClassId",
      "SubjectCategoryId",
      "Confidential"
    ];
    list.PageName = "ClassSubjects";
    list.filter = [filterStr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        this.ClassSubjects = data.value.map(cs => {
          var _class = '';
          var objclass = this.Classes.filter(c => c.ClassId == cs.ClassId)
          if (objclass.length > 0)
            _class = objclass[0].ClassName;

          var _subject = ''
          var objsubject = this.Subjects.filter(c => c.MasterDataId == cs.SubjectId)
          if (objsubject.length > 0)
            _subject = objsubject[0].MasterDataName;
          return {
            ClassSubjectId: cs.ClassSubjectId,
            Active: cs.Active,
            SubjectId: cs.SubjectId,
            ClassId: cs.ClassId,
            Confidential: cs.Confidential,
            ClassSubject: _class + '-' + _subject,
            SubjectName: _subject,
            SubjectCategoryId: cs.SubjectCategoryId
          }
        })
        this.ClassSubjects = this.contentservice.getConfidentialData(this.tokenstorage, this.ClassSubjects, "ClassSubject");
        this.loading = false;
      })
  }

  //ExamMarkFormula = '';
  StudentGrades = [];
  SelectedClassStudentGrades = [];
  ClassGroupMapping = [];

  GetStudentGradeDefn() {
    this.contentservice.GetStudentGrade(this.LoginUserDetail[0]["orgId"])
      .subscribe((data: any) => {
        this.StudentGrades = [...data.value];
      })
    this.PageLoading = false;
  }
  GetSpecificStudentGrades() {
    debugger;
    var _examId = this.searchForm.get("searchExamId").value;
    var _classGroupId = 0;

    if (_examId > 0) {
      var obj = this.Exams.filter(f => f.ExamId == _examId)
      if (obj.length > 0) {
        _classGroupId = obj[0].ClassGroupId;
        this.SelectedClassStudentGrades = this.StudentGrades.filter(f => f.ClassGroupId == _classGroupId);
      }
      else {
        this.contentservice.openSnackBar("Class group not found for selected class.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
    }
  }

  checkall(value) {
    this.ExamMarkConfigList.forEach(record => {
      record.Active = value.checked;
      record.Action = !record.Action;
    })
  }
  rowToUpdate = 0;
  saveall() {

    var toupdate = this.ExamMarkConfigList.filter(record => record.Action)
    this.rowToUpdate = toupdate.length;
    toupdate.forEach(record => {
      this.rowToUpdate--;
      this.UpdateOrSave(record);
    })
  }
  onBlur(element) {
    element.Action = true;
  }

  // UpdateAll() {
  //   this.ExamMarkConfigList.forEach(element => {
  //     this.SaveRow(element);
  //   })
  // }
  // SaveRow(element) {
  //   debugger;
  //   this.loading = true;
  //   this.rowCount = 0;
  //   //var columnexist;
  //   for (var prop in element) {

  //     var row: any = this.StoredForUpdate.filter(s => s.SubjectMarkComponent == prop
  //       && s.StudentClassSubjectId == element.StudentClassSubjectId);

  //     if (row.length > 0 && prop != 'StudentClassSubject' && prop != 'Action') {
  //       row[0].Active = 1;
  //       row[0].Marks = row[0][prop];
  //       this.UpdateOrSave(row[0]);
  //     }
  //   }
  // }
  SubjectCategory = [];
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        this.contentservice.GetClassGroups(this.LoginUserDetail[0]["orgId"])
          .subscribe((data: any) => {
            this.ClassGroups = [...data.value];
          });
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
          this.GetClassSubject();
        })

        //if role is teacher, only their respective class and subject will be allowed.
        if (this.LoginUserDetail[0]['RoleUsers'][0].role == 'Teacher') {
          this.GetAllowedSubjects();
        }

        this.GetExams();

      });
  }
  GetAllowedSubjects() {
    let list: List = new List();
    list.fields = [
      'ClassSubjectId',
      'SubjectId',
      'ClassId',
      'TeacherId',
      'Active',
    ];

    list.PageName = "ClassSubjects"
    list.filter = ['Active eq 1 and TeacherId eq ' + localStorage.getItem('nameId') +
      ' and OrgId eq ' + this.LoginUserDetail[0]['orgId']];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AllowedSubjectIds = [...data.value];
        var _AllClassId = [...this.Classes];

        if (this.AllowedSubjectIds.length > 0) {
          this.Classes = _AllClassId.map(m => {
            var result = this.AllowedSubjectIds.filter(x => x.ClassId == m.ClassId);
            if (result.length > 0)
              return m;
          })
        }
      });
  }
  GetExams() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] +
      ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId", "ReleaseResult", "ClassGroupId", "MarkFormula"];
    list.PageName = "Exams";
    list.filter = ["Active eq 1 " + orgIdSearchstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.forEach(e => {
          var _examName = '';
          var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
          if (obj.length > 0) {

            _examName = obj[0].MasterDataName;

            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: _examName,
              ReleaseResult: e.ReleaseResult,
              ClassGroupId: e.ClassGroupId,
              MarkFormula: e.MarkFormula
            });
          }
        })
        this.PageLoading = false;
        //console.log("exams", this.Exams);
        //this.GetStudentSubjects();
      })
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
export interface IExamMarkConfig {
  ExamMarkConfigId: number;
  ExamId: number;
  ClassId: number;
  ClassSubjectId: number;
  SubjectName: string;
  Formula: string;
  Active: boolean;
  Action: boolean;
}


