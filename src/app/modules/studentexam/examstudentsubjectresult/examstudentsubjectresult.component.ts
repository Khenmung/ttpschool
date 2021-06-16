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
  StandardFilter = '';
  loading = false;
  ExamStudentSubjectResult: IExamStudentSubjectResult[] = [];
  CurrentBatchId = 0;
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
    SubjectMarkComponentId: 0,
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
      searchSubjectId: [0],
    });
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);

      this.GetMasterData();
    }
  }

  PageLoad() {

  }
  GetCurrentBatchIDnAssign() {
    let CurrentBatches = this.Batches.filter(b => b.MasterDataName == globalconstants.getCurrentBatch());
    if (CurrentBatches.length > 0) {
      this.CurrentBatchId = CurrentBatches[0].MasterDataId;
    }
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

    let checkFilterString = "ExamId eq " + this.searchForm.get("searchExamId").value +
      " and StudentClassSubjectId eq " + row.StudentClassSubjectId +
      " and SubjectMarkComponentId eq " + row.SubjectMarkComponentId +
      this.StandardFilter;

    if (row.ExamStudentSubjectResultId > 0)
      checkFilterString += " and ExamStudentSubjectResultId ne " + row.ExamStudentSubjectResultId;

    let list: List = new List();
    list.fields = ["ExamStudentSubjectResultId"];
    list.PageName = "ExamStudentSubjectResults";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {
          this.ExamStudentSubjectResultData.ExamStudentSubjectResultId = row.ExamStudentSubjectResultId;
          this.ExamStudentSubjectResultData.ExamId = this.searchForm.get("searchExamId").value;
          this.ExamStudentSubjectResultData.Active = row.Active;
          this.ExamStudentSubjectResultData.StudentClassSubjectId = row.StudentClassSubjectId;
          this.ExamStudentSubjectResultData.SubjectMarkComponentId = row.SubjectMarkComponentId;
          this.ExamStudentSubjectResultData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ExamStudentSubjectResultData.BatchId = this.CurrentBatchId;
          this.ExamStudentSubjectResultData.ExamStatus = row.ExamStatus;
          this.ExamStudentSubjectResultData.Marks = row.Marks;
          //console.log('data', this.ClassSubjectData);
          if (this.ExamStudentSubjectResultData.ExamStudentSubjectResultId == 0) {
            this.ExamStudentSubjectResultData["CreatedDate"] = new Date();
            this.ExamStudentSubjectResultData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ExamStudentSubjectResultData["UpdatedDate"] = new Date();
            delete this.ExamStudentSubjectResultData["UpdatedBy"];
            //console.log('exam slot', this.SlotNClassSubjectData)
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
          row.Action = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update(row) {

    this.dataservice.postPatch('ExamStudentSubjectResults', this.ExamStudentSubjectResultData, this.ExamStudentSubjectResultData.ExamStudentSubjectResultId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }
  GetStudentSubjects() {
    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let batchIds = this.Batches.filter(b => b.MasterDataName == globalconstants.getCurrentBatch());
    let batchId = 0;
    if (batchIds.length > 0) {
      batchId = batchIds[0].MasterDataId;
      filterStr += ' and BatchId eq ' + batchId;
    }

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
            StudentClassSubject: _class + ' - ' + s.StudentClass.RollNo + ' - ' + _subject,
            SubjectId: s.ClassSubject.SubjectId,
            ClassId: s.ClassSubject.ClassId,
            StudentId: s.StudentClass.StudentId
          }

        })
        this.loading = false;
        this.GetSubjectMarkComponents();
      });
  }
  GetSubjectMarkComponents() {

    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.CurrentBatchId;
    var filterstr = 'Active eq 1 ';

    //filterstr = 'ExamId eq ' + this.searchForm.get("searchExamId").value;

    let list: List = new List();
    list.fields = [
      "ClassSubjectComponentId",
      "SubjectId",
      "SubjectComponentId",
      "ApplyToClass",
    ];
    list.PageName = "ClassSubjectMarkComponents";
    //list.lookupFields = ["ClassSubjectMarkComponent", "Exam"];
    list.filter = [filterstr + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.SubjectMarkComponents = data.value.map(c => {
          return {
            "ClassSubjectComponentId":c.ClassSubjectComponentId,
            "SubjectId": c.SubjectId,
            "SubjectComponentId": c.SubjectComponentId,
            "ApplyToClass": c.ApplyToClass,
            "ApplyToClassName": this.ClassGroups.filter(g => g.MasterDataId == c.ApplyToClass)[0].MasterDataName
          }
        });
      })
  }
  GetExamStudentSubjectResults() {

    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.CurrentBatchId;
    var filterstr = 'Active eq 1 ';
    if (this.searchForm.get("searchExamId").value == 0) {
      this.alert.error("Please select exam", this.optionAutoClose);
      return;
    }

    filterstr = 'ExamId eq ' + this.searchForm.get("searchExamId").value;

    let list: List = new List();
    list.fields = [
      "ExamStudentSubjectResultId",
      "ExamId",
      "StudentClassSubjectId",
      "SubjectMarkComponentId",
      "Marks",
      "ExamStatus",
      "Active",
      "Exam/ExamNameId",
      "ClassSubjectMarkComponent/SubjectComponentId"];
    list.PageName = "ExamStudentSubjectResults";
    list.lookupFields = ["ClassSubjectMarkComponent", "Exam"];
    list.filter = [filterstr + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        
        let clsFiltered = this.StudentSubjects.filter(s => s.ClassId == this.searchForm.get("searchClassId").value);
        
        clsFiltered.forEach(c => {
        
          let existing = data.value.filter(db => db.StudentClassSubjectId == c.StudentClassSubjectId);
          if (existing.length > 0) {
            this.ExamStudentSubjectResult.push({
              ExamStudentSubjectResultId: existing[0].ExamStudentSubjectResultId,
              ExamId: existing[0].ExamId,
              StudentClassSubjectId: existing[0].StudentClassSubjectId,
              StudentClassSubject: this.StudentSubjects.filter(ss=>ss.StudentClassSubjectId==existing[0].StudentClassSubjectId)[0].StudentClassSubject,
              SubjectMarkComponentId: existing[0].SubjectMarkComponentId,
              SubjectMarkComponent: this.MarkComponents.filter(c => c.MasterDataId == existing[0].ClassSubjectMarkComponent.SubjectComponentId)[0].MasterDataName,
              Marks: existing[0].Marks,
              ExamStatus: existing[0].ExamStatus,
              Active: existing[0].Active,
              Action: false
            })
          }
          else {
            var _classgroup ='';
            var _currentClassName = this.Classes.filter(cc=>cc.MasterDataId == this.searchForm.get("searchClassId").value)[0].MasterDataName;
            this.SubjectMarkComponents.forEach(com => {
              
              //checking Applytoclass contains current studentsubject class
              _classgroup = com.ApplyToClassName.split('-').filter(item=>item.toUpperCase().trim()==_currentClassName.toUpperCase().trim());

              if(com.SubjectId ==c.SubjectId && _classgroup.length>0)
              this.ExamStudentSubjectResult.push({
                ExamStudentSubjectResultId: 0,
                ExamId: this.searchForm.get("searchExamId").value,
                StudentClassSubjectId: c.StudentClassSubjectId,
                StudentClassSubject: c.StudentClassSubject,
                SubjectMarkComponentId: com.ClassSubjectComponentId,
                SubjectMarkComponent: this.MarkComponents.filter(c => c.MasterDataId == com.SubjectComponentId)[0].MasterDataName,
                Marks: 0,
                ExamStatus: 0,
                Active: 0,
                Action: false
              })
            })
          }
        })
        //console.log('this', this.SlotNClassSubjects)
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

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.CurrentBatchId;

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
        this.Batches = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].BATCH);
        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].CLASS);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].SUBJECT);
        this.ExamStatuses = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].EXAMSTATUS);
        this.MarkComponents = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].SUBJECTMARKCOMPONENT);
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].EXAMNAME);
        this.ClassGroups = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].CLASSGROUP);
        this.shareddata.ChangeBatch(this.Batches);
        this.GetCurrentBatchIDnAssign();
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
  SubjectMarkComponentId: number;
  SubjectMarkComponent: string;
  Marks: number;
  ExamStatus: number;
  Active: number;
  Action: boolean;
}

