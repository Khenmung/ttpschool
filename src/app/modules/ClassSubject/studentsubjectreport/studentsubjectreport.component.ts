import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import alasql from 'alasql';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-studentsubjectreport',
  templateUrl: './studentsubjectreport.component.html',
  styleUrls: ['./studentsubjectreport.component.scss']
})
export class StudentSubjectReportComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  PageLoading = true;
  ResultReleased = 0;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  ClassSubjects = [];
  AllowedSubjectIds = [];
  StandardFilterWithBatchId = '';
  loading = false;
  rowCount = 0;
  ExamStudentSubjectResult: IExamStudentSubjectResult[] = [];
  SelectedBatchId = 0;
  SelectedApplicationId = 0;
  //StoredForUpdate = [];
  SubjectMarkComponents = [];
  MarkComponents = [];
  Classes = [];
  //ClassGroups = [];
  Subjects = [];
  Sections = [];
  //ExamStatuses = [];
  //ExamNames = [];
  //Exams = [];
  Batches = [];
  StudentSubjects = [];
  SelectedClassSubjects = [];
  Students = [];
  dataSource: MatTableDataSource<IExamStudentSubjectResult>;
  allMasterData = [];
  Permission = 'deny';
  ExamId = 0;
  ExamStudentSubjectResultData = {
    ExamStudentSubjectResultId: 0,
    StudentClassId: 0,
    ExamId: 0,
    StudentClassSubjectId: 0,
    ClassSubjectMarkComponentId: 0,
    Marks: 0,
    Grade: '',
    ExamStatus: 0,
    OrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns = [
    'SubjectName',
    'SubjectCount'
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
      searchClassId: [0],
      searchSectionId: [''],
      searchClassSubjectId: [0],
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
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.EXAM.EXAMSTUDENTSUBJECTRESULT)
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
        this.GetStudents();
        //this.GetClassGroupMapping();
        //this.GetStudentGradeDefn();

      }
    }
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
  SubjectCount = [];
  // FilterClass() {
  //   var _examId = this.searchForm.get("searchExamId").value
  //   var _classGroupId = 0;
  //   var obj = this.Exams.filter(f => f.ExamId == _examId);
  //   if (obj.length > 0)
  //     _classGroupId = obj[0].ClassGroupId;
  //   this.FilteredClasses = this.ClassGroupMapping.filter(f => f.ClassGroupId == _classGroupId);
  //   this.SelectedClassStudentGrades = this.StudentGrades.filter(f => f.ClassGroupId == _classGroupId);
  // }
  GetStudentSubjects() {
    debugger;

    var _classId = this.searchForm.get("searchClassId").value;
    var _sectionId = this.searchForm.get("searchSectionId").value;
    var _classSubjectId = this.searchForm.get("searchClassSubjectId").value;
    //var _examId =this.searchForm.get("searchExamId").value
    // if (_examId == 0) {
    //   this.contentservice.openSnackBar("Please select exam", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    // if (_sectionId == 0) {
    //   this.contentservice.openSnackBar("Please select student section", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    // if (_classSubjectId == 0) {
    //   this.contentservice.openSnackBar("Please select subject", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }

    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    //var batchFilter = "BatchId eq " + this.SelectedBatchId;
    //var _classSubjectId = this.ClassSubjects.filter(c=>c.ClassId == _classId && c.SubjectId == _classSubjectId)[0].ClassSubjectId;
    if (_classSubjectId > 0)
      filterStr += " and ClassSubjectId eq " + _classSubjectId;
    filterStr += " and ClassId eq " + _classId;

    let list: List = new List();
    list.fields = [
      'ClassId', 'ClassSubjectId', 'SubjectId'
    ];
    list.PageName = "ClassSubjects"
    list.lookupFields = ["StudentClassSubjects($filter=Active eq 1 and BatchId eq " + this.SelectedBatchId + ";$select=StudentClassSubjectId,ClassSubjectId,StudentClassId,Active;$expand=StudentClass($select=StudentId,StudentClassId,SectionId))"]
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _class = '';
        var _subject = '';
        var _section = '';
        var _studname = '';

        this.StudentSubjects = [];
        var dbdata = [];

        //dbdata = data.value.filter(x =>x.StudentClassSubjects.filter(y=>y.StudentClass.SectionId == _sectionId).length>0)
        //console.log("this.StudentSubjects", this.StudentSubjects);
        data.value.forEach(s => {
          s.StudentClassSubjects.forEach(inner => {

            _class = '';
            _subject = '';
            _studname = '';
            //let _studentObj = this.Students.filter(c => c.StudentId == s.StudentClass.StudentId);
            //if (_studentObj.length > 0) {
            //  var _lastname = _studentObj[0].LastName == null || _studentObj[0].LastName == '' ? '' : " " + _studentObj[0].LastName;
            //  _studname = _studentObj[0].FirstName + _lastname;

            let _stdClass = this.Classes.filter(c => c.ClassId == s.ClassId);
            if (_stdClass.length > 0)
              _class = _stdClass[0].ClassName;

            let _stdSubject = this.Subjects.filter(c => c.MasterDataId == s.SubjectId);
            if (_stdSubject.length > 0)
              _subject = _stdSubject[0].MasterDataName;

            let _stdSection = this.Sections.filter(c => c.MasterDataId == inner.StudentClass.SectionId);
            if (_stdSection.length > 0)
              _section = _stdSection[0].MasterDataName;
            //if section is selected, item is taken only if section object length >0
            if (_sectionId > 0) {
              if (_stdSection.length > 0 && inner.StudentClass.SectionId == _sectionId) {
                this.StudentSubjects.push({
                  SubjectName: _subject,
                  ClassName: _class,
                  SectionName: _section,
                  SubjectId: s.SubjectId,
                  ClassId: s.ClassId,
                  StudentId: inner.StudentClass.StudentId,
                  SectionId: inner.StudentClass.SectionId,
                })
              }
            }
            else {
              this.StudentSubjects.push({
                SubjectName: _subject,
                ClassName: _class,
                SectionName: _section,
                SubjectId: s.SubjectId,
                ClassId: s.ClassId,
                StudentId: inner.StudentClass.StudentId,
                SectionId: inner.StudentClass.SectionId,
              })
            }
          })
        })
        //SubjectCount = [];
        this.displayedColumns = [
          'ClassName',
          'SectionName',
          'SubjectName',
          'SubjectCount'
        ];

        this.SubjectCount = alasql("select sum(1) SubjectCount,SubjectName,SectionName,ClassName from ? group by SubjectName,SectionName,ClassName", [this.StudentSubjects]);
        this.SubjectCount = this.SubjectCount.sort((a, b) => a.SubjectName - b.SubjectName)
        this.dataSource = new MatTableDataSource(this.SubjectCount);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
        this.PageLoading = false;
      }, error => {
        debugger;
        console.log(error)
      });
  }
  SelectClassSubject() {
    debugger;
    this.SelectedClassSubjects = this.ClassSubjects.filter(f => f.ClassId == this.searchForm.get("searchClassId").value);
    //this.GetSpecificStudentGrades();
  }
  GetStudents() {
    this.loading = true;
    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]

    let list: List = new List();
    list.fields = [
      "StudentId",
      "FirstName",
      "LastName"
    ];
    list.PageName = "Students";
    list.filter = [filterStr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Students = [...data.value];
        this.GetMasterData();
      });
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
        this.ClassSubjects = this.contentservice.getConfidentialData(this.tokenstorage, this.ClassSubjects,"ClassSubject");
        this.loading = false;
        this.PageLoading = false;
      })
  }
  GetSubjectMarkComponents(pClassSubjectId) {
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 and ClassSubjectId eq ' + pClassSubjectId;

    //filterstr = 'ExamId eq ' + this.searchForm.get("searchExamId").value;

    let list: List = new List();
    list.fields = [
      "ClassSubjectMarkComponentId",
      "ClassSubjectId",
      "ExamId",
      "SubjectComponentId",
      "FullMark",
      "PassMark",
      "Active"
    ];
    list.PageName = "ClassSubjectMarkComponents";
    list.lookupFields = ["ClassSubject($select=Active,ClassId,SubjectId)"];
    list.filter = [filterstr + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.SubjectMarkComponents = data.value.filter(x => x.ClassSubject.Active == 1)
        this.SubjectMarkComponents = this.SubjectMarkComponents.map(c => {
          var _sequence = 0;
          var _sequenceObj = this.MarkComponents.filter(s => s.MasterDataId == c.SubjectComponentId);
          if (_sequenceObj.length > 0) {
            _sequence = _sequenceObj[0].Sequence
          }
          return {
            "ClassSubjectMarkComponentId": c.ClassSubjectMarkComponentId,
            "ClassId": c.ClassSubject.ClassId,
            "SubjectId": c.ClassSubject.SubjectId,
            "ClassSubjectId": c.ClassSubjectId,
            "SubjectComponentId": c.SubjectComponentId,
            "Sequence": _sequence,
            "ExamId": c.ExamId,
            "FullMark": c.FullMark,
            "PassMark": c.PassMark,
          }
        });

        this.StudentSubjects.forEach(ss => {
          ss.Components = this.SubjectMarkComponents.filter(sc => sc.ClassSubjectId == ss.ClassSubjectId).sort((a, b) => a.Sequence - b.Sequence);
        })
        //this.GetExamStudentSubjectResults();
      })
  }
  // GetExamStudentSubjectResults() {
  //   debugger;
  //   //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
  //   this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
  //   this.ExamStudentSubjectResult = [];
  //   //this.StoredForUpdate = [];
  //   var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
  //   var filterstr = 'Active eq 1 ';
  //   // if (this.searchForm.get("searchExamId").value == 0) {
  //   //   this.contentservice.openSnackBar("Please select exam", globalconstants.ActionText, globalconstants.RedBackground);
  //   //   return;
  //   // }
  //   // var _classId =this.searchForm.get("searchClassId").value;
  //   // var _sectionId =this.searchForm.get("searchSectionId").value;

  //   // if (this.searchForm.get("searchClassId").value == 0) {
  //   //   this.contentservice.openSnackBar("Please select class", globalconstants.ActionText, globalconstants.RedBackground);
  //   //   return;
  //   // }
  //   // if (this.searchForm.get("searchSectionId").value == 0) {
  //   //   this.contentservice.openSnackBar("Please select student section", globalconstants.ActionText, globalconstants.RedBackground);
  //   //   return;
  //   // }
  //   // if (this.searchForm.get("searchSubjectId").value == 0) {
  //   //   this.contentservice.openSnackBar("Please select subject", globalconstants.ActionText, globalconstants.RedBackground);
  //   //   return;
  //   // }
  //   this.loading = true;
  //   //this.GetStudentSubjects(_classId,_sectionId);
  //   var _examId = this.searchForm.get("searchExamId").value;
  //   filterstr = 'ExamId eq ' + _examId;

  //   let list: List = new List();
  //   list.fields = [
  //     "ExamStudentSubjectResultId",
  //     "ExamId",
  //     "StudentClassId",
  //     "StudentClassSubjectId",
  //     "ClassSubjectMarkComponentId",
  //     "Marks",
  //     "Grade",
  //     "ExamStatus",
  //     "Active"
  //   ];
  //   list.PageName = "ExamStudentSubjectResults";
  //   list.lookupFields = ["ClassSubjectMarkComponent($select=ExamId,ClassSubjectId,SubjectComponentId,FullMark)"];
  //   list.filter = [filterstr + orgIdSearchstr];
  //   //list.orderBy = "ParentId";
  //   this.displayedColumns = [
  //     'StudentClassSubject',
  //   ];
  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       //debugger;
  //       var filteredStudentSubjects = this.StudentSubjects.filter(studentsubject => {
  //         return studentsubject.ClassId == this.searchForm.get("searchClassId").value
  //           && studentsubject.SubjectId == this.searchForm.get("searchSubjectId").value
  //           && studentsubject.SectionId == this.searchForm.get("searchSectionId").value
  //       });

  //       filteredStudentSubjects.forEach(studentsubject => {
  //         studentsubject.Components = studentsubject.Components.filter(c => c.ExamId == _examId)
  //       });

  //       var forDisplay;
  //       if (filteredStudentSubjects.length == 0 || filteredStudentSubjects[0].Components.length == 0) {
  //         this.loading = false; this.PageLoading = false;
  //         this.contentservice.openSnackBar("Student Subject/Subject components not defined for this class subject!", globalconstants.ActionText, globalconstants.RedBackground);
  //         this.dataSource = new MatTableDataSource<IExamStudentSubjectResult>([]);
  //         return;
  //       }
  //       filteredStudentSubjects.forEach(ss => {
  //         forDisplay = {
  //           StudentClassSubject: ss.StudentClassSubject,
  //           StudentClassSubjectId: ss.StudentClassSubjectId
  //         }

  //         ss.Components.forEach(component => {

  //           let existing = data.value.filter(db => db.StudentClassSubjectId == ss.StudentClassSubjectId
  //             && db.ClassSubjectMarkComponentId == component.ClassSubjectMarkComponentId);
  //           if (existing.length > 0) {
  //             var _ComponentName = this.MarkComponents.filter(c => c.MasterDataId == existing[0].ClassSubjectMarkComponent.SubjectComponentId)[0].MasterDataName;
  //             var _toPush;
  //             if (this.displayedColumns.indexOf(_ComponentName) == -1)
  //               this.displayedColumns.push(_ComponentName)
  //             _toPush = {
  //               ExamStudentSubjectResultId: existing[0].ExamStudentSubjectResultId,
  //               ExamId: existing[0].ExamId,
  //               ClassSubjectId: ss.ClassSubjectId,
  //               StudentClassId: existing[0].StudentClassId,
  //               StudentClassSubjectId: existing[0].StudentClassSubjectId,
  //               StudentClassSubject: ss.StudentClassSubject,
  //               ClassSubjectMarkComponentId: existing[0].ClassSubjectMarkComponentId,
  //               SubjectCategoryId: ss.SubjectCategoryId,
  //               SubjectMarkComponent: _ComponentName,
  //               FullMark: component.FullMark,
  //               PassMark: component.PassMark,
  //               Marks: existing[0].Marks,
  //               Grade: existing[0].Grade,
  //               ExamStatus: existing[0].ExamStatus,
  //               Active: existing[0].Active,
  //               Action: true
  //             }
  //             _toPush[_ComponentName] = existing[0].Marks;
  //             forDisplay[_ComponentName] = existing[0].Marks;

  //             this.StoredForUpdate.push(_toPush);
  //           }
  //           else {
  //             var _componentName = this.MarkComponents.filter(c => c.MasterDataId == component.SubjectComponentId)[0].MasterDataName;
  //             if (this.displayedColumns.indexOf(_componentName) == -1)
  //               this.displayedColumns.push(_componentName)
  //             _toPush = {
  //               ExamStudentSubjectResultId: 0,
  //               ExamId: this.searchForm.get("searchExamId").value,
  //               StudentClassSubjectId: ss.StudentClassSubjectId,
  //               ClassSubjectId: ss.ClassSubjectId,
  //               StudentClassId: ss.StudentClassId,
  //               SubjectCategoryId: ss.SubjectCategoryId,
  //               StudentClassSubject: ss.StudentClassSubject,
  //               ClassSubjectMarkComponentId: component.ClassSubjectMarkComponentId,
  //               SubjectMarkComponent: _componentName,
  //               FullMark: component.FullMark,
  //               PassMark: component.PassMark,
  //               Marks: 0,
  //               Grade: '',
  //               ExamStatus: 0,
  //               Active: 0,
  //               Action: true
  //             }
  //             _toPush[_componentName] = 0;
  //             forDisplay[_componentName] = 0;

  //             this.StoredForUpdate.push(_toPush);
  //           }
  //         })
  //         forDisplay["Action"] = '';
  //         this.ExamStudentSubjectResult.push(forDisplay);

  //       })
  //       this.ExamStudentSubjectResult = this.ExamStudentSubjectResult.sort((a, b) => a.StudentClassSubject.localeCompare(b.StudentClassSubject));
  //       console.log("this.ExamStudentSubjectResult", this.ExamStudentSubjectResult)
  //       this.displayedColumns.push("Action");
  //       this.dataSource = new MatTableDataSource<IExamStudentSubjectResult>(this.ExamStudentSubjectResult);
  //       this.loading = false; this.PageLoading = false;
  //     })
  // }
  StudentGrades = [];
  SelectedClassStudentGrades = [];
  ClassGroupMapping = [];
  // GetClassGroupMapping() {
  //   var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
  //   //+ ' and BatchId eq ' + this.SelectedBatchId;

  //   let list: List = new List();

  //   list.fields = ["ClassId,ClassGroupId"];
  //   list.PageName = "ClassGroupMappings";
  //   list.filter = ["Active eq 1" + orgIdSearchstr];
  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       this.ClassGroupMapping = [...data.value];
  //     })
  // }
  GetStudentGradeDefn() {
    this.contentservice.GetStudentGrade(this.LoginUserDetail[0]["orgId"])
      .subscribe((data: any) => {
        this.StudentGrades = [...data.value];
      })
    this.PageLoading = false;
  }
  // GetSpecificStudentGrades() {
  //   debugger;
  //   var _examId = this.searchForm.get("searchExamId").value;
  //   var _classGroupId = 0;

  //   if (_examId > 0) {
  //     var obj = this.Exams.filter(f => f.ExamId == _examId)
  //     if (obj.length > 0) {
  //       _classGroupId = obj[0].ClassGroupId;
  //       this.SelectedClassStudentGrades = this.StudentGrades.filter(f => f.ClassGroupId == _classGroupId);
  //     }
  //     else {
  //       this.contentservice.openSnackBar("Class group not found for selected class.", globalconstants.ActionText, globalconstants.RedBackground);
  //       return;
  //     }
  //   }
  // }

  checkall(value) {
    this.ExamStudentSubjectResult.forEach(record => {
      if (value.checked)
        record.Active = 1;
      else
        record.Active = 0;
      record.Action = !record.Action;
    })
  }

  SubjectCategory = [];
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
        //this.ExamStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSTATUS);
        // this.MarkComponents = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTMARKCOMPONENT);
        // this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        // this.SubjectCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTCATEGORY);
        // this.contentservice.GetClassGroups(this.LoginUserDetail[0]["orgId"])
        //   .subscribe((data: any) => {
        //     this.ClassGroups = [...data.value];
        //   });
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
          this.GetClassSubject();
        })

        //if role is teacher, only their respective class and subject will be allowed.
        if (this.LoginUserDetail[0]['RoleUsers'][0].role == 'Teacher') {
          this.GetAllowedSubjects();
        }

        //this.GetExams();

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
  // GetExams() {

  //   var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] +
  //     ' and BatchId eq ' + this.SelectedBatchId;

  //   let list: List = new List();

  //   list.fields = ["ExamId", "ExamNameId", "ReleaseResult", "ClassGroupId"];
  //   list.PageName = "Exams";
  //   list.filter = ["Active eq 1 " + orgIdSearchstr];

  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       this.Exams = [];
  //       data.value.forEach(e => {
  //         var _examName = '';
  //         var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
  //         if (obj.length > 0) {

  //           _examName = obj[0].MasterDataName;

  //           this.Exams.push({
  //             ExamId: e.ExamId,
  //             ExamName: _examName,
  //             ReleaseResult: e.ReleaseResult,
  //             ClassGroupId: e.ClassGroupId
  //           });
  //         }
  //       })
  //       this.PageLoading = false;
  //       //console.log("exams", this.Exams);
  //       //this.GetStudentSubjects();
  //     })
  // }

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
  StudentClassSubject: string;
  ClassSubjectMarkComponentId: number;
  SubjectMarkComponent: string;
  FullMark: number;
  PassMark: number;
  Marks: number;
  Grade: string;
  ExamStatus: number;
  Active: number;
  Action: boolean;
}


