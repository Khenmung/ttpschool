import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
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
  ResultReleased = 0;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
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
    ExamStatus: 0,
    OrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns = [
    'StudentClassSubject',
  ];
  searchForm: FormGroup;
  constructor(
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    
    private contentservice: ContentService,
    private nav: Router,
    private fb: FormBuilder
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

        this.GetMasterData();

      }
    }
  }
  GetResultReleased(source) {
    this.ResultReleased = this.Exams.filter(e => e.ExamId == source.value)[0].ReleaseResult;
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
          this.contentservice.openSnackBar(globalconstants.DeletedMessage,globalconstants.ActionText,globalconstants.BlueBackground);

        });
  }
  UpdateOrSave(row) {

    //debugger;   
    if (row.Marks > 1000) {
      this.loading = false;
      this.contentservice.openSnackBar("Marks cannot be greater than 1000.", globalconstants.ActionText,globalconstants.RedBackground);
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
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.AddedMessage, globalconstants.RedBackground);
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
          ////console.log('data', this.ClassSubjectData);
          if (this.ExamStudentSubjectResultData.ExamStudentSubjectResultId == 0) {
            this.ExamStudentSubjectResultData["CreatedDate"] = new Date();
            this.ExamStudentSubjectResultData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ExamStudentSubjectResultData["UpdatedDate"] = new Date();
            delete this.ExamStudentSubjectResultData["UpdatedBy"];
            ////console.log('exam slot', this.ExamStudentSubjectResultData)
            this.insert(row);
          }
          else {
            delete this.ExamStudentSubjectResultData["CreatedDate"];
            delete this.ExamStudentSubjectResultData["CreatedBy"];
            this.ExamStudentSubjectResultData["UpdatedDate"] = new Date();
            this.ExamStudentSubjectResultData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('ExamStudentSubjectResults', this.ExamStudentSubjectResultData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ExamStudentSubjectResultId = data.ExamStudentSubjectResultId;
          this.loading = false;
          this.rowCount++;
          if (this.rowCount == this.displayedColumns.length - 2) {
            this.loading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          }
          //this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch('ExamStudentSubjectResults', this.ExamStudentSubjectResultData, this.ExamStudentSubjectResultData.ExamStudentSubjectResultId, 'patch')
      .subscribe(
        (data: any) => {
          //this.loading = false;
          this.rowCount++;
          if (this.rowCount == this.displayedColumns.length - 2) {
            this.loading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          }
          //this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
        });
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
    list.lookupFields = ["ClassSubject($select=SubjectId,ClassId)", "StudentClass($select=StudentId,RollNo,SectionId)"]
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
            StudentClassSubject: s.StudentClass.RollNo + ' - ' + _class + ' - ' + _section + ' - ' + _subject,
            SubjectId: s.ClassSubject.SubjectId,
            ClassId: s.ClassSubject.ClassId,
            StudentId: s.StudentClass.StudentId,
            SectionId: s.StudentClass.SectionId
          }

        })
        this.loading = false;
        this.GetSubjectMarkComponents();
      });
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
    list.lookupFields = ["ClassSubject($select=ClassId,SubjectId)"];
    list.filter = [filterstr + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.SubjectMarkComponents = data.value.map(c => {
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

    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.ExamStudentSubjectResult = [];
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 ';
    if (this.searchForm.get("searchExamId").value == 0) {
      this.contentservice.openSnackBar("Please select exam", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    if (this.searchForm.get("searchClassId").value == 0) {
      this.contentservice.openSnackBar("Please select class", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    if (this.searchForm.get("searchSectionId").value == 0) {
      this.contentservice.openSnackBar("Please select student section", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    if (this.searchForm.get("searchSubjectId").value == 0) {
      this.contentservice.openSnackBar("Please select subject", globalconstants.ActionText,globalconstants.RedBackground);
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
      "ExamStatus",
      "Active"
    ];
    list.PageName = "ExamStudentSubjectResults";
    list.lookupFields = ["ClassSubjectMarkComponent($select=ClassSubjectId,SubjectComponentId)"];
    list.filter = [filterstr + orgIdSearchstr];
    //list.orderBy = "ParentId";
    this.displayedColumns = [
      'StudentClassSubject',
    ];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        var filteredStudentSubjects = this.StudentSubjects.filter(studentsubject => {
          return studentsubject.ClassId == this.searchForm.get("searchClassId").value
            && studentsubject.SubjectId == this.searchForm.get("searchSubjectId").value
            && studentsubject.SectionId == this.searchForm.get("searchSectionId").value
        });
        var forDisplay;
        if (filteredStudentSubjects.length == 0 || filteredStudentSubjects[0].Components.length == 0) {
          this.loading = false;
          this.contentservice.openSnackBar("Student Subject/Subject components not defined for this class subject!", globalconstants.ActionText,globalconstants.RedBackground);
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
                SubjectMarkComponent: _ComponentName,
                FullMark: component.FullMark,
                PassMark: component.PassMark,
                Marks: existing[0].Marks,
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
                StudentClassSubject: ss.StudentClassSubject,
                ClassSubjectMarkComponentId: component.ClassSubjectMarkComponentId,
                SubjectMarkComponent: _componentName,
                FullMark: component.FullMark,
                PassMark: component.PassMark,
                Marks: 0,
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
        ////console.log('this.displayedColumns', this.displayedColumns);
        ////console.log('this.ExamStudentSubjectResult', this.ExamStudentSubjectResult);
        this.dataSource = new MatTableDataSource<IExamStudentSubjectResult>(this.ExamStudentSubjectResult);
        this.loading = false;
      })
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
        this.UpdateOrSave(record);
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

      var row: any = this.StoredForUpdate.filter(s => s.SubjectMarkComponent == prop && s.StudentClassSubjectId == element.StudentClassSubjectId);

      if (row.length > 0 && prop != 'StudentClassSubject' && prop != 'Action') {
        row[0].Active = 1;
        row[0].Marks = row[0][prop];
        this.UpdateOrSave(row[0]);
      }
    }
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
        this.ClassGroups = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSGROUP);
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
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
    list.filter = ['Active eq 1 and TeacherId eq ' + localStorage.getItem('nameId') + ' and OrgId eq ' + this.LoginUserDetail[0]['orgId']];
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

    list.fields = ["ExamId", "ExamNameId", "ReleaseResult"];
    list.PageName = "Exams";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Exams = data.value.map(e => {
          return {
            ExamId: e.ExamId,
            ExamName: this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId)[0].MasterDataName,
            ReleaseResult: e.ReleaseResult
          }
        })
        this.GetStudentSubjects();
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
  StudentClassSubject: string;
  ClassSubjectMarkComponentId: number;
  SubjectMarkComponent: string;
  FullMark: number;
  PassMark: number;
  Marks: number;
  ExamStatus: number;
  Active: number;
  Action: boolean;
}

