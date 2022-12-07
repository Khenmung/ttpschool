import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import alasql from 'alasql';
import { evaluate, i } from 'mathjs';
import * as moment from 'moment';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'app-verifyresults',
  templateUrl: './verifyresults.component.html',
  styleUrls: ['./verifyresults.component.scss']
})
export class VerifyResultsComponent implements OnInit {

  @ViewChild(MatPaginator) nonGradingPaginator: MatPaginator;


  //@ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  PageLoading = true;
  AttendanceModes = [];
  SelectedClassAttendances = [];
  StudentAttendanceList = [];
  AttendanceStatusSum = [];
  AttendanceDisplay = '';
  ClassStrength = '';

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
  ExamClassGroups = [];
  StudentSubjects = [];
  SubjectCategory = [];
  dataSource: MatTableDataSource<IExamStudentSubjectResult>;
  GradingDataSource: MatTableDataSource<any[]>;
  allMasterData = [];
  Permission = 'deny';
  ExamId = 0;
  ClassSubjects = [];
  SectionSelected = true;
  ExamResultProperties = [];
  ExamNCalculate = [];
  ClassGroupIdOfExam = 0;
  FilteredClasses = [];
  ExamReleased = 0;

  ExamStudentSubjectResultData = {
    ExamStudentSubjectResultId: 0,
    ExamId: 0,
    StudentClassSubjectId: 0,
    ClassSubjectMarkComponentId: 0,
    Marks: 0,
    ActualMarks: 0,
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
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private route:Router,
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
    this.dataSource = new MatTableDataSource<IExamStudentSubjectResult>(this.ExamStudentSubjectResult);
    this.dataSource.paginator = this.nonGradingPaginator;//.toArray()[0];
    ////debugger;
    this.searchForm = this.fb.group({
      searchExamId: [0],
      searchClassId: [0],
      searchSectionId: [''],
      searchSubjectId: [0],
      viewMarkPercentCheckBox: [false]
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
        //this.GetExamClassGroup();

        //this.GetStudentAttendance();

      }
    }
  }
  FilterClass() {
    var _examId = this.searchForm.get("searchExamId").value
    //var _classGroupId = 0;
    this.ExamReleased = 0;
    this.contentservice.GetExamClassGroup(this.LoginUserDetail[0]['orgId'], _examId)
      .subscribe((data: any) => {
        this.ExamClassGroups = [...data.value];
        var objExamClassGroups = this.ExamClassGroups.filter(g => g.ExamId == _examId);
        this.FilteredClasses = this.ClassGroupMapping.filter(f => objExamClassGroups.findIndex(fi => fi.ClassGroupId == f.ClassGroupId) > -1);
      });

    var obj = this.Exams.filter(f => f.ExamId == _examId);
    if (obj.length > 0) {
      //this.ClassGroupIdOfExam = obj[0].ClassGroupId;     

      this.ExamReleased = obj[0].ReleaseResult;
    }

    //this.GetSelectedSubjectsForSelectedExam();

  }
  clear() {
    this.searchForm.patchValue({ searchExamId: 0 });
    this.searchForm.patchValue({ searchClassId: 0 });
    this.searchForm.patchValue({ searchSectionId: 0 });
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
      "SubjectTypeId",
      "Confidential"
    ];
    list.PageName = "ClassSubjects";
    list.filter = [filterStr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        this.ClassSubjects = data.value.map(cs => {
          var _class = '';
          var objclass = this.Classes.filter(c => c.ClassId == cs.ClassId)
          if (objclass.length > 0)
            _class = objclass[0].ClassName;

          var _subject = ''
          var objsubject = this.Subjects.filter(c => c.MasterDataId == cs.SubjectId)
          if (objsubject.length > 0)
            _subject = objsubject[0].MasterDataName;
          var _subjectType = '', _selectHowMany = 0;
          var objsubjectType = this.SubjectTypes.filter(c => c.SubjectTypeId == cs.SubjectTypeId)
          if (objsubjectType.length > 0) {
            _subjectType = objsubjectType[0].SubjectTypeName;
            _selectHowMany = objsubjectType[0].SelectHowMany;
          }

          return {
            ClassSubjectId: cs.ClassSubjectId,
            Active: cs.Active,
            SubjectId: cs.SubjectId,
            ClassId: cs.ClassId,
            Confidential: cs.Confidential,
            ClassSubject: _class + '-' + _subject,
            SubjectName: _subject,
            SubjectTypeId: cs.SubjectTypeId,
            SubjectType: _subjectType,
            SelectHowMany: _selectHowMany,
            SubjectCategoryId: cs.SubjectCategoryId
          }
        })
        this.ClassSubjects = this.contentservice.getConfidentialData(this.tokenstorage, this.ClassSubjects, "ClassSubject");
        this.loading = false;
      })
  }
  // GetExamClassGroup() {
  //   this.contentservice.GetExamClassGroup(this.LoginUserDetail[0]['orgId'])
  //     .subscribe((data: any) => {
  //       this.ExamClassGroups = [...data.value];
  //     });
  // }
  SelectedStudentClass = [];
  GetStudents(classId, pSectionId) {
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    var orgIdSearchstr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"] +
      ' and BatchId eq ' + this.SelectedBatchId + ' and Active eq 1';
    if (classId != undefined && classId > 0)
      orgIdSearchstr += ' and ClassId eq ' + classId
    if (pSectionId != undefined && pSectionId > 0)
      orgIdSearchstr += ' and SectionId eq ' + pSectionId

    let list: List = new List();
    list.fields = [
      "StudentClassId",
      "ClassId",
      "StudentId",
      "SectionId",
      "RollNo"
    ];
    list.PageName = "StudentClasses";
    //list.lookupFields = ["Student($select=Active,FirstName,LastName)"];
    list.filter = [orgIdSearchstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.SelectedStudentClass = [...data.value];
        this.Students = [];
        var studentList = this.tokenstorage.getStudents();
        var _students = studentList.filter(s => s["Active"] == 1 && data.value.findIndex(fi => fi.StudentId == s["StudentId"]) > -1)
        data.value.forEach(f => {
          var match = _students.filter(stud => stud["StudentId"] == f.StudentId)
          f.FirstName = match[0]["FirstName"];
          f.LastName = match[0]["LastName"];
          this.Students.push(f);
        })

        this.loading = false;
      })

  }
  Verified() {
    //debugger;
    var _classId = this.searchForm.get("searchClassId").value;
    if (_classId == 0) {
      this.contentservice.openSnackBar("Class Id is zero.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    if (this.ExamStudentSubjectResult.length == 0 && this.ExamStudentSubjectGrading.length == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("No data to verified.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      this.loading = true;
      var _examId = this.searchForm.get("searchExamId").value;
      var _ExamResultProperties = this.ExamNCalculate.filter(e => e.ExamId == _examId)
      if (_ExamResultProperties.filter(f => f.PropertyName.toLowerCase().includes('attendance')).length > 0) {
        this.GetStudentAttendance()
          .subscribe((attendance: any) => {
            this.StudentAttendanceList = [];
            //var classfilteredAttendance = attendance.value.filter(fil => this.SelectedStudentClass.findIndex(fdx => fdx.StudentClassId == fil.StudentClassId) > -1)
            attendance.value.forEach(main => {
              //var cls = this.SelectedStudentClass.filter(studcls => studcls.StudentClassId == att.StudentClassId)
              //if (att.StudentClass.ClassId == _classId) {
             // main.Attendances.forEach(att => {
                this.StudentAttendanceList.push({
                  AttendanceId: main.AttendanceId,
                  AttendanceStatus: main.AttendanceStatus,
                  AttendanceDate: main.AttendanceDate,
                  StudentClassId: main.StudentClassId,
                  ClassId: main.ClassId
                });
              //})
            });
            this.ProcessVerify();
          });
      }
      else {
        this.ProcessVerify();
      }
    }
  }
  ProcessVerify() {

    this.VerifiedResult.ExamStudentResult = [];
    var _examId = this.searchForm.get("searchExamId").value;
    var _TotalDays = 0;
    this.StudentAttendanceList.forEach(f => {
      f.AttendanceDate = moment(f.AttendanceDate).format('YYYY-MM-DD');
    })
    //var objExams = this.Exams.filter(ex => ex.ExamId == _examId);
    var distinctObj = alasql("select distinct AttendanceDate from ?", [this.StudentAttendanceList]);
    if (distinctObj.length > 0) {
      _TotalDays = distinctObj.length;
    }
    ////debugger;
    this.ExamStudentSubjectResult.forEach(d => {
      var _TotalPresent = 0;
      var attendancelist = this.StudentAttendanceList.filter(f => f.StudentClassId == d["StudentClassId"])
        .filter(f => f.AttendanceStatus == 1);
      _TotalPresent = attendancelist.reduce((acc, current) => acc + current.AttendanceStatus, 0);

      this.AttendanceDisplay = _TotalPresent + "/" + _TotalDays + ""
      if (this.ExamNCalculate.length > 0) {
        var _ExamResultProperties = this.ExamNCalculate.filter(e => e.ExamId == _examId)
        if (_ExamResultProperties.filter(f => f.PropertyName.toLowerCase().includes('rank')).length == 0)
          d["Rank"] = 0;
        if (_ExamResultProperties.filter(f => f.PropertyName.toLowerCase().includes('division')).length == 0)
          d["Division"] = ''
        if (_ExamResultProperties.filter(f => f.PropertyName.toLowerCase().includes('percentage')).length == 0)
          d["Percentage"] = '';
        if (_ExamResultProperties.filter(f => f.PropertyName.toLowerCase().includes('total')).length == 0)
          d["Total"] = '';
        if (_ExamResultProperties.filter(f => f.PropertyName.toLowerCase().includes('attendance')).length == 0)
          this.AttendanceDisplay = '';
        if (_ExamResultProperties.filter(f => f.PropertyName.toLowerCase().includes('class strength')).length == 0)
          this.ClassStrength = '';
      }
      else {
        d["Rank"] = 0;
        d["Division"] = ''
        d["Percentage"] = '';
        d["Total"] = '';
        this.AttendanceDisplay = '';
        this.ClassStrength = '';
      }

      this.VerifiedResult.ExamStudentResult.push({
        "ExamStudentResultId": 0,
        "ExamId": this.searchForm.get("searchExamId").value,
        "StudentClassId": d["StudentClassId"],
        "Rank": d["Rank"],
        "Division": d["Division"],
        "MarkPercent": +d["Percentage"],
        "TotalMarks": d["Total Percent"],
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
    //console.log("verifiedresult", this.VerifiedResult)
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
  GetExamNCalculate() {
    this.loading = true;
    let filterStr = "OrgId eq " + this.LoginUserDetail[0]["orgId"] + " and Active eq true"
    let list: List = new List();
    list.fields = ["*"];

    list.PageName = "ExamNCalculates";
    list.filter = [filterStr];
    this.ExamNCalculate = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.forEach(f => {
          var objProperty = this.ExamResultProperties.filter(p => p.MasterDataId == f.CalculateResultPropertyId)
          if (objProperty.length > 0)
            f.PropertyName = objProperty[0].MasterDataName;
          else
            f.PropertyName = '';

          var objExam = this.Exams.filter(e => e.ExamId == f.ExamId);
          if (objExam.length > 0) {
            f.ExamName = objExam[0].ExamName;
            this.ExamNCalculate.push(f);
          }
        })
      })
  }
  GetStudentSubjects() {
    debugger;
    this.ClickedVerified = false;
    var _examId = this.searchForm.get("searchExamId").value;
    if (_examId == 0) {
      this.contentservice.openSnackBar("Please select exam", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      this.ExamReleased = this.Exams.filter(f => f.ExamId == _examId)[0].ReleaseResult;
    }
    var _classId = this.searchForm.get("searchClassId").value;
    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _sectionId = this.searchForm.get("searchSectionId").value;


    this.loading = true;
    this.GetSpecificStudentGrades();
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    let filterStr = "OrgId eq " + this.LoginUserDetail[0]["orgId"] + " and BatchId eq " + this.SelectedBatchId + " and Active eq 1";
    filterStr += " and ClassId eq " + _classId
    if (_sectionId > 0) {
      this.SectionSelected = true;
      filterStr += " and SectionId eq " + _sectionId
      
    }
    else {
      this.SectionSelected = false;
      this.loading = false;
      this.contentservice.openSnackBar("Please select section.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
 
    let list: List = new List();
    list.fields = [
      //"StudentId", "RollNo", "SectionId", "ClassId", "StudentClassId"
      "StudentClassSubjectId,ClassSubjectId,StudentClassId,ClassId,SectionId,Active"
    ];

    list.PageName = "StudentClassSubjects"
    //list.limitTo=90;
    //list.lookupFields = ["StudentClassSubjects($filter=Active eq 1;$select=StudentClassSubjectId,ClassSubjectId,StudentClassId,Active)"];
    //list.lookupFields = ["ClassSubject($select=Active,SubjectId,SubjectTypeId,ClassId,SubjectCategoryId)",
    //"StudentClass($select=StudentId,RollNo,SectionId)"]
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _class = '';
        var _subject = '';
        var _section = '';
        this.StudentSubjects = [];
        //console.log("data.value",data.value)
        //var _data = data.value.filter(x => x.ClassSubject.Active == 1);
        //var _studentforselectedClass = this.Students.filter(stud => stud.StudentClasses && stud.StudentClasses[0].ClassId == _classId)
        data.value.forEach(s => {
          _class = '';
          _subject = '';
          //s.StudentClassSubjects.forEach(studsubj => {

          var _activeStudents = this.Students.filter(a => a.StudentClasses[0].StudentClassId == s.StudentClassId)
          if (_activeStudents.length > 0) {
            let _stdClass = this.Classes.filter(c => c.ClassId == s.ClassId);
            if (_stdClass.length > 0)
              _class = _stdClass[0].ClassName;
            var _subjectIdObj = this.ClassSubjects.filter(p => p.ClassSubjectId == s.ClassSubjectId)
            if (_subjectIdObj.length > 0) {
              let _stdSubject = this.Subjects.filter(c => c.MasterDataId == _subjectIdObj[0].SubjectId);
              if (_stdSubject.length > 0)
                _subject = _stdSubject[0].MasterDataName;

              let _stdSection = this.Sections.filter(c => c.MasterDataId == s.SectionId);
              if (_stdSection.length > 0)
                _section = _stdSection[0].MasterDataName;

              this.StudentSubjects.push({
                StudentClassSubjectId: s.StudentClassSubjectId,
                ClassSubjectId: _subjectIdObj[0].ClassSubjectId,
                StudentClassId: s.StudentClassId,
                RollNo: s.RollNo,
                SubjectId: _subjectIdObj[0].SubjectId,
                Subject: _subject,
                Section: _section,
                ClassId: s.ClassId,
                StudentId: s.StudentId,
                SectionId: s.SectionId,
                SubjectTypeId: _subjectIdObj[0].SubjectTypeId,
                SubjectType: _subjectIdObj[0].SubjectType,
                SelectHowMany: _subjectIdObj[0].SelectHowMany,
                SubjectCategoryId: _subjectIdObj[0].SubjectCategoryId,
                Active: s.Active
              });
            }
          }
          //})
        });
        this.GetExamStudentSubjectResults(_examId, _classId, _sectionId);
        this.contentservice.GetStudentClassCount(this.LoginUserDetail[0]['orgId'], _classId, _sectionId, this.SelectedBatchId)
          .subscribe((data: any) => {
            this.ClassStrength = data.value.length;
          })
      },error=>{
        console.log(error);
      });
  }

  GetExamStudentSubjectResults(pExamId, pClassId, pSectionId) {
    this.ClickedVerified = false;
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.ExamStudentSubjectResult = [];
    this.ExamStudentSubjectGrading = [];
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = "Active eq 1 and ExamId eq " + pExamId;

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
        ////debugger;

        var StudentOwnSubjects = [];

        if (pSectionId > 0) {
          StudentOwnSubjects = this.StudentSubjects.filter(studentsubject => {
            return studentsubject.ClassId == pClassId
              && studentsubject.SectionId == pSectionId;
          });
        }
        else {
          StudentOwnSubjects = this.StudentSubjects.filter(studentsubject => {
            return studentsubject.ClassId == pClassId
          });
        }

        var _examSubjectMarkComponentDefn = this.ClassSubjectComponents.filter(c => c.ClassId == pClassId && c.ExamId == pExamId);
        var filteredExistingComponentMarks = [];
        examComponentResult.value.forEach(d => {
          var present = _examSubjectMarkComponentDefn.filter(f => f.ClassSubjectMarkComponentId == d.ClassSubjectMarkComponentId)
          if (present.length > 0)
            filteredExistingComponentMarks.push(d);
        })
        this.ClassFullMark = 0;
        var ForGrading, ForNonGrading;

        StudentOwnSubjects.forEach(f => {
          var stud = this.Students.filter(s => s.StudentClasses[0].StudentClassId == f.StudentClassId);
          if (stud.length > 0) {
            var _lastname = stud[0].LastName == null ? '' : " " + stud[0].LastName;
            f.Student = stud[0].StudentClasses[0].RollNo + "-" + stud[0].FirstName + _lastname + "-" + f.Section;
          }
        })

        var filteredIndividualStud = alasql("select distinct Student,StudentClassId,FullMark from ? ", [StudentOwnSubjects]);
        var _subjectCategoryName = '';
        this.VerifiedResult.ExamResultSubjectMark = [];
        var errormessageforEachSubject = [];
        var viewMarkPercent = this.searchForm.get("viewMarkPercentCheckBox").value;

        /////////
        var subjectCount = 0;
        var _subjectCategoryMarkingId = 0;
        var _objSubjectCat = this.SubjectCategory.filter(f => f.MasterDataName.toLowerCase() == 'marking')
        if (_objSubjectCat.length > 0)
          _subjectCategoryMarkingId = _objSubjectCat[0].MasterDataId;
        var _noOfSubjectForAStudent = this.ClassSubjects.filter(allsubj => allsubj.SubjectCategoryId == _subjectCategoryMarkingId
          && allsubj.ClassId == pClassId)
        var SubjectCounts = alasql("select SubjectTypeId,SubjectType,SelectHowMany from ? ", [_noOfSubjectForAStudent])
        subjectCount = SubjectCounts.filter(com => com.SubjectType.toLowerCase() == 'compulsory').length;
        //var OtherthanCompulsory= SubjectCounts.filter(com=>com.SubjectType.toLowerCase() !='compulsory');
        var withoutCompulsory = this.SubjectTypes.filter(s => s.SubjectTypeName.toLowerCase() != 'compulsory');
        var subjectsWithNotCompulsory = SubjectCounts.filter(com => com.SubjectType.toLowerCase() != 'compulsory');
        var uniqueTypes = alasql("select distinct SubjectTypeId,SubjectType,SelectHowMany from ?", [subjectsWithNotCompulsory]);

        subjectsWithNotCompulsory = uniqueTypes.filter(sub => withoutCompulsory.findIndex(fi => fi.SubjectTypeId == sub.SubjectTypeId) > -1);
        subjectCount += subjectsWithNotCompulsory.reduce((acc, current) => acc + current.SelectHowMany, 0);

        console.log("_noOfSubjectForAStudent", subjectCount)
        this.ClassFullMark = subjectCount * 100;
        ////////  

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
            "Total Marks": 0,
            "Total Percent": 0,
            "Rank": 0,
            "Grade": 0,
            "Division": '',
            "FailCount": 0,
            "PassCount": 0,
            "FullMark": 0
          }

          var forEachSubjectOfStud = this.StudentSubjects.filter(s => s.Student == ss.Student)
          //var _subjectDetailToInsert ={}
          //this.ClassFullMark = 0;

          //console.log("forEachSubjectOfStud",forEachSubjectOfStud)
          ////debugger;
          // //preparing fullmark for all subjects
          // forEachSubjectOfStud.forEach(eachsubj => {

          //   //this.ClassFullMark is included only if subject category is marking.
          //   if (_subjectCategoryMarkingId == eachsubj.SubjectCategoryId) {

          //     var objFullMark = _examSubjectMarkComponentDefn.filter(c => c.ClassSubjectId == eachsubj.ClassSubjectId);
          //     if (objFullMark.length > 0)
          //       this.ClassFullMark += objFullMark.reduce((acc, current) => acc + current.FullMark, 0);
          //   }
          // })

          //ss.Student =='44-Niangkhandim -A' ||  || ss.Student =='22-David Khuplianmang -A' 
          // if (ss.Student == '39-K. Niangsuanching -A') {
          //   debugger;
          // }

          forEachSubjectOfStud.forEach(eachsubj => {

            var _objSubjectCategory = this.SubjectCategory.filter(f => f.MasterDataId == eachsubj.SubjectCategoryId)
            if (_objSubjectCategory.length > 0)
              _subjectCategoryName = _objSubjectCategory[0].MasterDataName.toLowerCase();

            var markObtained = alasql("select ExamId,StudentClassSubjectId,SUM(Marks) as Marks FROM ? where StudentClassSubjectId = ? GROUP BY StudentClassSubjectId,ExamId",
              [filteredExistingComponentMarks, eachsubj.StudentClassSubjectId]);
            var _subjectPassMarkFullMark = alasql("select ClassSubjectId,SUM(PassMark) as PassMark,SUM(FullMark) as FullMark,SUM(OverallPassMark) as OverallPassMark FROM ? where ClassSubjectId = ? GROUP BY ClassSubjectId",
              [_examSubjectMarkComponentDefn, eachsubj.ClassSubjectId]);
            if (_subjectPassMarkFullMark.length == 0) {
              if (!errormessageforEachSubject.includes(eachsubj.Subject))
                errormessageforEachSubject.push(eachsubj.Subject) //+= "\nComponent not defined for the subject: " + eachsubj.Subject;
              //this.contentservice.openSnackBar("Component not defined for the subject: " + eachsubj.Subject, globalconstants.ActionText, globalconstants.RedBackground);
              return;
            }
            else {
              var markPercent = 0;
              var failedInComponent = false;
              var subjectEachComponent = _examSubjectMarkComponentDefn.filter(comp => comp.PassMark > 0 && comp.ClassSubjectId == eachsubj.ClassSubjectId)
              subjectEachComponent.forEach(compmarkobtained => {
                let componentobtainedmark = filteredExistingComponentMarks.filter(eres => eres.StudentClassSubjectId == eachsubj.StudentClassSubjectId
                  && eres.ClassSubjectMarkComponentId == compmarkobtained.ClassSubjectMarkComponentId)
                //var componentPercent = (compmarkobtained.FullMark / _subjectPassMarkFullMark[0].FullMark) * 100;
                //markPercent += (componentobtainedmark[0].Marks / compmarkobtained.FullMark) * componentPercent;
                if (componentobtainedmark.length > 0) {
                  if (!failedInComponent && componentobtainedmark[0].Marks < compmarkobtained.PassMark) {
                    failedInComponent = true;
                  }
                }
                else
                  failedInComponent = true;
              })
              var subjectEachComponentWithPassmarkZero = _examSubjectMarkComponentDefn.filter(comp => comp.ClassSubjectId == eachsubj.ClassSubjectId)
              //console.log("_examSubjectMarkComponentDefn",_examSubjectMarkComponentDefn);
              subjectEachComponentWithPassmarkZero.forEach(compmarkobtained => {
                let componentobtainedmark = filteredExistingComponentMarks.filter(eres => eres.StudentClassSubjectId == eachsubj.StudentClassSubjectId
                  && eres.ClassSubjectMarkComponentId == compmarkobtained.ClassSubjectMarkComponentId)
                if (componentobtainedmark.length > 0) {
                  let fullmarkpercent = compmarkobtained.FullMark * 100;
                  let componentPercent = parseFloat((fullmarkpercent / _subjectPassMarkFullMark[0].FullMark).toFixed(5));
                  let dividend = (componentobtainedmark[0].Marks * componentPercent).toFixed(5);
                  markPercent = +parseFloat((markPercent + (parseFloat(dividend) / compmarkobtained.FullMark)) + "").toFixed(2);
                }
                ////////////////////added for component mark display
                if (subjectEachComponentWithPassmarkZero.length > 1) {
                  if (this.displayedColumns.indexOf(compmarkobtained.SubjectComponentName) == -1 && compmarkobtained.SubjectComponentName) {
                    this.displayedColumns.push(compmarkobtained.SubjectComponentName);
                  }
                  if (componentobtainedmark.length > 0)
                    ForNonGrading[compmarkobtained.SubjectComponentName] = componentobtainedmark[0].Marks;
                  else
                    ForNonGrading[compmarkobtained.SubjectComponentName] = 0;
                }
                /////////////////////
              })
              //console.log("markPercent",markPercent);
              var _statusFail = true;
              var ExamResultSubjectMarkData = {
                ExamResultSubjectMarkId: 0,
                StudentClassId: 0,
                ExamId: 0,
                StudentClassSubjectId: 0,
                Marks: 0,
                ActualMarks: 0,
                Grade: '',
                OrgId: 0,
                Active: 0,
                BatchId: 0
              }
              if (markObtained.length > 0) {

                ExamResultSubjectMarkData.Active = 1;
                ExamResultSubjectMarkData.BatchId = this.SelectedBatchId;
                ExamResultSubjectMarkData.ExamId = markObtained[0].ExamId;
                ExamResultSubjectMarkData.ExamResultSubjectMarkId = 0;
                ExamResultSubjectMarkData.Marks = markObtained[0].Marks;
                ExamResultSubjectMarkData.ActualMarks = markObtained[0].Marks;
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

                  if (!failedInComponent)//if passed in all components;
                    _statusFail = markObtained[0].Marks < _subjectPassMarkFullMark[0].OverallPassMark;

                  //_statusFail = ((markObtained[0].Marks * 100) / _subjectPassMarkFullMark[0].FullMark) < _subjectPassMarkFullMark[0].OverallPassMark

                  ForNonGrading["FullMark"] = this.ClassFullMark;

                  if (failedInComponent || _statusFail) {
                    ForNonGrading["FailCount"]++;
                  }
                  else
                    ForNonGrading["PassCount"]++;

                  if (this.displayedColumns.indexOf(eachsubj.Subject) == -1 && eachsubj.Subject.length > 0)
                    this.displayedColumns.push(eachsubj.Subject)
                  if (markObtained.length > 0) {
                    //var markConvertedto100Percent = '', 
                    var _processedmark = '';
                    // if (markObtained[0].Marks > 0)
                    //   markConvertedto100Percent = ((markObtained[0].Marks * 100) / _subjectPassMarkFullMark[0].FullMark).toFixed(2);
                    if (viewMarkPercent) {
                      _processedmark = markPercent + "";
                    }
                    else
                      _processedmark = markObtained[0].Marks;

                    ForNonGrading[eachsubj.Subject] = (failedInComponent || _statusFail) ? "(" + _processedmark + ")" : _processedmark;
                    ForNonGrading["Total Marks"] = (parseFloat(ForNonGrading["Total Marks"]) + parseFloat(markObtained[0].Marks)).toFixed(2);
                    ForNonGrading["Total Percent"] = (parseFloat(ForNonGrading["Total Percent"]) + markPercent).toFixed(2);
                  }
                }
              }
              else {
                ExamResultSubjectMarkData.Active = 1;
                ExamResultSubjectMarkData.BatchId = this.SelectedBatchId;
                ExamResultSubjectMarkData.ExamId = pExamId;
                ExamResultSubjectMarkData.ExamResultSubjectMarkId = 0;
                ExamResultSubjectMarkData.Marks = 0;
                ExamResultSubjectMarkData.ActualMarks = 0;
                ExamResultSubjectMarkData.OrgId = this.LoginUserDetail[0]['orgId'];
                ExamResultSubjectMarkData.StudentClassId = ss.StudentClassId;
                ExamResultSubjectMarkData.StudentClassSubjectId = eachsubj.StudentClassSubjectId;
                ExamResultSubjectMarkData.Grade = '';
                ForNonGrading[eachsubj.Subject] = 0;
              }
              //preparing each subject for insert.
              if (ExamResultSubjectMarkData != undefined)
                this.VerifiedResult.ExamResultSubjectMark.push(JSON.parse(JSON.stringify(ExamResultSubjectMarkData)))
            }
          })//for each subject of student.

          if (errormessageforEachSubject.length == 0) {
            //   this.contentservice.openSnackBar(errormessageforEachSubject, globalconstants.ActionText, globalconstants.RedBackground);
            // }
            // else {
            //for each subject display 
            this.ExamStudentSubjectResult.push(ForNonGrading);
            this.ExamStudentSubjectGrading.push(ForGrading);
          }
        })//for each student;

        if (errormessageforEachSubject.length > 0) {
          //var distinctsubjecterror = alasql("select ")
          this.loading = false;
          this.contentservice.openSnackBar("Subject component not defined for " + errormessageforEachSubject.join(', '), globalconstants.ActionText, globalconstants.RedBackground);
          return;
        }
        //for each student
        if (this.ExamStudentSubjectResult.length > 0) {
          //if (_subjectCategoryName == 'marking') {
          var _markingId = this.SubjectCategory.filter(f => f.MasterDataName.toLowerCase() == 'marking')[0].MasterDataId;
          this.displayedColumns.push("Total Marks", "Total Percent", "Percentage", "Rank", "Division");
          var _SelectedClassStudentGrades = this.SelectedClassStudentGrades.filter(f => f.SubjectCategoryId == _markingId);
          this.ExamStudentSubjectResult = this.ExamStudentSubjectResult.sort((a: any, b: any) => b["Total Percent"] - a["Total Percent"]);
          if (_SelectedClassStudentGrades.length > 0) {
            _SelectedClassStudentGrades.sort((a, b) => a.Sequence - b.Sequence);
            var rankCount = 0;
            var previousTotal = 0;
            this.ExamStudentSubjectResult.forEach((result: any, index) => {
              for (var i = 0; i < _SelectedClassStudentGrades.length; i++) {
                var formula = _SelectedClassStudentGrades[i].Formula
                  .replaceAll("[TotalMark]", result["Total Percent"])
                  //.replaceAll("[FullMark]", this.ClassFullMark[0].FullMark)
                  .replaceAll("[FullMark]", result.FullMark)
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

              result["Percentage"] = ((result["Total Percent"] / result.FullMark) * 100).toFixed(2);

              var _notToCalculateRankAndPercentage = ['fail', 'promoted'];
              if (!_notToCalculateRankAndPercentage.includes(result.Division.toLowerCase())) {
                //result["Percentage"] = ((result.Total / this.ClassFullMark[0].FullMark) * 100).toFixed(2);
                if (previousTotal != result["Total Percent"])
                  rankCount += 1;
                result.Rank = rankCount;
                previousTotal = result["Total Percent"]
              }
              // else
              //   result.Division = '';

            })
          }
          else {
            this.contentservice.openSnackBar("Student grade for marking not defined.", globalconstants.ActionText, globalconstants.RedBackground);

          }
          this.ExamStudentSubjectResult = this.ExamStudentSubjectResult.filter(f => f["Total Percent"] > 0);
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

        //console.log("this.ExamStudentSubjectResult", this.ExamStudentSubjectResult)
        var sortedresult = this.ExamStudentSubjectResult.filter(f => f.Rank != 0);
        var rankzero = this.ExamStudentSubjectResult.filter(f => f.Rank == 0);
        rankzero.forEach(zerorank => {
          sortedresult.push(zerorank);
        })

        this.ExamStudentSubjectResult = sortedresult;
        this.dataSource = new MatTableDataSource<IExamStudentSubjectResult>(this.ExamStudentSubjectResult);
        //this.dataSource.paginator = this.nonGradingPaginator;//.toArray()[0];
        //this.dataSource.sort = this.sort.toArray()[0];

        this.GradingDataSource = new MatTableDataSource<any[]>(this.ExamStudentSubjectGrading);
        //this.GradingDataSource.paginator = this.paginator.toArray()[1];
        //this.GradingDataSource.sort = this.sort.toArray()[1];

        this.loading = false;
        this.PageLoading = false;
        //console.log("ClickedVerified",this.ClickedVerified)
        //console.log("SectionSelected",this.SectionSelected)
        //console.log("this.ExamReleased",this.ExamReleased)
      })
    //})
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
  }


  GetMasterData() {

    this.allMasterData = this.tokenstorage.getMasterData();
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.ExamStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSTATUS);
    this.MarkComponents = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTMARKCOMPONENT);
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.AttendanceModes = this.getDropDownData(globalconstants.MasterDefinitions.school.ATTENDANCESMODE);
    this.SubjectCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTCATEGORY);
    this.ExamResultProperties = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMRESULTPROPERTY);
    this.GetSubjectTypes();

    this.GetClassGroup();
    this.GetClassGroupMapping();
    this.GetExams();
    //this.GetStudents(0);

    this.GetStudentGradeDefn();
    this.loading = false;
    this.PageLoading = false;
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
        //debugger;
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
        this.loading = false;
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
        //debugger;
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
                Sequence: m.Sequence
              })
          })
          f.grades = _grades.sort((a, b) => a.Sequence - b.Sequence);
          this.StudentGrades.push(f);
        })
      })
  }
  GetStudentGrade() {
    debugger;
    var _classId = this.searchForm.get("searchClassId").value;
    var _sectionId = this.searchForm.get("searchSectionId").value;
    if (_classId > 0 && _sectionId > 0) {
      this.SelectedClassAttendances = this.AttendanceStatusSum.filter(f => f.ClassId == _classId);
      var studentList: any = this.tokenstorage.getStudents();
      this.Students = studentList.filter(s =>
        s["Active"] == 1 && s.StudentClasses
        && s.StudentClasses.length > 0 && s.StudentClasses[0].ClassId == _classId && s.StudentClasses[0].SectionId == _sectionId

      );
      if(this.Students.length==0)
      {
        this.route.navigate(['/']);
      }
      //console.log("students",this.Students);
      // data.value.forEach(f => {
      //   var match = _students.filter(stud => stud["StudentId"] == f.StudentId)
      //   f.FirstName = match[0]["FirstName"];
      //   f.LastName = match[0]["LastName"];
      //   this.Students.push(f);
      // })
      //this.GetStudents(_classId, _sectionId)

    }
    this.FilterClass();

  }
  GetSpecificStudentGrades() {
    //debugger;
    var _classId = this.searchForm.get("searchClassId").value;
    var _examId = this.searchForm.get("searchExamId").value;
    var _classGroupId = 0;
    if (_classId > 0) {
      var obj = this.ClassGroupMapping.filter(f => f.ClassId == _classId)
      if (obj.length > 0) {
        //_classGroupId = obj[0].ClassGroupId;
        var relevantGroupForExam = this.ExamClassGroups.filter(e => e.ExamId == _examId && obj.findIndex(fi => fi.ClassGroupId == e.ClassGroupId) > -1)
        this.SelectedClassStudentGrades = this.StudentGrades.filter(f => f.ClassGroupId == relevantGroupForExam[0].ClassGroupId && f.ExamId == _examId);
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

    list.fields = [
      "ExamId", "ExamNameId", "ClassGroupId",
      "StartDate", "EndDate",
      "ReleaseResult", "AttendanceStartDate"];
    list.PageName = "Exams";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
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
              //AttendanceModeId: e.AttendanceModeId,
              Sequence: obj[0].Sequence,
              ReleaseResult: e.ReleaseResult
            })
          }
        })
        this.Exams = this.Exams.sort((a, b) => a.Sequence - b.Sequence);
        //this.GetTotalAttendance();
        this.GetExamNCalculate();
      })
  }
  TotalAttendance = [];
  // GetTotalAttendance() {

  //   let list: List = new List();
  //   list.fields = [
  //     "TotalAttendanceId",
  //     "ClassId",
  //     "ExamId",
  //     "TotalNoOfAttendance"
  //   ];

  //   list.PageName = "TotalAttendances";
  //   //list.lookupFields = ["Exam($select=Sequence,Active)"]
  //   list.filter = ["OrgId eq " + this.LoginUserDetail[0]["orgId"] +
  //     " and BatchId eq " + this.SelectedBatchId];
  //   // " and ClassId eq " + this.searchForm.get("searchClassId").value +
  //   // " and ExamId eq " + this.searchForm.get("searchExamId").value];

  //   this.dataservice.get(list)
  //     .subscribe((totalAttendance: any) => {
  //       this.TotalAttendance = [];
  //       totalAttendance.value.forEach(f => {
  //         var _exm = this.Exams.filter(e => e.ExamId == f.ExamId);
  //         if (_exm.length > 0) {
  //           f.Sequence = _exm[0].Sequence;
  //           this.TotalAttendance.push(f);
  //         }
  //       });
  //       this.TotalAttendance = this.TotalAttendance.sort((a, b) => a.Sequence - a.Sequence);
  //     });
  // }

  GetStudentAttendance() {
    //debugger;
    var _classId = this.searchForm.get("searchClassId").value;
    var _sectionId = this.searchForm.get("searchSectionId").value;
    let examObj = this.Exams.filter(e => e.ExamId == this.searchForm.get("searchExamId").value);
    var _filter = '';
    var _startDate, _endDate;
    if (examObj.length > 0 && examObj[0].AttendanceStartDate != null) {
      //console.log("examObj[0].AttendanceStartDate",examObj[0].AttendanceStartDate)
      _startDate = moment(examObj[0].AttendanceStartDate).format('YYYY-MM-DD');
      _endDate = moment(examObj[0].EndDate).format('YYYY-MM-DD');
      _filter = ' and AttendanceDate ge ' + _startDate + ' and AttendanceDate le ' + _endDate;


      let list: List = new List();
      list.fields = [
        //"ClassId,RollNo,SectionId"
        "AttendanceId,ClassId,SectionId,StudentClassId,AttendanceDate,AttendanceStatus"
      ];
      //list.PageName = "StudentClasses";
      //list.lookupFields = ["Attendances($filter=" + _filter + ";$select=AttendanceId,StudentClassId,AttendanceDate,AttendanceStatus)"];
      list.PageName = "Attendances";
      list.filter = ["OrgId eq " + this.LoginUserDetail[0]["orgId"] +
        " and ClassId eq " + _classId +
        " and SectionId eq " + _sectionId +
        " and BatchId eq " + this.SelectedBatchId + _filter];
      //  list.limitTo=10;

      return this.dataservice.get(list)
    }
    else {
      this.contentservice.openSnackBar("Invalid attendance start date.", globalconstants.ActionText, globalconstants.RedBackground);
      return EMPTY;
    }
  }
  SubjectTypes = [];
  GetSubjectTypes() {
    var orgIdSearchstr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"] + " and Active eq 1";
    this.loading = true;
    let list: List = new List();

    list.fields = ["SubjectTypeId", "SubjectTypeName", "SelectHowMany"];
    list.PageName = "SubjectTypes";
    list.filter = [orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        this.SubjectTypes = [...data.value];
        this.GetClassSubject();
        this.GetSubjectComponents();
      })
  }
  GetSubjectComponents() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    this.loading = true;
    let list: List = new List();

    list.fields = ["ClassSubjectMarkComponentId", "ExamId", "SubjectComponentId", "ClassSubjectId", "FullMark", "PassMark", "OverallPassMark"];
    list.PageName = "ClassSubjectMarkComponents";
    list.lookupFields = ["ClassSubject($filter=Active eq 1;$select=SubjectCategoryId,SubjectTypeId,ClassId,Active)"];
    list.filter = ["ExamId ne null and Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        this.ClassSubjectComponents = [];
        data.value.forEach(e => {
          var selectHowManyObj = this.SubjectTypes.filter(f => f.SubjectTypeId == e.ClassSubject.SubjectTypeId)
          var selectHowMany = 0;
          if (selectHowManyObj.length > 0)
            selectHowMany = selectHowManyObj[0].SelectHowMany;
          e.SubjectComponentName = this.MarkComponents.filter(c => c.MasterDataId == e.SubjectComponentId)[0].MasterDataName;
          e.ClassId = e.ClassSubject.ClassId;
          e.SubjectTypeId = e.ClassSubject.SubjectTypeId;
          e.SelectHowMany = selectHowMany;
          e.SubjectCategoryId = e.ClassSubject.SubjectCategoryId;
          if (e.ClassSubject.Active == 1)
            this.ClassSubjectComponents.push(e);
        })
        this.loading = false;
        this.PageLoading = false;
      })
  }

  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenstorage, this.allMasterData);
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


