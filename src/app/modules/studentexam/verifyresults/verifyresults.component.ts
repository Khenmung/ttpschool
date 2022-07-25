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
export class VerifyResultsComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  SelectedClassAttendances = [];
  StudentAttendanceList = [];
  AttendanceStatusSum = [];
  AttendanceDisplay = '';
  ClassStrength = 0;

  ClickedVerified = false;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  StandardFilterWithBatchId = '';
  loading = false;
  rowCount = 0;
  ExamStudentSubjectResult: IExamStudentSubjectResult[] = [];
  ExamStudentSubjectGrading: any[] = [];
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
  GradingDataSource: MatTableDataSource<any[]>;
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
  VerifiedResult = {
    "ExamStudentResult": [],
    "ExamResultSubjectMark": []
  }
  displayedColumns = [
    'Student',
  ];
  GradingDisplayedColumns = [
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
        this.GetStudentAttendance();
      }
    }
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
  clear() {
    this.searchForm.patchValue({ searchExamId: 0 });
    this.searchForm.patchValue({ searchClassId: 0 });
    this.searchForm.patchValue({ searchSectionId: 0 });
  }
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
    list.lookupFields = ["ClassSubject($select=Active,SubjectId,ClassId,SubjectCategoryId)",
      "StudentClass($select=StudentId,RollNo,SectionId)"]
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _class = '';
        var _subject = '';
        var _section = '';
        this.StudentSubjects = [];
        var _data = data.value.filter(x => x.ClassSubject.Active == 1);
        this.StudentSubjects = _data.map(s => {
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
            SectionId: s.StudentClass.SectionId,
            SubjectCategoryId: s.ClassSubject.SubjectCategoryId
          }

        })
        this.loading = false; this.PageLoading = false;
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
    debugger;
    if (this.ExamStudentSubjectResult.length == 0 && this.ExamStudentSubjectGrading.length == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("No data to verified.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      this.loading = true;
      this.VerifiedResult.ExamStudentResult = [];

      this.ExamStudentSubjectResult.forEach(d => {
        var _TotalDays = this.AttendanceStatusSum.reduce((result, curr) => result + curr.Total, 0) / this.ClassStrength;
        var _TotalPresent =0;
        var _TotalPresentObj = this.AttendanceStatusSum.filter(f => f.AttendanceStatus == 1 && f.StudentClassId == d["StudentClassId"])
        if (_TotalPresentObj.length > 0)
          _TotalPresent = _TotalPresentObj[0].Total;
        this.AttendanceDisplay = _TotalPresent + "/" + _TotalDays + ""

        this.VerifiedResult.ExamStudentResult.push({
          "ExamStudentResultId": 0,
          "ExamId": this.searchForm.get("searchExamId").value,
          "StudentClassId": d["StudentClassId"],
          "Rank": d["Rank"],
          "Division": d["Division"],
          "MarkPercent": +d["Percentage"],
          "TotalMarks": d["Total"],
          "Attendance": this.AttendanceDisplay,
          "ClassStrength": this.ClassStrength,
          "OrgId": this.LoginUserDetail[0]["orgId"],
          "BatchId": this.SelectedBatchId,
          "ExamStatusId": 0,
          "Active": 1,
          "FailCount": d["FailCount"],
          "PassCount": d["PassCount"]
        });

      })
      console.log("verifiedresult", this.VerifiedResult)
      this.dataservice.postPatch('ExamStudentResults', this.VerifiedResult, 0, 'post')
        .subscribe(
          (data: any) => {
            this.loading = false;
            this.PageLoading = false;
            this.ClickedVerified = true;
            this.contentservice.openSnackBar("Exam result verified.", globalconstants.ActionText, globalconstants.BlueBackground);
          }, error => {
            //console.log("error",error);
            this.contentservice.openSnackBar("Something went wrong. Please try again.", globalconstants.ActionText, globalconstants.RedBackground);
            this.loading = false; this.PageLoading = false;
          })
    }
  }
  GetExamStudentSubjectResults() {
    this.ClickedVerified = false;
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.ExamStudentSubjectResult = [];
    this.ExamStudentSubjectGrading = [];
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
    this.GradingDisplayedColumns = [
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
            var StudentOwnSubjects = [];
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
            var ForGrading, ForNonGrading;
            StudentOwnSubjects.forEach(f => {
              var stud = this.Students.filter(s => s.StudentClassId == f.StudentClassId);
              if (stud.length > 0)
                f.Student = stud[0].Student.FirstName + "-" + stud[0].Student.LastName;
            })

            var filteredIndividualStud = alasql("select distinct Student,StudentClassId from ? ", [StudentOwnSubjects]);
            var _subjectCategoryName = '';
            this.VerifiedResult.ExamResultSubjectMark = [];
            //for each student
            filteredIndividualStud.forEach(ss => {

              //intial columns
              ForGrading = {
                "StudentClassId": ss.StudentClassId,
                "Student": ss.Student,
                "Grade": 0
              }
              ForNonGrading = {
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
              //var _subjectDetailToInsert ={}

              forEachSubjectOfStud.forEach(eachsubj => {

                var _objSubjectCategory = this.SubjectCategory.filter(f => f.MasterDataId == eachsubj.SubjectCategoryId)
                if (_objSubjectCategory.length > 0)
                  _subjectCategoryName = _objSubjectCategory[0].MasterDataName.toLowerCase();

                var markObtained = alasql("select ExamId,StudentClassSubjectId,SUM(Marks) as Marks FROM ? where StudentClassSubjectId = ? GROUP BY StudentClassSubjectId,ExamId",
                  [examComponentResult.value, eachsubj.StudentClassSubjectId]);
                var _subjectPassMarkFullMark = alasql("select ClassSubjectId,SUM(PassMark) as PassMark,SUM(FullMark) as FullMark FROM ? where ClassSubjectId = ? GROUP BY ClassSubjectId",
                  [_classMarks, eachsubj.ClassSubjectId]);


                var _statusFail = true;

                if (markObtained.length > 0) {
                  var ExamResultSubjectMarkData = {
                    ExamResultSubjectMarkId: 0,
                    StudentClassId: 0,
                    ExamId: 0,
                    StudentClassSubjectId: 0,
                    Marks: 0,
                    Grade: '',
                    OrgId: 0,
                    Active: 0,
                    BatchId: 0
                  }
                  ExamResultSubjectMarkData.Active = 1;
                  ExamResultSubjectMarkData.BatchId = this.SelectedBatchId;
                  ExamResultSubjectMarkData.ExamId = markObtained[0].ExamId;
                  ExamResultSubjectMarkData.ExamResultSubjectMarkId = 0;
                  ExamResultSubjectMarkData.Marks = markObtained[0].Marks;
                  ExamResultSubjectMarkData.OrgId = this.LoginUserDetail[0]['orgId'];
                  ExamResultSubjectMarkData.StudentClassId = ss.StudentClassId;
                  ExamResultSubjectMarkData.StudentClassSubjectId = eachsubj.StudentClassSubjectId;
                  ExamResultSubjectMarkData.Grade = '';

                  if (_subjectCategoryName == 'grading') {

                    if (markObtained[0].Marks != undefined) {
                      //var rows = [];
                      //rows.push(markObtained[0]);

                      var _grade = this.SetGrade(markObtained, eachsubj.SubjectCategoryId);
                      markObtained[0].Grade = globalconstants.decodeSpecialChars(_grade);
                      ForGrading[eachsubj.Subject] = markObtained[0].Grade;
                      ExamResultSubjectMarkData.Grade = markObtained[0].Grade;
                    }
                    else
                      ForGrading[eachsubj.Subject] = '';

                    if (this.GradingDisplayedColumns.indexOf(eachsubj.Subject) == -1 && eachsubj.Subject.length > 0)
                      this.GradingDisplayedColumns.push(eachsubj.Subject)
                  }
                  else if (_subjectCategoryName == 'marking') {
                    _statusFail = ((markObtained[0].Marks * 100) / _subjectPassMarkFullMark[0].FullMark) < _subjectPassMarkFullMark[0].PassMark
                    if (_statusFail)
                      ForNonGrading["FailCount"]++;
                    else
                      ForNonGrading["PassCount"]++;

                    if (this.displayedColumns.indexOf(eachsubj.Subject) == -1 && eachsubj.Subject.length > 0)
                      this.displayedColumns.push(eachsubj.Subject)
                    if (markObtained.length > 0) {
                      ForNonGrading[eachsubj.Subject] = markObtained[0].Marks;
                      ForNonGrading["Total"] += +markObtained[0].Marks;
                    }
                  }
                }
                //preparing each subject for insert.
                if (ExamResultSubjectMarkData != undefined)
                  this.VerifiedResult.ExamResultSubjectMark.push(JSON.parse(JSON.stringify(ExamResultSubjectMarkData)))
              })
              //for each subject display 
              this.ExamStudentSubjectResult.push(ForNonGrading);
              this.ExamStudentSubjectGrading.push(ForGrading);
            })

            //for each student
            if (_subjectCategoryName == 'marking') {
              var _markingId = this.SubjectCategory.filter(f => f.MasterDataName.toLowerCase() == 'marking')[0].MasterDataId;
              this.displayedColumns.push("Total", "Percentage", "Rank", "Division");
              var _SelectedClassStudentGrades = this.SelectedClassStudentGrades.filter(f => f.SubjectCategoryId == _markingId);
              this.ExamStudentSubjectResult.sort((a: any, b: any) => b.Total - a.Total);
              if (_SelectedClassStudentGrades.length > 0) {
                _SelectedClassStudentGrades.sort((a, b) => a.Sequence - b.Sequence);
                var rankCount = 0;
                var previousTotal = 0;
                this.ExamStudentSubjectResult.forEach((result: any, index) => {
                  for (var i = 0; i < _SelectedClassStudentGrades.length; i++) {
                    var formula = _SelectedClassStudentGrades[i].Formula
                      .replaceAll("[TotalMark]", result.Total)
                      .replaceAll("[FullMark]", this.ClassFullMark[0].FullMark)
                      .replaceAll("[PassCount]", result.PassCount)
                      .replaceAll("[FailCount]", result.FailCount);

                    if (evaluate(formula)) {
                      //if (r.FailCount == 0) {
                      result.Grade = _SelectedClassStudentGrades[i].StudentGradeId;
                      result.Division = _SelectedClassStudentGrades[i].GradeName;
                      break;
                      //}
                    }
                  }

                  if (result.Division.length > 0) {
                    result["Percentage"] = ((result.Total / this.ClassFullMark[0].FullMark) * 100).toFixed(2);
                    if (previousTotal != result.Total)
                      rankCount++;
                    result.Rank = rankCount;
                  }
                  // else
                  //   result.Division = '';

                  previousTotal = result.Total
                })
              }
              else {
                this.contentservice.openSnackBar("Student grade not defined.", globalconstants.ActionText, globalconstants.RedBackground);

              }
              this.ExamStudentSubjectResult = this.ExamStudentSubjectResult.filter(f => f["Total"] > 0);
              this.ExamStudentSubjectResult.sort((a, b) => a.Rank - b.Rank)
            }

            if (this.ExamStudentSubjectResult.length == 0 || this.displayedColumns.length < 2) {
              this.ExamStudentSubjectResult = [];
            }
            if (this.GradingDisplayedColumns.length == 1)
              this.ExamStudentSubjectGrading = [];
            if (this.ExamStudentSubjectResult.length == 0 && this.ExamStudentSubjectGrading.length == 0) {
              this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
            }

            console.log("this.ExamStudentSubjectResult", this.ExamStudentSubjectResult)
            this.dataSource = new MatTableDataSource<IExamStudentSubjectResult>(this.ExamStudentSubjectResult);
            this.GradingDataSource = new MatTableDataSource<any[]>(this.ExamStudentSubjectGrading);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.loading = false; this.PageLoading = false;

          })
      })
  }
  SetGrade(pMarks: any[], gradingTypeId) {
    var _StudentGrade = '';
    var _gradeDefinitionsForSpecificSubjectCategory = this.SelectedClassStudentGrades.filter(f => f.SubjectCategoryId == gradingTypeId)
    if (_gradeDefinitionsForSpecificSubjectCategory.length > 0) {
      _gradeDefinitionsForSpecificSubjectCategory.sort((a, b) => a.Sequence - b.Sequence);
      pMarks.forEach((result: any) => {
        for (var i = 0; i < _gradeDefinitionsForSpecificSubjectCategory.length; i++) {
          var formula = _gradeDefinitionsForSpecificSubjectCategory[i].Formula
            .replaceAll("[Mark]", result.Marks)
          if (evaluate(formula)) {
            _StudentGrade = _gradeDefinitionsForSpecificSubjectCategory[i].GradeName;
            break;
          }
        }
      })
    }
    return _StudentGrade;
    // else {
    //   this.contentservice.openSnackBar("Student grade not defined.", globalconstants.ActionText, globalconstants.RedBackground);

    // }
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
        this.SubjectCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTCATEGORY);
        this.GetClassGroup();
        this.GetClassGroupMapping();
        this.GetExams();
        this.GetStudentSubjects();
        this.GetStudentGradeDefn();
      });
  }
  GetClassGroup() {
    this.contentservice.GetClassGroups(this.LoginUserDetail[0]["orgId"])
      .subscribe((data: any) => {
        this.ClassGroups = [...data.value];
      })
  }
  ClassGroupMapping = [];
  GetClassGroupMapping() {
    this.contentservice.GetClassGroupMapping(this.LoginUserDetail[0]["orgId"], 1)
      .subscribe((data: any) => {
        debugger;
        data.value.map(f => {
          f.ClassName = f.Class.ClassName;
          if (f.ClassGroup) {
            f.GroupName = f.ClassGroup.GroupName;
            this.ClassGroupMapping.push(f);

          }

        });
      })
  }
  GetStudentGradeDefn() {
    this.contentservice.GetStudentGrade(this.LoginUserDetail[0]["orgId"])
      .subscribe((data: any) => {
        this.StudentGrades = [...data.value];
      })
  }

  GetStudentGradeDefn_old(classgroupmapping) {
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"]
    //batch wise not necessary
    //+ ' and BatchId eq ' + this.SelectedBatchId;
    let list: List = new List();

    list.fields = ["StudentGradeId,GradeName,ClassGroupId,SubjectCategoryId,Formula,Sequence"];
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
                ClassGroupId: m.ClassGroupId,
                Sequence:m.Sequence
              })
          })
          f.grades = _grades.sort((a,b)=>a.Sequence - b.Sequence);
          this.StudentGrades.push(f);
        })
      })
  }
  GetStudentGrade() {
    debugger;
    var _classId = this.searchForm.get("searchClassId").value;
    if (_classId > 0) {
      this.SelectedClassAttendances = this.AttendanceStatusSum.filter(f => f.ClassId == _classId);
      this.contentservice.GetStudentClassCount(this.LoginUserDetail[0]['orgId'], _classId, this.SelectedBatchId)
        .subscribe((data: any) => {
          this.ClassStrength = data.value.length;
        })
    }
    this.FilterClass();
    //this.GetSpecificStudentGrades();
  }
  GetSpecificStudentGrades() {
    debugger;
    var _classId = this.searchForm.get("searchClassId").value;
    var _classGroupId = 0;
    if (_classId > 0) {
      var obj = this.ClassGroupMapping.filter(f => f.ClassId == _classId)
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
  GetExams() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId", "ClassGroupId"];
    list.PageName = "Exams";
    list.filter = ["Active eq 1 and (ReleaseResult eq 0 or ReleaseResult eq null) " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.forEach(e => {
          //var _examName = '';
          var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId)
          if (obj.length > 0) {
            //_examName = obj[0].MasterDataName
            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: obj[0].MasterDataName,
              ClassGroupId: e.ClassGroupId
            })
          }
        })
      })
  }
  GetStudentAttendance() {
    debugger;

    let list: List = new List();
    list.fields = [
      "AttendanceId",
      "StudentClassId",
      "AttendanceDate",
      "AttendanceStatus",
    ];
    list.PageName = "Attendances";
    list.lookupFields = ["StudentClass($select=ClassId,RollNo,SectionId)"];
    list.filter = ["OrgId eq " + this.LoginUserDetail[0]["orgId"] +
      " and StudentClassId ne null" +
      " and BatchId eq " + this.SelectedBatchId];

    this.dataservice.get(list)
      .subscribe((attendance: any) => {
        attendance.value.forEach(att => {
          this.StudentAttendanceList.push({
            AttendanceId: att.AttendanceId,
            StudentClassId: att.StudentClassId,
            AttendanceStatus: att.AttendanceStatus,
            AttendanceDate: att.AttendanceDate,
            ClassId: att.StudentClass.ClassId
          });
        });
        this.AttendanceStatusSum = alasql("select ClassId,StudentClassId,AttendanceStatus, count(AttendanceStatus) Total from ? group by ClassId,StudentClassId,AttendanceStatus",
          [this.StudentAttendanceList])

        this.loading = false;
        this.PageLoading = false;
      });
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
        this.loading = false; this.PageLoading = false;
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


