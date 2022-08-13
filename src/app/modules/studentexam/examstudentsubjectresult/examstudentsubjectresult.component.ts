import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-examstudentsubjectresult',
  templateUrl: './examstudentsubjectresult.component.html',
  styleUrls: ['./examstudentsubjectresult.component.scss']
})
export class ExamstudentsubjectresultComponent implements OnInit {
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
  StoredForUpdate = [];
  SubjectMarkComponents = [];
  MarkComponents = [];
  Classes = [];
  ClassGroups = [];
  Subjects = [];
  Sections = [];
  ExamStatuses = [];
  ExamNames = [];
  Exams = [];
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
    'StudentClassSubject',
  ];
  searchForm: UntypedFormGroup;
  constructor(
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,

    private contentservice: ContentService,
    private nav: Router,
    private fb: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    debugger;
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
        this.GetClassGroupMapping();
        this.GetStudentGradeDefn();

      }
    }
  }
  GetResultReleased(source) {
    this.ResultReleased = this.Exams.filter(e => e.ExamId == source.value)[0].ReleaseResult;
    this.FilterClass();
  }
  updateActive(row, value) {
    //if(!row.Action)
    row.Action = !row.Action;
    row.Active = row.Active == 1 ? 0 : 1;
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
  UpdateOrSave(row, valuerow) {

    //debugger;   
    if (row.Marks > row.FullMark) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Marks cannot be greater than FullMark (" + row.FullMark + ").", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.Marks > 1000) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Marks cannot be greater than 1000.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.loading = true;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    let checkFilterString = "ExamId eq " + this.searchForm.get("searchExamId").value +
      " and StudentClassSubjectId eq " + row.StudentClassSubjectId +
      " and ClassSubjectMarkComponentId eq " + row.ClassSubjectMarkComponentId;


    if (row.ExamStudentSubjectResultId > 0)
      checkFilterString += " and ExamStudentSubjectResultId ne " + row.ExamStudentSubjectResultId;
    checkFilterString += " and " + this.StandardFilterWithBatchId;

    let list: List = new List();
    list.fields = ["ExamStudentSubjectResultId"];
    list.PageName = "ExamStudentSubjectResults";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          let _examstatus = 0;
          if (row.Marks >= row.PassMark)
            _examstatus = this.ExamStatuses.filter(f => f.MasterDataName.toLowerCase() == "pass")[0].MasterDataId;
          else
            _examstatus = this.ExamStatuses.filter(f => f.MasterDataName.toLowerCase() == "fail")[0].MasterDataId;

          this.ExamStudentSubjectResultData.ExamStudentSubjectResultId = row.ExamStudentSubjectResultId;
          this.ExamStudentSubjectResultData.ExamId = this.searchForm.get("searchExamId").value;
          this.ExamStudentSubjectResultData.StudentClassId = row.StudentClassId;
          this.ExamStudentSubjectResultData.Active = row.Active;
          this.ExamStudentSubjectResultData.StudentClassSubjectId = row.StudentClassSubjectId;
          this.ExamStudentSubjectResultData.ClassSubjectMarkComponentId = row.ClassSubjectMarkComponentId;
          this.ExamStudentSubjectResultData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ExamStudentSubjectResultData.BatchId = this.SelectedBatchId;
          this.ExamStudentSubjectResultData.ExamStatus = _examstatus;
          this.ExamStudentSubjectResultData.Marks = row.Marks;

          if (this.ExamStudentSubjectResultData.ExamStudentSubjectResultId == 0) {
            this.ExamStudentSubjectResultData["CreatedDate"] = new Date();
            this.ExamStudentSubjectResultData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ExamStudentSubjectResultData["UpdatedDate"] = new Date();
            delete this.ExamStudentSubjectResultData["UpdatedBy"];
            this.insert(row, valuerow);
          }
          else {
            delete this.ExamStudentSubjectResultData["CreatedDate"];
            delete this.ExamStudentSubjectResultData["CreatedBy"];
            this.ExamStudentSubjectResultData["UpdatedDate"] = new Date();
            this.ExamStudentSubjectResultData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row, valuerow);
          }
        }
      });
  }

  insert(row, valuerow) {

    //debugger;
    this.dataservice.postPatch('ExamStudentSubjectResults', this.ExamStudentSubjectResultData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ExamStudentSubjectResultId = data.ExamStudentSubjectResultId;
          valuerow.Action = false;

          this.loading = false; this.PageLoading = false;
          this.rowCount++;
          if (this.rowCount == this.displayedColumns.length - 2) {
            this.loading = false; this.PageLoading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
          //this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row, valuerow) {

    this.dataservice.postPatch('ExamStudentSubjectResults', this.ExamStudentSubjectResultData, this.ExamStudentSubjectResultData.ExamStudentSubjectResultId, 'patch')
      .subscribe(
        (data: any) => {
          //this.loading = false; this.PageLoading=false;
          valuerow.Action = false;
          this.rowCount++;
          if (this.rowCount == this.displayedColumns.length - 2) {
            this.loading = false; this.PageLoading = false;
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
  GetStudentSubjects() {
    debugger;
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
        var _studname = '';

        this.StudentSubjects = [];
        var dbdata = data.value.filter(x => x.ClassSubject.Active == 1)
        //console.log("this.StudentSubjects", this.StudentSubjects);
        dbdata.forEach(s => {
          _class = '';
          _subject = '';
          _studname = '';
          let _studentObj = this.Students.filter(c => c.StudentId == s.StudentClass.StudentId);
          if (_studentObj.length > 0) {
            _studname = _studentObj[0].FirstName + " " + _studentObj[0].LastName;

            let _stdClass = this.Classes.filter(c => c.ClassId == s.ClassSubject.ClassId);
            if (_stdClass.length > 0)
              _class = _stdClass[0].ClassName;

            let _stdSubject = this.Subjects.filter(c => c.MasterDataId == s.ClassSubject.SubjectId);
            if (_stdSubject.length > 0)
              _subject = _stdSubject[0].MasterDataName;

            let _stdSection = this.Sections.filter(c => c.MasterDataId == s.StudentClass.SectionId);
            if (_stdSection.length > 0)
              _section = _stdSection[0].MasterDataName;
            this.StudentSubjects.push({
              StudentClassSubjectId: s.StudentClassSubjectId,
              ClassSubjectId: s.ClassSubjectId,
              StudentClassId: s.StudentClassId,
              StudentClassSubject: s.StudentClass.RollNo + ' - ' + _studname + ' - ' + _class + ' - ' + _section + ' - ' + _subject,
              SubjectId: s.ClassSubject.SubjectId,
              ClassId: s.ClassSubject.ClassId,
              StudentId: s.StudentClass.StudentId,
              SectionId: s.StudentClass.SectionId,
              SubjectCategoryId: s.ClassSubject.SubjectCategoryId
            })
          }
        })
        console.log("this.StudentSubjects",this.StudentSubjects)
        this.loading = false; this.PageLoading = false;
        this.GetSubjectMarkComponents();
      });
  }
  SelectClassSubject() {
    debugger;
    this.SelectedClassSubjects = this.ClassSubjects.filter(f => f.ClassId == this.searchForm.get("searchClassId").value);
    //this.GetSpecificStudentGrades();
  }
  GetStudents() {

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
      "SubjectCategoryId"
    ];
    list.PageName = "ClassSubjects";
    list.filter = [filterStr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
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
            ClassSubject: _class + ' - ' + _subject,
            SubjectName: _subject,
            SubjectCategoryId: cs.SubjectCategoryId
          }
        })

      })
  }
  GetSubjectMarkComponents() {
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 ';

    //filterstr = 'ExamId eq ' + this.searchForm.get("searchExamId").value;

    let list: List = new List();
    list.fields = [
      "ClassSubjectMarkComponentId",
      "ClassSubjectId",
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
          return {
            "ClassSubjectMarkComponentId": c.ClassSubjectMarkComponentId,
            "ClassId": c.ClassSubject.ClassId,
            "SubjectId": c.ClassSubject.SubjectId,
            "ClassSubjectId": c.ClassSubjectId,
            "SubjectComponentId": c.SubjectComponentId,
            "FullMark": c.FullMark,
            "PassMark": c.PassMark,
          }
        });

        this.StudentSubjects.forEach(ss => {
          ss.Components = this.SubjectMarkComponents.filter(sc => sc.ClassSubjectId == ss.ClassSubjectId);
        })
      })
  }
  GetExamStudentSubjectResults() {
debugger;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.ExamStudentSubjectResult = [];
    this.StoredForUpdate = [];
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 ';
    if (this.searchForm.get("searchExamId").value == 0) {
      this.contentservice.openSnackBar("Please select exam", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (this.searchForm.get("searchClassId").value == 0) {
      this.contentservice.openSnackBar("Please select class", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (this.searchForm.get("searchSectionId").value == 0) {
      this.contentservice.openSnackBar("Please select student section", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (this.searchForm.get("searchSubjectId").value == 0) {
      this.contentservice.openSnackBar("Please select subject", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    filterstr = 'ExamId eq ' + this.searchForm.get("searchExamId").value;

    let list: List = new List();
    list.fields = [
      "ExamStudentSubjectResultId",
      "ExamId",
      "StudentClassId",
      "StudentClassSubjectId",
      "ClassSubjectMarkComponentId",
      "Marks",
      "Grade",
      "ExamStatus",
      "Active"
    ];
    list.PageName = "ExamStudentSubjectResults";
    list.lookupFields = ["ClassSubjectMarkComponent($select=ClassSubjectId,SubjectComponentId,FullMark)"];
    list.filter = [filterstr + orgIdSearchstr];
    //list.orderBy = "ParentId";
    this.displayedColumns = [
      'StudentClassSubject',
    ];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;\
        console.log("this.searchForm.get(searchClassId).value",this.searchForm.get("searchClassId").value);
        console.log("this.searchForm.get(searchSubjectId).value",this.searchForm.get("searchSubjectId").value);
        console.log("this.searchForm.get(searchSectionId).value",this.searchForm.get("searchSectionId").value);
        var filteredStudentSubjects = this.StudentSubjects.filter(studentsubject => {
          return studentsubject.ClassId == this.searchForm.get("searchClassId").value
            && studentsubject.SubjectId == this.searchForm.get("searchSubjectId").value
            && studentsubject.SectionId == this.searchForm.get("searchSectionId").value
        });
        var forDisplay;
        if (filteredStudentSubjects.length == 0 || filteredStudentSubjects[0].Components.length == 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar("Student Subject/Subject components not defined for this class subject!", globalconstants.ActionText, globalconstants.RedBackground);
          this.dataSource = new MatTableDataSource<IExamStudentSubjectResult>([]);
          return;
        }
        filteredStudentSubjects.forEach(ss => {
          forDisplay = {
            StudentClassSubject: ss.StudentClassSubject,
            StudentClassSubjectId: ss.StudentClassSubjectId
          }

          ss.Components.forEach(component => {

            let existing = data.value.filter(db => db.StudentClassSubjectId == ss.StudentClassSubjectId && db.ClassSubjectMarkComponentId == component.ClassSubjectMarkComponentId);
            if (existing.length > 0) {
              var _ComponentName = this.MarkComponents.filter(c => c.MasterDataId == existing[0].ClassSubjectMarkComponent.SubjectComponentId)[0].MasterDataName;
              var _toPush;
              if (this.displayedColumns.indexOf(_ComponentName) == -1)
                this.displayedColumns.push(_ComponentName)
              _toPush = {
                ExamStudentSubjectResultId: existing[0].ExamStudentSubjectResultId,
                ExamId: existing[0].ExamStudentResultId,
                ClassSubjectId: ss.ClassSubjectId,
                StudentClassId: existing[0].StudentClassId,
                StudentClassSubjectId: existing[0].StudentClassSubjectId,
                StudentClassSubject: ss.StudentClassSubject,
                ClassSubjectMarkComponentId: existing[0].ClassSubjectMarkComponentId,
                SubjectCategoryId: ss.SubjectCategoryId,
                SubjectMarkComponent: _ComponentName,
                FullMark: component.FullMark,
                PassMark: component.PassMark,
                Marks: existing[0].Marks,
                Grade: existing[0].Grade,
                ExamStatus: existing[0].ExamStatus,
                Active: existing[0].Active,
                Action: true
              }
              _toPush[_ComponentName] = existing[0].Marks;
              forDisplay[_ComponentName] = existing[0].Marks;

              this.StoredForUpdate.push(_toPush);
            }
            else {
              var _componentName = this.MarkComponents.filter(c => c.MasterDataId == component.SubjectComponentId)[0].MasterDataName;
              if (this.displayedColumns.indexOf(_componentName) == -1)
                this.displayedColumns.push(_componentName)
              _toPush = {
                ExamStudentSubjectResultId: 0,
                ExamId: this.searchForm.get("searchExamId").value,
                StudentClassSubjectId: ss.StudentClassSubjectId,
                ClassSubjectId: ss.ClassSubjectId,
                StudentClassId: ss.StudentClassId,
                SubjectCategoryId: ss.SubjectCategoryId,
                StudentClassSubject: ss.StudentClassSubject,
                ClassSubjectMarkComponentId: component.ClassSubjectMarkComponentId,
                SubjectMarkComponent: _componentName,
                FullMark: component.FullMark,
                PassMark: component.PassMark,
                Marks: 0,
                Grade: '',
                ExamStatus: 0,
                Active: 0,
                Action: true
              }
              _toPush[_componentName] = 0;
              forDisplay[_componentName] = 0;

              this.StoredForUpdate.push(_toPush);
            }
          })
          forDisplay["Action"] = '';
          this.ExamStudentSubjectResult.push(forDisplay);

        })

        this.displayedColumns.push("Action");
        this.dataSource = new MatTableDataSource<IExamStudentSubjectResult>(this.ExamStudentSubjectResult);
        this.loading = false; this.PageLoading = false;
      })
  }
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
    this.ExamStudentSubjectResult.forEach(record => {
      if (value.checked)
        record.Active = 1;
      else
        record.Active = 0;
      record.Action = !record.Action;
    })
  }
  saveall() {
    this.ExamStudentSubjectResult.forEach(record => {
      if (record.Action == true) {
        this.UpdateOrSave(record, record);
      }
    })
  }
  onBlur(element, event) {
    //debugger;
    var _colName = event.srcElement.name;
    ////console.log("event", event);
    var row = this.StoredForUpdate.filter(s => s.SubjectMarkComponent == _colName && s.StudentClassSubjectId == element.StudentClassSubjectId);
    row[0][_colName] = element[_colName];
    element.Action = true;
  }

  UpdateAll() {
    this.ExamStudentSubjectResult.forEach(element => {
      this.SaveRow(element);
    })
  }
  SaveRow(element) {
    //debugger;
    this.loading = true;
    this.rowCount = 0;
    //var columnexist;
    for (var prop in element) {

      var row: any = this.StoredForUpdate.filter(s => s.SubjectMarkComponent == prop
        && s.StudentClassSubjectId == element.StudentClassSubjectId);

      if (row.length > 0 && prop != 'StudentClassSubject' && prop != 'Action') {
        row[0].Active = 1;
        row[0].Marks = row[0][prop];
        this.UpdateOrSave(row[0], element);
      }
    }
  }
  SubjectCategory = [];
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

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId", "ReleaseResult", "ClassGroupId"];
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
              ClassGroupId: e.ClassGroupId
            });
          }
        })
        //console.log("exams", this.Exams);
        this.GetStudentSubjects();
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

