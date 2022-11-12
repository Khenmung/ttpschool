import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
@Component({
  selector: 'app-studentgrade',
  templateUrl: './studentgrade.component.html',
  styleUrls: ['./studentgrade.component.scss']
})
export class StudentgradeComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paging: MatPaginator;
  ClassGroups = [];
  SubjectCategory = [];
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  StudentGradeListName = 'StudentGrades';
  Applications = [];
  loading = false;
  SelectedBatchId = 0;
  StudentGradeList: IStudentGrade[] = [];
  filteredOptions: Observable<IStudentGrade[]>;
  dataSource: MatTableDataSource<IStudentGrade>;
  allMasterData = [];
  StudentGrade = [];
  Permission = 'deny';
  Classes = [];
  ExamStatus = [];
  Exams = [];
  StudentGradeData = {
    StudentGradeId: 0,
    ExamId: 0,
    GradeName: '',
    Formula: '',
    ClassGroupId: 0,
    SubjectCategoryId: 0,
    GradeStatusId: 0,
    Sequence: 0,
    Points: 0,
    OrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns = [
    "StudentGradeId",
    "GradeName",
    "Points",
    "Formula",
    "ClassGroupId",
    "SubjectCategoryId",
    "Sequence",
    "Active",
    "Action"
  ];
  ExamNames = [];
  SelectedApplicationId = 0;
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
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
    //debugger;
    this.searchForm = this.fb.group({
      searchCopyExamId: [0],
      searchExamId: [0],
      searchClassGroupId: [0],
      searchSubjectCategoryId: [0]
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
      this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.EXAM.STUDENTGRADE);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {
        //this.nav.navigate(['/edu'])
      }
      else {

        this.GetMasterData();
        this.Getclassgroups();
      }
    }
  }

  AddNew() {

    var newdata = {
      StudentGradeId: 0,
      ExamId: this.searchForm.get("searchExamId").value,
      GradeName: '',
      Formula: '',
      ClassGroupId: this.searchForm.get("searchClassGroupId").value,
      SubjectCategoryId: this.searchForm.get("searchSubjectCategoryId").value,
      GradeStatusId: 0,
      Sequence: 0,
      Points: 0,
      Active: 0,
      Action: false
    };
    this.StudentGradeList = [];
    this.StudentGradeList.push(newdata);
    this.dataSource = new MatTableDataSource<IStudentGrade>(this.StudentGradeList);
    this.dataSource.paginator = this.paging;
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

          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  UpdateOrSave(row) {
    this.ToUpdateCount = 1;
    //debugger;
    this.loading = true;
    if (row.ClassGroupId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select class group.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.ExamId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select Exam.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    row.GradeName = globalconstants.encodeSpecialChars(row.GradeName);
    if (row.Sequence > 250) {
      this.loading = false;
      this.contentservice.openSnackBar("Sequence should not be greater than 250.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.Points > 250) {
      this.loading = false;
      this.contentservice.openSnackBar("Points should not be greater than 250.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    let checkFilterString = "GradeName eq '" + row.GradeName + "' and OrgId eq " + this.LoginUserDetail[0]["orgId"] +
      " and ClassGroupId eq " + row.ClassGroupId +
      " and ExamId eq " + row.ExamId;

    if (row.SubjectCategoryId == null || row.SubjectCategoryId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select subject category.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    checkFilterString += " and SubjectCategoryId eq " + row.SubjectCategoryId

    //+ " and BatchId eq " + this.SelectedBatchId;

    if (row.StudentGradeId > 0)
      checkFilterString += " and StudentGradeId ne " + row.StudentGradeId;
    let list: List = new List();
    list.fields = ["StudentGradeId"];
    list.PageName = this.StudentGradeListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.StudentGradeData.StudentGradeId = row.StudentGradeId;
          this.StudentGradeData.Active = row.Active;
          this.StudentGradeData.ExamId = row.ExamId;
          this.StudentGradeData.GradeName = row.GradeName;
          this.StudentGradeData.ClassGroupId = row.ClassGroupId;
          this.StudentGradeData.SubjectCategoryId = row.SubjectCategoryId;
          this.StudentGradeData.GradeStatusId = row.GradeStatusId;
          this.StudentGradeData.Formula = row.Formula;
          this.StudentGradeData.Sequence = row.Sequence;
          this.StudentGradeData.Points = row.Points;
          this.StudentGradeData.BatchId = this.SelectedBatchId;
          this.StudentGradeData.OrgId = this.LoginUserDetail[0]["orgId"];
          //console.log("this.StudentGradeData", this.StudentGradeData);
          if (this.StudentGradeData.StudentGradeId == 0) {
            this.StudentGradeData["CreatedDate"] = new Date();
            this.StudentGradeData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.StudentGradeData["UpdatedDate"] = new Date();
            delete this.StudentGradeData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.StudentGradeData["CreatedDate"];
            delete this.StudentGradeData["CreatedBy"];
            this.StudentGradeData["UpdatedDate"] = new Date();
            this.StudentGradeData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
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
    this.dataservice.postPatch(this.StudentGradeListName, this.StudentGradeData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.StudentGradeId = data.StudentGradeId;
          row.GradeName = globalconstants.decodeSpecialChars(row.GradeName);
          row.Action = false;
          this.ToUpdateCount = -1;
          if (this.ToUpdateCount == 0) {
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse()
          }
        });
  }
  update(row) {

    this.dataservice.postPatch(this.StudentGradeListName, this.StudentGradeData, this.StudentGradeData.StudentGradeId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          row.GradeName = globalconstants.decodeSpecialChars(row.GradeName);
          this.ToUpdateCount--;
          if (this.ToUpdateCount == 0) {
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse();
          }
        });
  }
  Getclassgroups() {
    this.contentservice.GetClassGroups(this.LoginUserDetail[0]['orgId'])
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.ClassGroups = [...data.value];
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
      });
  }
  DatafromotherexamMSG = '';
  CopyFromOtherExam() {
    debugger;
    var _copyFromExamId = this.searchForm.get("searchCopyExamId").value;
    var _examId = this.searchForm.get("searchExamId").value;
    if (_copyFromExamId == 0) {
      this.contentservice.openSnackBar("Please select exam to copy from.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_examId == 0) {
      this.contentservice.openSnackBar("Please select exam for which to define student grade.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.GetStudentGrade(_copyFromExamId);
  }
  ExamReleased = 0;
  GetStudentGrade(pCopyFromExamId) {

    this.loading = true;
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"]
    //" and BatchId eq " + this.SelectedBatchId;

    var _examId = this.searchForm.get("searchExamId").value;
    var _ClassGroupId = this.searchForm.get("searchClassGroupId").value;
    var _SubjectCategoryId = this.searchForm.get("searchSubjectCategoryId").value;
    if (pCopyFromExamId == 0 && _examId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select exam.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      var examObj = this.Exams.filter(e => e.ExamId == _examId)
      var _examName = '';
      if (examObj.length > 0) {
        _examName = examObj[0].ExamName;
        this.ExamReleased = examObj[0].ReleaseResult;
      }
      else
        this.ExamReleased = 0;
        
      if (pCopyFromExamId > 0) {
        this.DatafromotherexamMSG = "Data from '" + + "'";
        filterStr += ' and (ExamId eq ' + pCopyFromExamId + ' or ExamId eq ' + _examId + ')';
      } else
        filterStr += ' and ExamId eq ' + _examId;
    }

    if (_ClassGroupId > 0) {
      filterStr += " and ClassGroupId eq " + _ClassGroupId;
    }
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select class group.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_SubjectCategoryId > 0) {
      filterStr += " and SubjectCategoryId eq " + _SubjectCategoryId;
    }
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select subject category.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let list: List = new List();
    list.fields = [
      "StudentGradeId",
      "ExamId",
      "GradeName",
      "Formula",
      "SubjectCategoryId",
      "GradeStatusId",
      "ClassGroupId",
      "Sequence",
      "Points",
      "Active"];

    list.PageName = this.StudentGradeListName;
    list.filter = [filterStr];
    this.StudentGradeList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          var _CopyFromExam = [];
          var _SelectedExam = data.value.filter(d => d.ExamId == _examId);
          if (pCopyFromExamId > 0) {
            _CopyFromExam = data.value.filter(d => d.ExamId == pCopyFromExamId);
            this.StudentGradeList = _CopyFromExam.map(f => {
              f.GradeName = globalconstants.decodeSpecialChars(f.GradeName);
              //convert all examid to _examId
              f.ExamId = _examId;

              var existingstudentgrade = _SelectedExam.filter(s => s.ClassGroupId == _ClassGroupId && s.SubjectCategoryId == _SubjectCategoryId);
              if (existingstudentgrade.length > 0) {
                f.StudentGradeId = existingstudentgrade[0].StudentGradeId;
              }
              else {
                f.StudentGradeId = 0;
                f.Active = 0;
              }

              return f;
            });
          }
          else
            this.StudentGradeList = data.value.map(d => {
              d.GradeName = globalconstants.decodeSpecialChars(d.GradeName);
              return d;
            });
          this.StudentGradeList = this.StudentGradeList.sort((a, b) => a.Sequence - b.Sequence);
        }

        if (this.StudentGradeList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }
        this.dataSource = new MatTableDataSource<IStudentGrade>(this.StudentGradeList);
        this.dataSource.paginator = this.paging;
        this.loadingFalse();
      });
  }
  SelectAll(event) {
    //var event ={checked:true}
    this.StudentGradeList.forEach(element => {
      element.Active = 1;
      element.Action = true;
    })
  }
  ToUpdateCount = 0;
  SaveAll() {
    debugger;
    var toUpdate = this.StudentGradeList.filter(all => all.Action)
    this.ToUpdateCount = toUpdate.length;
    toUpdate.forEach(item => {
      this.UpdateOrSave(item);
    })
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.SubjectCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTCATEGORY)
        this.ExamStatus = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSTATUS);
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        //this.ClassGroups = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSGROUP)
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
          this.loading = false; this.PageLoading = false;
        });
        this.contentservice.GetExams(this.LoginUserDetail[0]['orgId'], this.SelectedBatchId)
          .subscribe((data: any) => {
            //this.Exams = [...data.value];
            this.Exams = [];
            data.value.forEach(e => {
              //var _examName = '';
              var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId && n.Active == 1)
              if (obj.length > 0) {
                //_examName = obj[0].MasterDataName
                this.Exams.push({
                  ExamId: e.ExamId,
                  ExamName: obj[0].MasterDataName,
                  ClassGroupId: e.ClassGroupId,
                  StartDate: e.StartDate,
                  EndDate: e.EndDate,
                  AttendanceStartDate: e.AttendanceStartDate,
                  Sequence: obj[0].Sequence,
                  ReleaseResult: e.ReleaseResult
                })
              }
            })
          })
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
export interface IStudentGrade {
  StudentGradeId: number;
  GradeName: string;
  Formula: string;
  SubjectCategoryId: number;
  GradeStatusId: number;
  ClassGroupId: number;
  Sequence: number;
  Points: number;
  Active: number;
  Action: boolean;
}
