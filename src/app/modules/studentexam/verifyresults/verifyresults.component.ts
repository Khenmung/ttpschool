import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
import { evaluate, i } from 'mathjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-verifyresults',
  templateUrl: './verifyresults.component.html',
  styleUrls: ['./verifyresults.component.scss']
})
export class VerifyResultsComponent implements OnInit { PageLoading=true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ClickedVerified =false;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  StandardFilterWithBatchId = '';
  loading = false;
  rowCount = 0;
  ExamStudentSubjectResult: IExamStudentSubjectResult[] = [];
  ClassFullMark = 0;
  ClassSubjectComponents = [];
  SelectedBatchId = 0;
  SelectedApplicationId = 0;
  StoredForUpdate = [];
  SubjectMarkComponents = [];
  MarkComponents = [];
  StudentGrades = [];
  SelectedClassStudentGrades = [];
  Students = [];
  Classes = [];
  ClassGroups = [];
  Subjects = [];
  Sections = [];
  ExamStatuses = [];
  ExamNames = [];
  Exams = [];
  Batches = [];
  StudentSubjects = [];
  SubjectCategory = [];
  dataSource: MatTableDataSource<IExamStudentSubjectResult>;
  allMasterData = [];
  Permission = 'deny';
  ExamId = 0;
  ExamStudentSubjectResultData = {
    ExamStudentSubjectResultId: 0,
    ExamId: 0,
    StudentClassSubjectId: 0,
    ClassSubjectMarkComponentId: 0,
    Marks: 0,
    ExamStatus: 0,
    OrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns = [
    'Student',
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
    //debugger;
    this.searchForm = this.fb.group({
      searchExamId: [0],
      searchClassId: [0],
      searchSectionId: [''],
      searchSubjectId: [0],
    });
    this.PageLoad();
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.EXAM.VERIFYRESULT);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      //console.log('this.Permission', this.Permission)
      if (this.Permission != 'deny') {

        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
        });

        this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
        this.GetMasterData();

