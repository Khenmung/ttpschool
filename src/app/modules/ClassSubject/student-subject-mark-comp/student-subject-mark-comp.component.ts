import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-student-subject-mark-comp',
  templateUrl: './student-subject-mark-comp.component.html',
  styleUrls: ['./student-subject-mark-comp.component.scss']
})
export class StudentSubjectMarkCompComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  loading = false;
  Permission = '';
  LoginUserDetail = [];
  CurrentBatch = '';
  CurrentBatchId = 0;
  SelectedBatchId = 0;
  SelectedApplicationId = 0;
  StandardOrgIdWithBatchId = '';
  StandardOrgIdWithPreviousBatchId = '';
  PreviousBatchId = 0;
  Classes = [];
  Subjects = [];
  ClassSubjectnComponents = [];
  ClassSubjects = [];
  ClassGroups = [];
  MarkComponents = [];
  SelectedClassSubjects = [];
  Batches = [];
  ELEMENT_DATA: ISubjectMarkComponent[] = [];
  dataSource: MatTableDataSource<ISubjectMarkComponent>;
  allMasterData = [];
  searchForm: UntypedFormGroup;
  classSubjectComponentData = {
    ClassSubjectMarkComponentId: 0,
    ClassSubjectId: 0,
    SubjectComponentId: 0,
    ExamId: 0,
    FullMark: 0,
    PassMark: 0,
    OverallPassMark: 0,
    BatchId: 0,
    OrgId: 0,
    Active: 0
  };
  Exams = [];
  ExamNames = [];
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private token: TokenStorageService,
    private dataservice: NaomitsuService,

    private route: Router,
    private fb: UntypedFormBuilder,
    private shareddata: SharedataService) { }

  ngOnInit(): void {
    this.servicework.activateUpdate().then(() => {
      this.servicework.checkForUpdate().then((value) => {
        if (value) {
          location.reload();
        }
      })
    })
    this.LoginUserDetail = this.token.getUserDetail();
    if (this.LoginUserDetail == null || this.LoginUserDetail.length == 0)
      this.route.navigate(['auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.token, globalconstants.Pages.edu.SUBJECT.SUBJECTMARKCOMPONENT);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.StandardOrgIdWithBatchId = globalconstants.getStandardFilterWithBatchId(this.token);
        this.StandardOrgIdWithPreviousBatchId = globalconstants.getStandardFilterWithPreviousBatchId(this.token);
        this.searchForm = this.fb.group({
          searchExamId: [0],
          searchSubjectId: [0],
          searchClassId: [0],
          searchCopyExamId: [0]
        });
        //debugger;
        //this.GetClassFee();
        this.PageLoad();
      }
    }
  }
  PageLoad() {
    //this.shareddata.CurrentSelectedBatchId.subscribe(c=>this.SelectedBatchId=c);
    this.SelectedBatchId = +this.token.getSelectedBatchId();
    this.SelectedApplicationId = +this.token.getSelectedAPPId();

    this.GetMasterData();
    this.contentservice.GetClassGroupMapping(this.LoginUserDetail[0]["orgId"], 1)
      .subscribe((data: any) => {
        this.ClassGroupMappings = data.value.map(m => {
          m.ClassName = m.Class.ClassName;
          m.ClassId = m.Class.ClassId;
          return m;
        })
      })

  }
  //displayedColumns = ['position', 'name', 'weight', 'symbol'];
  ClassGroupMappings = [];
  displayedColumns = ['ClassSubjectMarkComponentId', 'ClassSubject', 'SubjectComponent', 'FullMark', 'PassMark', 'OverallPassMark', 'Active', 'Action'];
  cleardata() {
    this.ELEMENT_DATA = [];
    this.dataSource = new MatTableDataSource<any>([]);
  }
  SelectClassSubject() {
    debugger;
    this.SelectedClassSubjects = this.ClassSubjects.filter(f => f.ClassId == this.searchForm.get("searchClassId").value);
    this.ELEMENT_DATA = [];
    this.dataSource = new MatTableDataSource<any>([]);
  }
  UpdateSelectedBatchId(value) {
    this.SelectedBatchId = value;
  }
  onBlur(element) {
    element.Action = element.PassMark < 1000 && element.FullMark < 1000 ? true : false;
  }
  ToUpdateCount = -1;
  SaveAll() {
    debugger;
    var toUpdate = this.ELEMENT_DATA.filter(all => all.Action)
    this.ToUpdateCount = toUpdate.length;
    toUpdate.forEach(item => {
      this.UpdateOrSave(item);
    })
  }
  SelectAll(event) {
    //var event ={checked:true}
    this.ELEMENT_DATA.forEach(element => {
      element.Active = event.checked ? 1 : 0;
      element.Action = true;
    })
  }
  Save(element) {
    this.ToUpdateCount = 1;
    this.UpdateOrSave(element);
  }
  UpdateOrSave(row) {
    //debugger;
    this.loading = true;
    var _examId = this.searchForm.get("searchExamId").value;
    let checkFilterString = "OrgId eq " + this.LoginUserDetail[0]["orgId"] +
      " and BatchId eq " + this.SelectedBatchId +
      " and ClassSubjectId eq " + row.ClassSubjectId +
      " and SubjectComponentId eq " + row.SubjectComponentId +
      " and ExamId eq " + _examId;

    if (row.ClassSubjectMarkComponentId > 0)
      checkFilterString += " and ClassSubjectMarkComponentId ne " + row.ClassSubjectMarkComponentId;

    let list: List = new List();
    list.fields = ["ClassSubjectMarkComponentId"];
    list.PageName = "ClassSubjectMarkComponents";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.classSubjectComponentData.Active = row.Active;// == true ? 1 : 0;
          this.classSubjectComponentData.ClassSubjectMarkComponentId = row.ClassSubjectMarkComponentId;
          this.classSubjectComponentData.ClassSubjectId = row.ClassSubjectId;
          this.classSubjectComponentData.SubjectComponentId = row.SubjectComponentId;
          this.classSubjectComponentData.ExamId = row.ExamId;
          this.classSubjectComponentData.FullMark = row.FullMark == '' ? 0 : row.FullMark;
          this.classSubjectComponentData.PassMark = row.PassMark == '' ? 0 : row.PassMark;
          this.classSubjectComponentData.OverallPassMark = row.OverallPassMark == '' ? 0 : row.OverallPassMark;
          this.classSubjectComponentData.BatchId = this.SelectedBatchId;
          this.classSubjectComponentData.OrgId = this.LoginUserDetail[0]["orgId"];

          if (this.classSubjectComponentData.ClassSubjectMarkComponentId == 0) {
            this.classSubjectComponentData["CreatedDate"] = new Date();
            this.classSubjectComponentData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.classSubjectComponentData["UpdatedDate"];
            delete this.classSubjectComponentData["UpdatedBy"];
            ////console.log('this', this.classSubjectComponentData);
            this.insert(row);
          }
          else {
            delete this.classSubjectComponentData["CreatedDate"];
            delete this.classSubjectComponentData["CreatedBy"];
            this.classSubjectComponentData["UpdatedDate"] = new Date();
            this.classSubjectComponentData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];

            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('ClassSubjectMarkComponents', this.classSubjectComponentData, 0, 'post')
      .subscribe(
        (data: any) => {
          // this.loading = false; this.PageLoading = false;
          row.Action = false;
          this.ToUpdateCount--;
          row.ClassSubjectMarkComponentId = data.ClassSubjectMarkComponentId;
          if (this.ToUpdateCount == 0) {
            this.loading = false;
            this.PageLoading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
          //this.router.navigate(['/home/pages']);
        });

  }
  update(row) {

    this.dataservice.postPatch('ClassSubjectMarkComponents', this.classSubjectComponentData, this.classSubjectComponentData.ClassSubjectMarkComponentId, 'patch')
      .subscribe(
        (data: any) => {
          //this.loading = false; this.PageLoading = false;
          row.Action = false;
          this.ToUpdateCount--;
          if (this.ToUpdateCount == 0) {
            this.loading = false;
            this.PageLoading = false;
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
  }
  GetMasterData() {

    this.allMasterData = this.token.getMasterData();
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.MarkComponents = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTMARKCOMPONENT);
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);

    this.Batches = this.token.getBatches()
    this.contentservice.GetClassGroups(this.LoginUserDetail[0]['orgId'])
      .subscribe((data: any) => {
        this.ClassGroups = [...data.value];
      })
    //this.shareddata.ChangeBatch(this.Batches);
    this.contentservice.GetExams(this.LoginUserDetail[0]['orgId'], this.SelectedBatchId)
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.forEach(f => {
          var obj = this.ExamNames.filter(e => e.MasterDataId == f.ExamNameId);
          if (obj.length > 0) {
            f.ExamName = obj[0].MasterDataName;
            this.Exams.push(f);
          }

        })
      });

    if (this.Classes.length == 0) {
      this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
        this.Classes = [...data.value];
        this.GetClassSubject();
      });
    }

    this.loading = false;
    this.PageLoading = false;
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.token, this.allMasterData);

  }
  MergeSubjectnComponents() {

    this.ClassSubjectnComponents = this.ClassSubjects.map(s => {
      s.Components = this.MarkComponents;
      return s;
    })
  }
  GetClassSubject() {

    //let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]
    let filterStr = "OrgId eq " + this.LoginUserDetail[0]["orgId"] + " and BatchId eq " + this.SelectedBatchId + " and Active eq 1";
    let list: List = new List();
    list.fields = [
      "ClassSubjectId",
      "Active",
      "SubjectId",
      "ClassId"
    ];
    list.PageName = "ClassSubjects";
    list.filter = [filterStr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassSubjects =
          data.value.forEach(cs => {
            var _class = '';
            var objclass = this.Classes.filter(c => c.ClassId == cs.ClassId)
            if (objclass.length > 0)
              _class = objclass[0].ClassName;

            var _subject = ''
            var objsubject = this.Subjects.filter(c => c.MasterDataId == cs.SubjectId)
            if (objsubject.length > 0) {
              _subject = objsubject[0].MasterDataName;
              this.ClassSubjects.push({
                ClassSubjectId: cs.ClassSubjectId,
                Active: cs.Active,
                SubjectId: cs.SubjectId,
                ClassId: cs.ClassId,
                ClassSubject: _class + ' - ' + _subject,
                SubjectName: _subject
              })
            }
          })
        this.MergeSubjectnComponents();
      })
  }
  CopyFromOtherExam() {
    //console.log("here ", this.PreviousBatchId)
    var _otherExamId = this.searchForm.get("searchCopyExamId").value;
    var _examId = this.searchForm.get("searchExamId").value;
    this.PreviousBatchId = +this.token.getPreviousBatchId();
    if (_examId == 0)
      this.contentservice.openSnackBar("Please select exam for which formula to define.", globalconstants.ActionText, globalconstants.RedBackground);
    else if (_otherExamId == 0)
      this.contentservice.openSnackBar("Please select exam from where formula to copy from.", globalconstants.ActionText, globalconstants.RedBackground);
    else
      this.GetClassSubjectComponent(_otherExamId)
  }
  DisableSaveButton = false;
  SelectedClasses = [];
  DisableSave() {
    var examobj = this.Exams.filter(f => f.ExamId == this.searchForm.get("searchExamId").value);
    if (examobj.length > 0) {
      if (examobj[0].ReleaseResult == 1)
        this.DisableSaveButton = true;
      else
        this.DisableSaveButton = false;
    }
    else
      this.DisableSaveButton = false;
    this.ELEMENT_DATA = [];
    this.dataSource = new MatTableDataSource<any>([]);
    this.FilterClass();
    //var _selectedClassGroupId = examobj[0].ClassGroupId;

    //this.SelectedClasses = this.ClassGroupMappings.filter(g => g.ClassGroupId == _selectedClassGroupId);

  }
  datafromotherexam = '';
  GetClassSubjectComponent(otherExamId) {
    debugger;
    //var _copyExamId = this.searchForm.get("searchCopyExamId").value;
    var _examId = this.searchForm.get("searchExamId").value;

    var filterstr = this.StandardOrgIdWithBatchId;
    if (_examId == 0) {
      this.contentservice.openSnackBar("Please select exam.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    if (otherExamId > 0) {
      this.datafromotherexam = "Data from '" + this.Exams.filter(e => e.ExamId == otherExamId)[0].ExamName + "'";
      filterstr += " and (ExamId eq " + _examId + " or ExamId eq " + otherExamId + ")";
      //filterstr += 'ExamId eq ' + otherExamId + " and " + this.StandardOrgIdWithBatchId;
    }
    else {
      this.datafromotherexam = '';
      filterstr += " and ExamId eq " + _examId;
    }
    if (this.searchForm.get("searchClassId").value == 0) {
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }


    this.loading = true;
    let list: List = new List();
    list.fields = [
      "ClassSubjectMarkComponentId",
      "ClassSubjectId",
      "SubjectComponentId",
      "ExamId",
      "FullMark",
      "PassMark",
      "OverallPassMark",
      "BatchId",
      "OrgId",
      "Active"
    ];
    list.PageName = "ClassSubjectMarkComponents";
    list.lookupFields = ["ClassSubject($select=SubjectId,ClassId)"];
    list.filter = [filterstr];
    //list.orderBy = "ParentId";
    //this.ELEMENT_DATA = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        var clsSubjFiltered = [];
        //if all subject is selected.
        clsSubjFiltered = data.value.filter(item => item.ClassSubject.ClassId == this.searchForm.get("searchClassId").value);
        var filteredClassSubjectnComponents = this.ClassSubjectnComponents.filter(clssubjcomponent =>
          clssubjcomponent.ClassId == this.searchForm.get("searchClassId").value);
        if (this.searchForm.get("searchSubjectId").value > 0) {
          clsSubjFiltered = clsSubjFiltered.filter(item => item.ClassSubject.SubjectId == this.searchForm.get("searchSubjectId").value);
          filteredClassSubjectnComponents = filteredClassSubjectnComponents.filter(clssubjcomponent => clssubjcomponent.SubjectId == this.searchForm.get("searchSubjectId").value);
        }
        this.ELEMENT_DATA = [];
        ////////////////////
        var _CopyFromExam = [];
        var _SelectedExam = clsSubjFiltered.filter(d => d.ExamId == _examId);
        if (otherExamId > 0) {
          _CopyFromExam = clsSubjFiltered.filter(d => d.ExamId == otherExamId);

          this.ELEMENT_DATA = _CopyFromExam.map(f => {
            f.ExamId = _examId;

            let existing = _SelectedExam.filter(fromdb => fromdb.ClassSubject.SubjectId == f.ClassSubject.SubjectId
              && fromdb.SubjectComponentId == f.SubjectComponentId)

            if (existing.length > 0) {
              f.ClassSubjectMarkComponentId = existing[0].ClassSubjectMarkComponentId;
            }
            else {
              f.ClassSubjectMarkComponentId = 0;
            }
            f.ClassSubject = this.ClassSubjects.filter(s => s.ClassSubjectId == f.ClassSubjectId)[0].ClassSubject;
            f.SubjectComponent = this.MarkComponents.filter(m => m.MasterDataId == f.SubjectComponentId)[0].MasterDataName;
            f.Action = false;
            f.Active = 0;
            return f;
          });
        }
        else {
          filteredClassSubjectnComponents.forEach((subj, indx) => {
            subj.Components.forEach(component => {

              let existing = clsSubjFiltered.filter(fromdb => fromdb.ClassSubject.SubjectId == subj.SubjectId
                && fromdb.SubjectComponentId == component.MasterDataId)
              if (existing.length > 0) {
                existing.forEach(e => {
                  //e.ClassSubjectMarkComponentId = existing[0].ClassSubjectMarkComponentId;
                  e.ClassSubject = subj.ClassSubject;
                  e.SubjectComponent = this.MarkComponents.filter(m => m.MasterDataId == component.MasterDataId)[0].MasterDataName;
                  e.Action = false;
                  this.ELEMENT_DATA.push(e);
                })
              }
              else {
                let item = {
                  ClassSubjectMarkComponentId: 0,
                  ClassSubjectId: subj.ClassSubjectId,
                  ClassSubject: subj.ClassSubject,
                  ExamId: _examId,
                  SubjectComponentId: component.MasterDataId,
                  SubjectComponent: this.MarkComponents.filter(m => m.MasterDataId == component.MasterDataId)[0].MasterDataName,
                  FullMark: 0,
                  PassMark: 0,
                  OverallPassMark: 0,
                  BatchId: 0,
                  Active: 0,
                  Action: false
                }
                this.ELEMENT_DATA.push(item);
              }
            });

          })
        }


        /////////////////////

        //console.log("his.ELEMENT_DATA",this.ELEMENT_DATA);
        if (this.ELEMENT_DATA.length == 0)
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        this.ELEMENT_DATA = this.ELEMENT_DATA.sort((a, b) => b.Active - a.Active);
        this.dataSource = new MatTableDataSource<ISubjectMarkComponent>(this.ELEMENT_DATA);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false; this.PageLoading = false;
      });
  }
  ExamReleased = 0;
  FilteredClasses = [];
  ExamClassGroups = [];
  FilterClass() {
    var _examId = this.searchForm.get("searchExamId").value
    //var _classGroupId = 0;
    this.ExamReleased = 0;
    this.contentservice.GetExamClassGroup(this.LoginUserDetail[0]['orgId'], _examId)
      .subscribe((data: any) => {
        this.ExamClassGroups = [...data.value];
        this.FilteredClasses = this.ClassGroupMappings.filter(f => this.ExamClassGroups.findIndex(fi => fi.ClassGroupId == f.ClassGroupId) > -1);
      });
    var obj = this.Exams.filter(f => f.ExamId == _examId);
    if (obj.length > 0) {
      this.ExamReleased = obj[0].ReleaseResult;
    }
  }
  updateActive(row) {
    row.Action = true;
    row.Active = row.Active == 1 ? 0 : 1;
  }
  updateAmount(row, value) {
    row.Action = true;
    row.Amount = value;
  }
  updatePaymentOrder(row, value) {
    row.Action = true;
    //row.PaymentOrder = value;
  }
  enableAction(row, value) {
    row.Action = true;
    row.Active = !row.Active;
    //let amount = +value;
    if (value == NaN)
      value = 0;
    row.Amount = parseFloat(value);
    ////console.log('from change', row);
  }
}
export interface ISubjectMarkComponent {
  ClassSubjectMarkComponentId: number;
  ClassSubjectId: number;
  SubjectComponentId: number;
  BatchId: number;
  FullMark: number,
  PassMark: number,
  OverallPassMark: number,
  Active: number;
  Action: boolean;
}

