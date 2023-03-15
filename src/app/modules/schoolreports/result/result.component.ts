import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import alasql from 'alasql';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  SelectedClassStudentGrades = [];
  SelectedApplicationId = 0;
  StandardFilterWithBatchId = '';
  loading = false;
  rowCount = 0;
  ExamName = '';
  ClassName = '';
  ExamStudentResult: IExamStudentResult[] = [];
  ClassFullMark = 0;
  ClassSubjectComponents = [];
  SelectedBatchId = 0;SubOrgId = 0;
  StoredForUpdate = [];
  SubjectMarkComponents = [];
  MarkComponents = [];
  StudentGrades = [];
  Students = [];
  Classes = [];
  ClassGroups = [];
  Subjects = [];
  Sections = [];
  ExamStatuses = [];
  ExamNames = [];
  Exams = [];
  Batches = [];
  SubjectCategory = [];
  StudentSubjects = [];
  passdataSource: MatTableDataSource<IExamStudentResult>;
  promoteddataSource: MatTableDataSource<IExamStudentResult>;
  faildataSource: MatTableDataSource<IExamStudentResult>;
  AtAGlanceDatasource: MatTableDataSource<any>;
  allMasterData = [];
  Permission = 'deny';
  ExamId = 0;
  ExamStudentResultData = {
    ExamStudentResultId: 0,
    ExamId: 0,
    StudentClassId: 0,
    TotalMarks: 0,
    Grade: 0,
    Rank: 0,
    OrgId: 0,SubOrgId: 0,
    BatchId: 0,
    Active: 0,
    Action: false
  };
  displayedColumns = [
    "Rank",
    "Student",
    "Section",
    "RollNo",
    "TotalMarks",
    "Percent",
    "Division",

  ];
  failpromoteddisplayedColumns = [
    "Student",
    "Section",
    "RollNo",
    "TotalMarks",
    "Percent",
    "Division"
  ];
  AtAGlancedisplayedColumns = ["Text", "Val"];
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private nav: Router,
    private fb: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    //debugger;
    this.searchForm = this.fb.group({
      searchExamId: [0],
      searchClassId: [0],
      searchSectionId: ['']
    });
    this.PageLoad();
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
        this.SubOrgId = +this.tokenstorage.getSubOrgId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.REPORT.RESULT);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        debugger;
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
        });

        this.StandardFilterWithBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenstorage);
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
    list.lookupFields = ["ClassSubject($select=SubjectId,ClassId)",
      "StudentClass($select=StudentId,RollNo,SectionId)"]
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _class = '';
        var _subject = '';
        var _section = '';
        this.StudentSubjects = data.value.map(s => {
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
        this.loading = false; this.PageLoading = false;
      });
  }
  // GetStudents(classId) {
  //   //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
  //   var orgIdSearchstr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"] + 
  //   ' and BatchId eq ' + this.SelectedBatchId + ' and Active eq 1';
  //   //var filterstr = 'Active eq 1';
  //   if (classId != undefined)
  //   orgIdSearchstr += ' and ClassId eq ' + classId

  //   let list: List = new List();
  //   list.fields = [
  //     "StudentClassId",
  //     "ClassId",
  //     "StudentId"
  //   ];
  //   list.PageName = "StudentClasses";
  //   list.lookupFields = ["Student($select=FirstName,LastName)"];
  //   list.filter = [orgIdSearchstr];

  //   return this.dataservice.get(list);

  // }
  ResultAtAGlance = [];
  GetExamStudentResults() {

    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
        this.SubOrgId = +this.tokenstorage.getSubOrgId();
    this.ExamStudentResult = [];
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 ';
    var _examId = this.searchForm.get("searchExamId").value

    if (_examId == 0) {
      this.contentservice.openSnackBar("Please select exam", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _classId = this.searchForm.get("searchClassId").value;
    var _sectionId = this.searchForm.get("searchSectionId").value;
    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _section = '';
    if (_sectionId > 0) {
      _section = " " + this.Sections.filter(s => s.MasterDataId == _sectionId)[0].MasterDataName;
    }
    this.ClassName = this.Classes.filter(c => c.ClassId == _classId)[0].ClassName + _section;
    this.ExamName = "Exam: " + this.Exams.filter(c => c.ExamId == _examId)[0].ExamName;
    this.loading = true;

    filterstr = "ClassId eq " + _classId;
    if (_sectionId > 0) {
      filterstr += " and SectionId eq " + _sectionId
    }

    let list: List = new List();
    list.fields = [
      //"StudentId,ClassId,SectionId,RollNo"
    "ExamStudentResultId,ExamId,ClassId,SectionId,StudentClassId,TotalMarks,Division,MarkPercent,Rank,Active"
    ];
    //list.PageName = "StudentClasses";
    list.PageName = "ExamStudentResults";
    //list.lookupFields = ["ExamStudentResults($filter=ExamId eq " + _examId + ";$select=ExamStudentResultId,ExamId,StudentClassId,TotalMarks,Division,MarkPercent,Rank,Active)"];
    list.filter = [filterstr + orgIdSearchstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //console.log("examresults1",data.value);
        var _students: any = this.tokenstorage.getStudents();
        var classMarks = this.ClassSubjectComponents.filter(c => c.ClassId == _classId);
        if (classMarks.length > 0)
          this.ClassFullMark = alasql("select ClassId,sum(FullMark) as FullMark from ? group by ClassId", [classMarks]);
        //  console.log("data.value",data.value)
        this.ExamStudentResult = [];
        data.value.forEach(studcls => {
          var stud = _students.filter(st => st.StudentClasses.length>0 && st.StudentClasses[0].StudentClassId == studcls.StudentClassId)
          //studcls.forEach(res => {
            this.ExamStudentResult.push({
              ExamStudentResultId: studcls.ExamStudentResultId,
              ExamId: studcls.ExamId,
              StudentClassId: studcls.StudentClassId,
              Student: stud[0].FirstName + " " + (stud[0].LastName == null ? '' : stud[0].LastName),
              SectionId:studcls.SectionId,
              RollNo:stud[0].StudentClasses[0].RollNo,
              TotalMarks: studcls.TotalMarks,
              Division: studcls.Division,
              MarkPercent: studcls.MarkPercent,
              Rank: studcls.Rank,
              Active: studcls.Active,
              StudentClass: "",
              GradeId: 0,
              GradeType: ''
            })
          //})
        })

        //console.log("this.ExamStudentResult",this.ExamStudentResult);
        this.ExamStudentResult = this.ExamStudentResult.map((d:any) => {
          var _section = '';
          //var _gradeObj = this.SelectedClassStudentGrades[0].grades.filter(f => f.StudentGradeId == d.Grade);
          var _sectionObj = this.Sections.filter(s => s.MasterDataId == d["SectionId"]);
          if (_sectionObj.length > 0)
            _section = _sectionObj[0].MasterDataName;
          d["Section"] = _section;
          d["Percent"] = d["MarkPercent"];
          var _className = '';
          var _classObj = this.Classes.filter(s => s.ClassId == d.ClassId);
          if (_classObj.length > 0)
            _className = _classObj[0].ClassName;
          d["ClassName"] = _className;
          //d["RollNo"] = d.StudentClass["RollNo"];
          //var _lastname = d.Student.LastN == null ? '' : " " + d["Student"].LastName;
          //d["Student"] = d["Student"].FirstName + _lastname;
          return d;

        })

        //this.ResultAtAGlance.push(atAGlance)
        var PassStudent = this.ExamStudentResult.filter(p => p.Division.toLowerCase() != 'promoted' && p.Division.toLowerCase() != 'fail');
        var PromotedStudent = this.ExamStudentResult.filter(p => p.Division.toLowerCase() == 'promoted');
        var FailStudent = this.ExamStudentResult.filter(p => p.Division.toLowerCase() == 'fail');
        var NOOFSTUDENT = this.ExamStudentResult.length;
        var passPercentWSP = parseFloat("" + ((PassStudent.length + PromotedStudent.length) / NOOFSTUDENT) * 100).toFixed(2);
        var passPercentWithoutSP = parseFloat("" + (PassStudent.length / NOOFSTUDENT) * 100).toFixed(2);
        this.ResultAtAGlance = [];
        this.ResultAtAGlance.push(
          { "Text": "No. Of Student", "Val": NOOFSTUDENT },
          { "Text": "No. Of Student Pass", "Val": PassStudent.length },
          { "Text": "No. Of Student Fail", "Val": FailStudent.length },
          { "Text": "No. Of Student Simple Pass", "Val": PromotedStudent.length },
          { "Text": "Pass Percentage with s.p", "Val": passPercentWSP },
          { "Text": "Pass Percentage without s.p", "Val": passPercentWithoutSP }
        );

        this.AtAGlanceDatasource = new MatTableDataSource(this.ResultAtAGlance);
        var _rank = 0;
        var _previouspercent = 0;
        PassStudent = PassStudent.sort((a, b) => b["Percent"] - a["Percent"])
        PassStudent.forEach(p => {
          if (_previouspercent != p["Percent"]) {
            _rank+=1;
          }
          p.Rank = _rank;
          _previouspercent = p["Percent"];
        })
        this.ExamStudentResult = PassStudent.sort((a, b) => a.Rank - b.Rank)
        this.passdataSource = new MatTableDataSource(this.ExamStudentResult);
        this.passdataSource.paginator = this.paginator;
        this.passdataSource.sort = this.sort;

        this.promoteddataSource = new MatTableDataSource(PromotedStudent);
        this.faildataSource = new MatTableDataSource(FailStudent);
        this.loading = false; this.PageLoading = false;
      })
  }
  // GetClassGroupMapping() {
  //   var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"]
  //   //classgrouping is not batch wise
  //   //+ ' and BatchId eq ' + this.SelectedBatchId;

  //   let list: List = new List();

  //   list.fields = ["ClassId,ClassGroupId"];
  //   list.PageName = "ClassGroupMappings";
  //   list.filter = ["Active eq 1" + orgIdSearchstr];
  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       this.GetStudentGradeDefn(data.value);
  //     })
  // }
  GetStudentGradeDefn() {
    this.StudentGrades = [];
    this.contentservice.GetStudentGrade(this.LoginUserDetail[0]["orgId"])
      .subscribe((data: any) => {
        debugger;
        this.ClassGroupMapping.forEach(f => {
          var mapped = data.value.filter(d => d.ClassGroupId == f.ClassGroupId)
          var _grades = [];
          mapped.forEach(m => {
            _grades.push(
              {
                StudentGradeId: m.StudentGradeId,
                GradeName: m.GradeName,
                SubjectCategoryId: m.SubjectCategoryId,
                GradeType: this.SubjectCategory.filter(f => f.MasterDataId == m.SubjectCategoryId)[0].MasterDataName,
                Formula: m.Formula,
                ClassGroupId: m.ClassGroupId
              })
          })
          f.grades = _grades;
          this.StudentGrades.push(f);
        })
      })
  }

  GetSelectedClassStudentGrade() {
    debugger;
    var _classId = this.searchForm.get("searchClassId").value;
    if (_classId > 0)
      this.SelectedClassStudentGrades = this.StudentGrades.filter(f => f.ClassId == _classId);
  }
  ClassGroupMapping = [];
  FilteredClasses = [];
  GetClassGroupMapping() {
    this.contentservice.GetClassGroupMapping(this.LoginUserDetail[0]["orgId"], 1)
      .subscribe((data: any) => {
        this.ClassGroupMapping = data.value.map(f => {
          f.ClassName = f.Class.ClassName;
          return f;
        });
        this.GetStudentGradeDefn();
      })
  }
  // FilterClass() {
  //   debugger;
  //   var _examId = this.searchForm.get("searchExamId").value
  //   var _classGroupId = 0;
  //   var objExam = this.Exams.filter(f => f.ExamId == _examId);
  //   if (objExam.length > 0)
  //     _classGroupId = objExam[0].ClassGroupId;
  //   this.FilteredClasses = this.ClassGroupMapping.filter(f => f.ClassGroupId == _classGroupId);
  // }
  ExamReleased = 0;
  ExamClassGroups = [];
  FilterClass() {
    var _examId = this.searchForm.get("searchExamId").value
    //var _classGroupId = 0;
    this.ExamReleased = 0;
    this.contentservice.GetExamClassGroup(this.LoginUserDetail[0]['orgId'], _examId)
      .subscribe((data: any) => {
        this.ExamClassGroups = [...data.value];
        this.FilteredClasses = this.ClassGroupMapping.filter(f => this.ExamClassGroups.findIndex(fi => fi.ClassGroupId == f.ClassGroupId) > -1);
      });

    var obj = this.Exams.filter(f => f.ExamId == _examId);
    if (obj.length > 0) {
      this.ExamReleased = obj[0].ReleaseResult;
    }

  }
  GetMasterData() {

    this.allMasterData = this.tokenstorage.getMasterData();
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Sections =this.Sections.filter(s=>s.MasterDataName !='N/A');
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.ExamStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSTATUS);
    this.MarkComponents = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTMARKCOMPONENT);
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.SubjectCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTCATEGORY);
    this.Batches = this.tokenstorage.getBatches()
    this.contentservice.GetClassGroups(this.LoginUserDetail[0]["orgId"])
      .subscribe((data: any) => {
        this.ClassGroups = [...data.value];
      });
    this.GetExams();
    //this.GetStudentSubjects();
    this.GetClassGroupMapping();
  }

  GetExams() {

    this.contentservice.GetExams(this.LoginUserDetail[0]["orgId"],this.SubOrgId, this.SelectedBatchId,1)
      .subscribe((data: any) => {
        this.Exams = [];
        var result = data.value.filter(f => f.ReleaseResult == 1);
        result.map(e => {
          var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
          if (obj.length > 0)
            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: obj[0].MasterDataName,
              ClassGroupId: e.ClassGroupId
            })
        })
      })
  }
  GetSubjectComponents() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    this.loading = true;
    let list: List = new List();

    list.fields = ["ClassSubjectMarkComponentId", "SubjectComponentId", "ClassSubjectId", "FullMark"];
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
export interface IExamStudentResult {
  ExamStudentResultId: number;
  ExamId: number;
  StudentClassId: number;
  SectionId:number;
  RollNo:number;
  StudentClass: {},
  TotalMarks: number;
  MarkPercent: number;
  Division: string;
  GradeId: number;
  GradeType: string;
  Rank: number;
  Student: string;
  //OrgId: number;SubOrgId: number;
  //BatchId: number;
  Active: number;
  //Action: boolean

}



