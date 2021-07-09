import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-examstudentsubjectresult',
  templateUrl: './examstudentsubjectresult.component.html',
  styleUrls: ['./examstudentsubjectresult.component.scss']
})
export class ExamstudentsubjectresultComponent implements OnInit {

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
  StandardFilterWithBatchId = '';
  loading = false;
  ExamStudentSubjectResult: IExamStudentSubjectResult[] = [];
  SelectedBatchId = 0;
  SubjectMarkComponents = [];
  MarkComponents = [];
  Classes = [];
  ClassGroups = [];
  Subjects = [];
  ExamStatuses = [];
  ExamNames = [];
  Exams = [];
  Batches = [];
  StudentSubjects = [];
  dataSource: MatTableDataSource<IExamStudentSubjectResult>;
  allMasterData = [];

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
    'StudentClassSubject',
    'SubjectMarkComponent',
    'Marks',
    'ExamStatus',
    'Active',
    'Action'
  ];
  searchForm: FormGroup;
  constructor(
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
    private datepipe: DatePipe,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    debugger;
    this.searchForm = this.fb.group({
      searchExamId: [0],
      searchClassId: [0],
      searchSection: [''],
      searchSubjectId: [0],
    });

  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {

      this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);

      this.GetMasterData();
    }
  }
  // GetCurrentBatchIDnAssign() {
  //   let CurrentBatches = this.Batches.filter(b => b.MasterDataName == globalconstants.getCurrentBatch());
  //   if (CurrentBatches.length > 0) {
  //     this.SelectedBatchId = CurrentBatches[0].MasterDataId;
  //   }
  // }
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
          this.alert.success("Data deleted successfully.", this.optionAutoClose);

        });
  }
  UpdateOrSave(row) {

    debugger;
    // if(row.ExamDate ==null)
    // {
    //   this.alert.error("Exam date is mandatory!",this.optionAutoClose);
    //   return;
    // }
    // if(row.StartTime.length==0 || row.EndTime.length ==0)
    // {
    //   this.alert.error("Start time and end time are mandatory!",this.optionAutoClose);
    //   return;
    // }
    //if(row.)
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
        debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {
          let _examstatus = 0;
          if (row.Marks >= row.PassMark)
            _examstatus = this.ExamStatuses.filter(f => f.MasterDataName.toLowerCase() == "pass")[0].MasterDataId;
          else
            _examstatus = this.ExamStatuses.filter(f => f.MasterDataName.toLowerCase() == "fail")[0].MasterDataId;

          this.ExamStudentSubjectResultData.ExamStudentSubjectResultId = row.ExamStudentSubjectResultId;
          this.ExamStudentSubjectResultData.ExamId = this.searchForm.get("searchExamId").value;
          this.ExamStudentSubjectResultData.Active = row.Active;
          this.ExamStudentSubjectResultData.StudentClassSubjectId = row.StudentClassSubjectId;
          this.ExamStudentSubjectResultData.ClassSubjectMarkComponentId = row.ClassSubjectMarkComponentId;
          this.ExamStudentSubjectResultData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ExamStudentSubjectResultData.BatchId = this.SelectedBatchId;
          this.ExamStudentSubjectResultData.ExamStatus = _examstatus;
          this.ExamStudentSubjectResultData.Marks = row.Marks;
          //console.log('data', this.ClassSubjectData);
          if (this.ExamStudentSubjectResultData.ExamStudentSubjectResultId == 0) {
            this.ExamStudentSubjectResultData["CreatedDate"] = new Date();
            this.ExamStudentSubjectResultData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ExamStudentSubjectResultData["UpdatedDate"] = new Date();
            delete this.ExamStudentSubjectResultData["UpdatedBy"];
            //console.log('exam slot', this.ExamStudentSubjectResultData)
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

    debugger;
    this.dataservice.postPatch('ExamStudentSubjectResults', this.ExamStudentSubjectResultData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ExamStudentSubjectResultId = data.ExamStudentSubjectResultId;
          this.loading = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update(row) {

    this.dataservice.postPatch('ExamStudentSubjectResults', this.ExamStudentSubjectResultData, this.ExamStudentSubjectResultData.ExamStudentSubjectResultId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
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
      'Active',
      'ClassSubject/SubjectId',
      'ClassSubject/ClassId',
      'StudentClass/StudentId',
      'StudentClass/RollNo',
      'StudentClass/Section'
    ];

    list.PageName = "StudentClassSubjects";
    list.lookupFields = ["ClassSubject", "StudentClass"]
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _class = '';
        var _subject = '';
        this.StudentSubjects = data.value.map(s => {
          _class = '';
          _subject = '';

          let _stdClass = this.Classes.filter(c => c.MasterDataId == s.ClassSubject.ClassId);
          if (_stdClass.length > 0)
            _class = _stdClass[0].MasterDataName;

          let _stdSubject = this.Subjects.filter(c => c.MasterDataId == s.ClassSubject.SubjectId);
          if (_stdSubject.length > 0)
            _subject = _stdSubject[0].MasterDataName;

          return {
            StudentClassSubjectId: s.StudentClassSubjectId,
            ClassSubjectId: s.ClassSubjectId,
            StudentClassSubject: _class + ' - ' + s.StudentClass.RollNo + ' - ' + s.StudentClass.Section + ' - ' + _subject,
            SubjectId: s.ClassSubject.SubjectId,
            ClassId: s.ClassSubject.ClassId,
            StudentId: s.StudentClass.StudentId,
            Section: s.StudentClass.Section
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
      "Active",
      "ClassSubject/ClassId",
      "ClassSubject/SubjectId"
    ];
    list.PageName = "ClassSubjectMarkComponents";
    list.lookupFields = ["ClassSubject"];
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
      this.alert.info("Please select exam", this.optionAutoClose);
      return;
    }
    if (this.searchForm.get("searchClassId").value == 0) {
      this.alert.info("Please select class", this.optionAutoClose);
      return;
    }
    if (this.searchForm.get("searchSection").value == 0) {
      this.alert.info("Please enter student section", this.optionAutoClose);
      return;
    }
    if (this.searchForm.get("searchSubjectId").value == 0) {
      this.alert.info("Please select subject", this.optionAutoClose);
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
      "Active",
      //"Exam/ExamNameId",
      "ClassSubjectMarkComponent/SubjectComponentId",
    ];
    list.PageName = "ExamStudentSubjectResults";
    list.lookupFields = ["ClassSubjectMarkComponent"];
    list.filter = [filterstr + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        var filteredStudentSubjects = this.StudentSubjects.filter(studentsubject => {
          return studentsubject.ClassId == this.searchForm.get("searchClassId").value
          && studentsubject.SubjectId == this.searchForm.get("searchSubjectId").value 
          && studentsubject.Section.toString().trim().toUpperCase() == this.searchForm.get("searchSection").value.trim().toUpperCase()
        });
        filteredStudentSubjects.forEach(ss => {
          ss.Components.forEach(component => {
            let existing = data.value.filter(db => db.StudentClassSubjectId == ss.StudentClassSubjectId && db.ClassSubjectMarkComponentId == component.ClassSubjectMarkComponentId);
            if (existing.length > 0)
              this.ExamStudentSubjectResult.push({
                ExamStudentSubjectResultId: existing[0].ExamStudentSubjectResultId,
                ExamId: existing[0].ExamStudentResultId,
                StudentClassSubjectId: existing[0].StudentClassSubjectId,
                StudentClassSubject: ss.StudentClassSubject,
                ClassSubjectMarkComponentId: existing[0].ClassSubjectMarkComponentId,
                SubjectMarkComponent: this.MarkComponents.filter(c => c.MasterDataId == existing[0].ClassSubjectMarkComponent.SubjectComponentId)[0].MasterDataName,
                FullMark: component.FullMark,
                PassMark: component.PassMark,
                Marks: existing[0].Marks,
                ExamStatus: existing[0].ExamStatus,
                Active: existing[0].Active,
                Action: true
              })
            else
              this.ExamStudentSubjectResult.push({
                ExamStudentSubjectResultId: 0,
                ExamId: this.searchForm.get("searchExamId").value,
                StudentClassSubjectId: ss.StudentClassSubjectId,
                StudentClassSubject: ss.StudentClassSubject,
                ClassSubjectMarkComponentId: component.ClassSubjectMarkComponentId,
                SubjectMarkComponent: this.MarkComponents.filter(c => c.MasterDataId == component.SubjectComponentId)[0].MasterDataName,
                FullMark: component.FullMark,
                PassMark: component.PassMark,
                Marks: 0,
                ExamStatus: 0,
                Active: 0,
                Action: true
              })
          })
        })
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
  GetExams() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId"];
    list.PageName = "Exams";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Exams = data.value.map(e => {
          return {
            ExamId: e.ExamId,
            ExamName: this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId)[0].MasterDataName
          }
        })
        this.GetStudentSubjects();
      })
  }
  GetMasterData() {

    var orgIdSearchstr = 'and (ParentId eq 0  or OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ')';

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        //this.Batches = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].BATCH);
        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].CLASS);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].SUBJECT);
        this.ExamStatuses = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].EXAMSTATUS);
        this.MarkComponents = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].SUBJECTMARKCOMPONENT);
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].EXAMNAME);
        this.ClassGroups = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].CLASSGROUP);
        this.shareddata.ChangeBatch(this.Batches);
        //this.GetCurrentBatchIDnAssign();
        this.GetExams();

      });
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

