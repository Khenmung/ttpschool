import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import alasql from 'alasql';
import { evaluate } from 'mathjs';
import * as moment from 'moment';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-exams',
  templateUrl: './exams.component.html',
  styleUrls: ['./exams.component.scss']
})
export class ExamsComponent implements OnInit {
@ViewChild(MatPaginator) paginator: MatPaginator;
@ViewChild(MatSort) sort: MatSort;
  PageLoading = true;
  AttendanceModes =[];
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  Students = [];
  StandardFilter = '';
  loading = false;
  Exams: IExams[] = [];
  SelectedBatchId = 0;
  ClassGroups = [];
  SelectedApplicationId = 0;
  StudentGradeFormula = [];
  ClassSubjectComponents = [];
  ExamNames = [];
  Batches = [];
  ExamModes = [];
  ExamStudentSubjectResult = [];
  dataSource: MatTableDataSource<IExams>;
  allMasterData = [];
  Permission = 'deny';
  ExamId = 0;
  ExamsData = {
    ExamId: 0,
    ExamNameId: 0,
    StartDate: Date,
    EndDate: Date,
    Sequence:0,
    ClassGroupId: 0,
    ReleaseResult: 0,
    ReleaseDate: null,
    AttendanceModeId: 0,
    OrgId: 0,
    BatchId: 0,
    Active: 1
  };
  displayedColumns = [
    'ExamId',
    'ExamName',
    'StartDate',
    'EndDate',
    'ClassGroupId',
    'Sequence',
    'AttendanceModeId',
    'ReleaseDate',
    'ReleaseResult',
    'Active',
    'Action'
  ];
  StudentSubjects = [];
  StudentGrades = [];
  constructor(
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,

    private route: ActivatedRoute,
    private nav: Router,
    private contentservice: ContentService,
    private datepipe: DatePipe
  ) { }