        this.GetSubjectComponents();
      }
    }
  }
  clear() { }
  GetStudentSubjects() {

    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
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
    list.lookupFields = ["ClassSubject($select=Active,SubjectId,ClassId)",
      "StudentClass($select=StudentId,RollNo,SectionId)"]
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _class = '';
        var _subject = '';
        var _section = '';
        this.StudentSubjects = data.value.filter(x => x.ClassSubject.Active == 1);
        this.StudentSubjects = this.StudentSubjects.map(s => {
          _class = '';
          _subject = '';

          let _stdClass = this.Classes.filter(c => c.ClassId == s.ClassSubject.ClassId);
          if (_stdClass.length > 0)
            _class = _stdClass[0].ClassName;

          let _stdSubject = this.Subjects.filter(c => c.MasterDataId == s.ClassSubject.SubjectId);
          if (_stdSubject.length > 0)
            _subject = _stdSubject[0].MasterDataName;

          let _stdSection = this.Sections.filter(c => c.MasterDataId == s.StudentClass.SectionId);
          if (_stdSection.length > 0)
            _section = _stdSection[0].MasterDataName;
          return {
            StudentClassSubjectId: s.StudentClassSubjectId,
            ClassSubjectId: s.ClassSubjectId,
            StudentClassId: s.StudentClassId,
            Student: s.StudentClass.RollNo,
            SubjectId: s.ClassSubject.SubjectId,
            Subject: _subject,
            ClassId: s.ClassSubject.ClassId,
            StudentId: s.StudentClass.StudentId,
            SectionId: s.StudentClass.SectionId
          }

        })
        this.loading = false; this.PageLoading=false;
      });
  }
  GetStudents(classId) {
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1';
    if (classId != undefined)
      filterstr += ' and ClassId eq ' + classId

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
  Verified() {
    
    var _resultToInsert = [];
    if (this.ExamStudentSubjectResult.length == 0) {
      this.loading = false; this.PageLoading=false;
      this.contentservice.openSnackBar("No data to verified.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      this.loading = true;
      this.ExamStudentSubjectResult.forEach(d => {

        _resultToInsert.push({
          "ExamStudentResultId": 0,
          "ExamId": this.searchForm.get("searchExamId").value,
          "StudentClassId": d["StudentClassId"],
          "Rank": d["Rank"],
          "Grade": d["Grade"],
          "MarkPercent": +d["Percentage"],
          "TotalMarks": d["Total"],
          "OrgId": this.LoginUserDetail[0]["orgId"],
          "BatchId": this.SelectedBatchId,
          "ExamStatusId": 0,
          "Active": 1,
          "FailCount": d["FailCount"],
          "PassCount": d["PassCount"]
        });

      })
      console.log("_resultToInsert", _resultToInsert)
      this.dataservice.postPatch('ExamStudentResults', _resultToInsert, 0, 'post')
        .subscribe(
          (data: any) => {
            this.loading = false; this.PageLoading=false;
            this.ClickedVerified =true;
            //row.Action = false;
            this.contentservice.openSnackBar("Exam result verified.", globalconstants.ActionText, globalconstants.BlueBackground);
          }, error => {
            //console.log("error",error);
            this.contentservice.openSnackBar("Something went wrong. Please try again.", globalconstants.ActionText, globalconstants.RedBackground);
            this.loading = false; this.PageLoading=false;
          })
    }
  }
  GetExamStudentSubjectResults() {
    this.ClickedVerified =false;
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.ExamStudentSubjectResult = [];
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 ';
    if (this.searchForm.get("searchExamId").value == 0) {
      this.contentservice.openSnackBar("Please select exam", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _classId = this.searchForm.get("searchClassId").value;
    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.loading = true;
    filterstr = 'ExamId eq ' + this.searchForm.get("searchExamId").value;

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
    //list.orderBy = "ParentId";
    this.displayedColumns = [
      'Student'
    ];
    this.dataservice.get(list)
      .subscribe((examComponentResult: any) => {
        debugger;

        var _classMarks = this.ClassSubjectComponents.filter(c => c.ClassId == _classId);
        if (_classMarks.length > 0) {
          this.ClassFullMark = alasql("select ClassId,sum(FullMark) as FullMark from ? group by ClassId", [_classMarks]);
        }
        this.GetStudents(_classId)
          .subscribe((data: any) => {
            this.Students = [...data.value];
            var StudentOwnSubjects;
            if (this.searchForm.get("searchSectionId").value != "") {
              StudentOwnSubjects = this.StudentSubjects.filter(studentsubject => {
                return studentsubject.ClassId == _classId
                  && studentsubject.SectionId == this.searchForm.get("searchSectionId").value
              });
            }
            else {
              StudentOwnSubjects = this.StudentSubjects.filter(studentsubject => {
                return studentsubject.ClassId == _classId
              });
            }
            var forDisplay;
            StudentOwnSubjects.forEach(f => {
              var stud = this.Students.filter(s => s.StudentClassId == f.StudentClassId);
              if (stud.length > 0)
                f.Student = f.Student + "-" + stud[0].Student.FirstName + "-" + stud[0].Student.LastName;
            })

            var filteredIndividualStud = alasql("select distinct Student,StudentClassId from ? ", [StudentOwnSubjects]);

            filteredIndividualStud.forEach(ss => {

              //intial columns
              forDisplay = {
                "StudentClassId": ss.StudentClassId,
                "Student": ss.Student,
                "Total": 0,
                "Rank": 0,
                "Grade": 0,
                "Division": '',
                "FailCount": 0,
                "PassCount": 0
              }
              var forEachSubjectOfStud = this.StudentSubjects.filter(s => s.Student == ss.Student)
              forEachSubjectOfStud.forEach(each => {

                var markObtained = alasql("select StudentClassSubjectId,SUM(Marks) as Marks FROM ? where StudentClassSubjectId = ? GROUP BY StudentClassSubjectId",
                  [examComponentResult.value, each.StudentClassSubjectId]);
                var _subjectPassMarkFullMark = alasql("select ClassSubjectId,SUM(PassMark) as PassMark,SUM(FullMark) as FullMark FROM ? where ClassSubjectId = ? GROUP BY ClassSubjectId",
                  [_classMarks, each.ClassSubjectId]);

                var _statusFail = true;
                if (markObtained.length > 0) {
                  _statusFail = ((markObtained[0].Marks * 100) / _subjectPassMarkFullMark[0].FullMark) < _subjectPassMarkFullMark[0].PassMark

                  if (_statusFail)
                    forDisplay["FailCount"]++;
                  else
                    forDisplay["PassCount"]++;
                }

                if (this.displayedColumns.indexOf(each.Subject) == -1 && each.Subject.length > 0)
                  this.displayedColumns.push(each.Subject)
                if (markObtained.length > 0) {
                  forDisplay[each.Subject] = markObtained[0].Marks;
                  forDisplay["Total"] += +markObtained[0].Marks;
                }
              })

              this.ExamStudentSubjectResult.push(forDisplay);
            })
            this.displayedColumns.push("Total","Percentage", "Rank", "Division");

            this.ExamStudentSubjectResult.sort((a: any, b: any) => b.Total - a.Total);
            if (this.SelectedClassStudentGrades.length > 0) {
              this.SelectedClassStudentGrades[0].grades.sort((a, b) => a.Sequence - b.Sequence);
              var rankCount = 0;
              this.ExamStudentSubjectResult.forEach((result: any, index) => {
                for (var i = 0; i < this.SelectedClassStudentGrades[0].grades.length; i++) {
                  var formula = this.SelectedClassStudentGrades[0].grades[i].Formula
                    .replaceAll("[TotalMark]", result.Total)
                    .replaceAll("[FullMark]", this.ClassFullMark[0].FullMark)
                    .replaceAll("[PassCount]", result.PassCount)
                    .replaceAll("[FailCount]", result.FailCount);

                  if (evaluate(formula)) {
                    //if (r.FailCount == 0) {
                    result.Grade = this.SelectedClassStudentGrades[0].grades[i].StudentGradeId;
                    result.Division = this.SelectedClassStudentGrades[0].grades[i].GradeName;
                    break;
                    //}
                  }
                }
                result["Percentage"] = ((result.Total / this.ClassFullMark[0].FullMark) * 100).toFixed(2);

                if (result.FailCount == 0) {
                  rankCount++;
                  result.Rank = rankCount;
                }
              })
            }
            else {
              this.contentservice.openSnackBar("Student grade not defined.", globalconstants.ActionText, globalconstants.RedBackground);

            }
            
            this.ExamStudentSubjectResult =this.ExamStudentSubjectResult.filter(f=>f["Total"]>0);
            if (this.ExamStudentSubjectResult.length == 0) {
              this.contentservice.openSnackBar("No Result found for this class/section.", globalconstants.ActionText, globalconstants.RedBackground);
            }

            this.ExamStudentSubjectResult.sort((a, b) => a.Rank - b.Rank)
            this.dataSource = new MatTableDataSource<IExamStudentSubjectResult>(this.ExamStudentSubjectResult);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.loading = false; this.PageLoading=false;
          })
      })
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
        this.ExamStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSTATUS);
        this.MarkComponents = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTMARKCOMPONENT);
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        //this.ClassGroups = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSGROUP);
        this.SubjectCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTCATEGORY);
        this.GetClassGroup();
        this.GetClassGroupMapping();
        //this.StudentGrades = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTGRADE);
        //this.shareddata.ChangeBatch(this.Batches);
        this.GetExams();
        this.GetStudentSubjects();
      });
  }
  GetClassGroup(){
    this.contentservice.GetClassGroups(this.LoginUserDetail[0]["orgId"])
    .subscribe((data:any)=>{
      this.ClassGroups = [...data.value];
    })
  }
  GetClassGroupMapping() {
    this.contentservice.GetClassGroupMapping(this.LoginUserDetail[0]["orgId"],1)
    .subscribe((data: any) => {
      this.GetStudentGradeDefn(data.value);
    })
    // var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"]; 
    // //+ ' and BatchId eq ' + this.SelectedBatchId;

    // let list: List = new List();

    // list.fields = ["ClassId,ClassGroupId"];
    // list.PageName = "ClassGroupMappings";
    // list.filter = ["Active eq 1" + orgIdSearchstr];
    // this.dataservice.get(list)
    //   .subscribe((data: any) => {
    //     this.GetStudentGradeDefn(data.value);
    //   })
  }
  GetStudentGradeDefn(classgroupmapping) {
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] 
    //batch wise not necessary
    //+ ' and BatchId eq ' + this.SelectedBatchId;
    let list: List = new List();

    list.fields = ["StudentGradeId,GradeName,ClassGroupId,SubjectCategoryId,Formula"];
    list.PageName = "StudentGrades";
    list.filter = ["Active eq 1" + orgIdSearchstr];
    this.StudentGrades = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        classgroupmapping.forEach(f => {
          var mapped = data.value.filter(d => d.ClassGroupId == f.ClassGroupId)
          var _grades = [];
          mapped.forEach(m => {
            _grades.push(
              {
                StudentGradeId: m.StudentGradeId,
                GradeName: m.GradeName,
                SubjectCategoryId: m.SubjectCategoryId,
                Formula: m.Formula,
                ClassGroupId: m.ClassGroupId
              })
          })
          f.grades = _grades;
          this.StudentGrades.push(f);
        })
      })
  }
  GetStudentGrade() {
    var _classId = this.searchForm.get("searchClassId").value;
    if (_classId > 0)
      this.SelectedClassStudentGrades = this.StudentGrades.filter(f => f.ClassId == _classId);
  }
  GetExams() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId"];
    list.PageName = "Exams";
    list.filter = ["Active eq 1 and (ReleaseResult eq 0 or ReleaseResult eq null) " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Exams = data.value.map(e => {
          return {
            ExamId: e.ExamId,
            ExamName: this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId)[0].MasterDataName
          }
        })
      })
  }
  GetSubjectComponents() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
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
        this.loading = false; this.PageLoading=false;
      })
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
export interface IExamStudentSubjectResult {
  ExamStudentSubjectResultId: number;
  ExamId: number;
  StudentClassSubjectId: number;
  Student: string;
  ClassSubjectMarkComponentId: number;
  SubjectMarkComponent: string;
  FullMark: number;
  PassMark: number;
  Marks: number;
  Rank: number;
  ExamStatus: number;
  Active: number;
  Action: boolean;
}