  ngOnInit(): void {
    //debugger;
    this.PageLoad()
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      var feature = globalconstants.AppAndMenuAndFeatures.edu.examination.exam;

      var perObj = globalconstants.getPermission(this.tokenstorage, feature);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission == 'deny')
        this.nav.navigate(['/auth/login']);
      else {
        this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
        this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
        this.GetMasterData();
        this.GetSubjectComponents();
        this.GetStudentSubjects();
      }
    }
  }
  addnew() {

    let toadd = {
      ExamId: 0,
      ExamNameId: 0,
      ExamName: '',
      StartDate: new Date(),
      EndDate: new Date(),
      Sequence:0,
      ClassGroupId: 0,
      ReleaseResult: 0,
      ReleaseDate: null,
      AttendanceModeId: 0,
      BatchId: 0,
      OrgId: 0,
      Active: 0,
      Action: false

    };
    this.Exams.push(toadd);
    this.dataSource = new MatTableDataSource<IExams>(this.Exams);

  }
  updateRelease(row, value) {
    row.Action = true;
    row.ReleaseResult = value.checked ? 1 : 0;
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
          // this.GetApplicationRoles();
          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  UpdateOrSave(row) {

    debugger;
    this.loading = true;

    let checkFilterString = "ExamNameId eq " + row.ExamNameId +
      " and BatchId eq " + this.SelectedBatchId 
      //" and Active eq 1"
      
      //" and StartDate gt " + this.datepipe.transform(row.StartDate, 'yyyy-MM-dd') +
      //" and EndDate lt " + this.datepipe.transform(row.EndDate, 'yyyy-MM-dd')

    if (row.ClassGroupId == 0 || row.ClassGroupId == null) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select class group.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.AttendanceModeId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select attendance mode.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.Sequence == 0 ) {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter sequence.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.ExamId > 0)
      checkFilterString += " and ExamId ne " + row.ExamId;
    checkFilterString += " and " + this.StandardFilter;
    let list: List = new List();
    list.fields = ["ExamId"];
    list.PageName = "Exams";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.ExamsData.ExamId = row.ExamId;
          this.ExamsData.Active = row.Active;
          this.ExamsData.ExamNameId = row.ExamNameId;
          this.ExamsData.StartDate = row.StartDate;
          this.ExamsData.EndDate = row.EndDate;
          this.ExamsData.Sequence = row.Sequence;
          this.ExamsData.ClassGroupId = row.ClassGroupId;
          this.ExamsData.AttendanceModeId = row.AttendanceModeId;
          this.ExamsData.ReleaseResult = row.ReleaseResult;
          this.ExamsData.BatchId = this.SelectedBatchId;
          if (row.ReleaseResult == 1) {
            row.ReleaseDate = this.datepipe.transform(new Date(), 'dd/MM/yyyy');
            this.ExamsData.ReleaseDate = new Date();
          }
          else
            this.ExamsData.ReleaseDate = null;

          this.ExamsData.OrgId = this.LoginUserDetail[0]["orgId"];
          if (this.ExamsData.ExamId == 0) {
            this.ExamsData["CreatedDate"] = new Date();
            this.ExamsData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.ExamsData["UpdatedDate"];
            delete this.ExamsData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.ExamsData["CreatedDate"];
            delete this.ExamsData["CreatedBy"];
            this.ExamsData["UpdatedDate"] = new Date();
            this.ExamsData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });

  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('Exams', this.ExamsData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          row.ExamId = data.ExamId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch('Exams', this.ExamsData, this.ExamsData.ExamId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          //this.GetExamStudentSubjectResults(this.ExamsData.ExamId, row);
        });
  }
  GetExams() {

    //var orgIdSearchstr = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);

    let list: List = new List();

    list.fields = [
      "ExamId", "ExamNameId", "StartDate","Sequence",
      "EndDate", "ClassGroupId", "AttendanceModeId",
      "ReleaseResult", "ReleaseDate", "OrgId", "BatchId", "Active"];
    list.PageName = "Exams";
    list.filter = ["OrgId eq " + this.LoginUserDetail[0]["orgId"] +
      " and BatchId eq " + this.SelectedBatchId];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //this.Exams = [...data.value];
        this.Exams = this.ExamNames.map(e => {
          let existing = data.value.filter(db => db.ExamNameId == e.MasterDataId);
          if (existing.length > 0) {
            if (existing[0].ReleaseDate != null)
              existing[0].ReleaseDate = moment(existing[0].ReleaseDate).format("DD/MM/yyyy");
            existing[0].ExamName = this.ExamNames.filter(f => f.MasterDataId == existing[0].ExamNameId)[0].MasterDataName;
            existing[0].Action = false;
            return existing[0];
          }
          else {
            return {
              ExamId: 0,
              ExamNameId: e.MasterDataId,
              ExamName: e.MasterDataName,
              AttendanceModeId: 0,
              StartDate: new Date(),
              EndDate: new Date(),
              Sequence:0,
              ReleaseResult: 0,
              ReleaseDate: null,
              OrgId: 0,
              ClassGroupId: 0,
              Active: 0,
              Action: false
            }
          }
        })
        ////console.log('this', this.Exams)
        this.Exams = this.Exams.sort((a, b) => {
          return b.Active - a.Active || a.Sequence - b.Sequence;
        })
        this.dataSource = new MatTableDataSource<IExams>(this.Exams);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false; this.PageLoading = false;
      },
      error=>console.log("error in exams fetching",error))
      
  }
  private getTime(date?: Date) {
    var std = new Date(date);
    return std != null ? std.getTime() : 0;
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        this.StudentGradeFormula = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTGRADE);
        this.StudentGrades = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTGRADE);
        this.AttendanceModes = this.getDropDownData(globalconstants.MasterDefinitions.school.ATTENDANCESMODE);
        this.GetClassGroup();
        this.GetExams();

      });
  }
  GetClassGroup() {
    this.contentservice.GetClassGroups(this.LoginUserDetail[0]["orgId"])
      .subscribe((data: any) => {
        this.ClassGroups = [...data.value];
      })
  }
  GetSubjectComponents() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];// + ' and BatchId eq ' + this.SelectedBatchId;
    this.loading = true;
    let list: List = new List();

    list.fields = ["ClassSubjectMarkComponentId", "SubjectComponentId", "ClassSubjectId", "FullMark", "PassMark"];
    list.PageName = "ClassSubjectMarkComponents";
    list.lookupFields = ["ClassSubject($filter=Active eq 1;$select=ClassId)"];
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        this.ClassSubjectComponents = data.value.map(e => {
          e.ClassId = e.ClassSubject.ClassId;
          return e;
        })
        this.loading = false; this.PageLoading = false;
      })
  }
  GetExamStudentSubjectResults(examId, row) {
    debugger;
    //this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.ExamStudentSubjectResult = [];
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = ' ';

    this.loading = true;
    filterstr = 'Active eq 1 and ExamId eq ' + examId;
    let list: List = new List();
    list.fields = [
      "ExamStudentSubjectResultId",
      "ExamId",
      "StudentClassSubjectId",
      "ClassSubjectMarkComponentId",
      "Marks",
      "ExamStatus",
      "Active"
    ];
    list.PageName = "ExamStudentSubjectResults";
    list.filter = [filterstr + orgIdSearchstr];
    this.dataservice.get(list)
      .subscribe((examComponentResult: any) => {
        debugger;
        var _ClassFullMark = [];
        //}
        this.GetStudents()
          .subscribe((data: any) => {
            this.Students = [...data.value];

            var forDisplay;

            var filteredIndividualStud = alasql("select distinct StudentClassId from ? ", [this.StudentSubjects]);

            filteredIndividualStud.forEach(ss => {

              //intial columns
              forDisplay = {
                "ExamStudentResultId": 0,
                "ExamId": examId,
                "StudentClassId": ss.StudentClassId,
                "Rank": 0,
                "TotalMarks": 0,
                "Grade": 0,
                "OrgId": this.LoginUserDetail[0]["orgId"],
                "BatchId": this.SelectedBatchId,
                "ExamStatusId": 0,
                "Active": row.ReleaseResult,
                "FailCount": 0,
                "PassCount": 0
              }
              var forEachSubjectOfStud = this.StudentSubjects.filter(s => s.StudentClassId == ss.StudentClassId)
              forEachSubjectOfStud.forEach(each => {

                _ClassFullMark = alasql("select ClassId,sum(FullMark) as FullMark from ? where ClassId = ? group by ClassId",
                  [this.ClassSubjectComponents, each.ClassId]);

                var markObtained = alasql("select StudentClassSubjectId,SUM(Marks) as Marks FROM ? where StudentClassSubjectId = ? GROUP BY StudentClassSubjectId",
                  [examComponentResult.value, each.StudentClassSubjectId]);
                var _subjectPassMarkFullMark = alasql("select ClassSubjectId,SUM(PassMark) as PassMark,SUM(FullMark) as FullMark FROM ? where ClassSubjectId = ? GROUP BY ClassSubjectId",
                  [this.ClassSubjectComponents, each.ClassSubjectId]);

                var _statusFail = true;
                if (markObtained.length > 0)
                  _statusFail = ((markObtained[0].Marks * 100) / _subjectPassMarkFullMark[0].FullMark) < _subjectPassMarkFullMark[0].PassMark

                if (_statusFail)
                  forDisplay["FailCount"]++;
                else
                  forDisplay["PassCount"]++;

                forDisplay["TotalMarks"] += +(markObtained.length > 0 ? markObtained[0].Marks : 0);

              })

              this.ExamStudentSubjectResult.push(forDisplay);
            })

            this.ExamStudentSubjectResult.sort((a: any, b: any) => b.TotalMarks - a.TotalMarks);
            this.StudentGrades.sort((a, b) => a.Sequence - b.Sequence);
            var rankCount = 0;
            this.ExamStudentSubjectResult.forEach((r: any, index) => {
              for (var i = 0; i < this.StudentGrades.length; i++) {
                var formula = this.StudentGrades[i].Logic
                  .replaceAll("[TotalMark]", r.TotalMarks)
                  .replaceAll("[FullMark]", _ClassFullMark.length > 0 ? _ClassFullMark[0].FullMark : 0)
                  .replaceAll("[PassCount]", r.PassCount)
                  .replaceAll("[FailCount]", r.FailCount);

                if (evaluate(formula)) {
                  r.Grade = this.StudentGrades[i].MasterDataId;
                  break;
                }
              }

              if (r.FailCount == 0) {
                rankCount++;
                r.Rank = rankCount;
              }
            })

            debugger;
            this.dataservice.postPatch('ExamStudentResults', this.ExamStudentSubjectResult, 0, 'post')
              .subscribe(
                (data: any) => {
                  this.loading = false; this.PageLoading = false;
                  row.Action = false;
                  this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
                }, error => {
                  this.contentservice.openSnackBar("Something went wrong. Please try again.", globalconstants.ActionText, globalconstants.RedBackground);
                  this.loading = false; this.PageLoading = false;
                })
          })
      })

  }
  GetStudentSubjects() {

    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    filterStr += ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();
    list.fields = [
      'StudentClassSubjectId',
      'ClassSubjectId',
      'StudentClassId',
      'Active'
    ];

    list.PageName = "StudentClassSubjects";
    list.lookupFields = ["ClassSubject($select=SubjectId,ClassId)",
      "StudentClass($select=StudentId,RollNo,SectionId)"]
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        this.StudentSubjects = data.value.map(s => {

          return {
            StudentClassSubjectId: s.StudentClassSubjectId,
            ClassSubjectId: s.ClassSubjectId,
            StudentClassId: s.StudentClassId,
            RollNo: s.StudentClass.RollNo,
            SubjectId: s.ClassSubject.SubjectId,
            ClassId: s.ClassSubject.ClassId,
            StudentId: s.StudentClass.StudentId,
            SectionId: s.StudentClass.SectionId
          }

        })
        this.loading = false; this.PageLoading = false;
      });
  }
  GetStudents() {
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1';

    let list: List = new List();
    list.fields = [
      "StudentClassId",
      "ClassId",
      "StudentId"
    ];
    list.PageName = "StudentClasses";
    list.lookupFields = ["Student($select=FirstName,LastName)"];
    list.filter = [filterstr + orgIdSearchstr];

    return this.dataservice.get(list);

  }
  onBlur(element) {
    element.Action = true;
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
export interface IExams {
  ExamId: number;
  ExamNameId: number;
  ExamName: string;
  StartDate: Date;
  EndDate: Date;
  Sequence:number;
  AttendanceModeId: number;
  ClassGroupId: number;
  ReleaseResult: number;
  ReleaseDate: Date;
  OrgId: number;
  BatchId: number;
  Active: number;
}
