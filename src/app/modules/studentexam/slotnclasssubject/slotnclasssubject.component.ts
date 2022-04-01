import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-slotnclasssubject',
  templateUrl: './slotnclasssubject.component.html',
  styleUrls: ['./slotnclasssubject.component.scss']
})
export class SlotnclasssubjectComponent implements OnInit {
  weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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
  DistinctExamDate = [];
  Permission = 'deny';
  StandardFilterWithBatchId = '';
  loading = false;
  DataToUpdateCount = -1;
  StoreForUpdate: ISlotNClassSubject[] = [];
  ClassWiseSubjectDisplay = [];
  SelectedBatchId = 0;
  SelectedApplicationId = 0;
  AllSelectedSubjects = [];
  ExamSlots = [];
  Classes = [];
  Subjects = [];
  ExamNames = [];
  SlotNames = [];
  Batches = [];
  ClassSubjectList = [];
  Exams = [];
  ClassWiseDatasource: MatTableDataSource<any>[] = [];
  dataSource: MatTableDataSource<any>;
  allMasterData = [];
  rowCount = 0;
  ExamId = 0;
  SlotNClassSubjectData = {
    SlotClassSubjectId: 0,
    SlotId: 0,
    ClassSubjectId: 0,
    OrgId: 0,
    BatchId: 0,
    Active: 0
  };
  SelectedExamSlots = [];
  displayedColumns = [
    "ClassName",
    "SlotClassSubjectId",
    "Action"
  ];
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private nav: Router,
    private shareddata: SharedataService,
    private datepipe: DatePipe,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchSlotId: [0],
      searchExamId: [0],
      searchSubjectId: [0],
    });
    this.PageLoad();
  }
  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.EXAM.SLOTNCLASSSUBJECT);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
        this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);

        this.GetMasterData();

      }
    }
  }
  public trackItem(index: number, item: any) {
    return item.ClassName;
  }
  updateActive(item, value, selectedSubjectname) {
    debugger;
    this.ClassWiseSubjectDisplay.filter(f => {
      if (f.ClassName == item.ClassName) {
        f.Subject.forEach(sub => {
          if (sub.SubjectName == selectedSubjectname) {
            if (value.source._checked)
              sub.value = 1;
          }
          else {
            if (sub.value != 2)
              sub.value = 0;
          }
        })
      }
    })

    item.Action = true;
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
  loadingFalse() {
    this.loading = false;
  }

  Save(row) {
    this.DataToUpdateCount = 0;
    this.UpdateOrSave(row);
  }
  SaveRow(element) {
    debugger;
    this.loading = true;

    var classSujects = this.StoreForUpdate.filter(s => s.SlotId == this.searchForm.get("searchSlotId").value
      && s.ClassName.toLowerCase() == element.ClassName.toLowerCase());

    this.DataToUpdateCount = 0;

    Object.keys(element).forEach(subjectname => {
      var subjectdetail = classSujects.filter(f => f.Subject == subjectname)

      subjectdetail.forEach(row => {
        row.Active = element[subjectname];
        this.UpdateOrSave(row);
      })
      if (subjectdetail.length == 0) {
        this.loading = false;
      }
      element.Action = false;
    })
  }
  UpdateOrSave(row) {
    //console.log("row", row)
    this.loading = true;

    var subobject = row.Subject.filter(sub => sub.value == 1)
    if (subobject.length > 0)
      row.SelectedSubject = subobject[0];
    else
      row.Subject = {};
    let checkFilterString = "SlotId eq " + this.searchForm.get("searchSlotId").value +
      " and ClassSubjectId eq " + row.SelectedSubject.ClassSubjectId;

    if (row.SlotClassSubjectId > 0)
      checkFilterString += " and SlotClassSubjectId ne " + row.SlotClassSubjectId;
    checkFilterString += " and " + this.StandardFilterWithBatchId;

    let list: List = new List();
    list.fields = ["SlotClassSubjectId"];
    list.PageName = "SlotAndClassSubjects";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.length > 0) {
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.SlotNClassSubjectData.SlotClassSubjectId = row.SlotClassSubjectId;
          this.SlotNClassSubjectData.SlotId = this.searchForm.get("searchSlotId").value;
          this.SlotNClassSubjectData.Active = 1;
          this.SlotNClassSubjectData.ClassSubjectId = row.SelectedSubject.ClassSubjectId;
          this.SlotNClassSubjectData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.SlotNClassSubjectData.BatchId = this.SelectedBatchId;
          if (this.SlotNClassSubjectData.SlotClassSubjectId == 0) {
            this.SlotNClassSubjectData["CreatedDate"] = new Date();
            this.SlotNClassSubjectData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.SlotNClassSubjectData["UpdatedDate"] = new Date();
            delete this.SlotNClassSubjectData["UpdatedBy"];
            ////console.log('exam slot', this.SlotNClassSubjectData)
            this.insert(row);
          }
          else {
            delete this.SlotNClassSubjectData["CreatedDate"];
            delete this.SlotNClassSubjectData["CreatedBy"];
            this.SlotNClassSubjectData["UpdatedDate"] = new Date();
            this.SlotNClassSubjectData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('SlotAndClassSubjects', this.SlotNClassSubjectData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.SlotClassSubjectId = data.SlotClassSubjectId;
          this.loadingFalse();
          if (this.DataToUpdateCount == 0) {
            this.DataToUpdateCount = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.GetSelectedSubjectsForSelectedExam();
          }
        }, err => {
          this.loadingFalse();
          console.log("slot and subject insert", err);
          this.contentservice.openSnackBar(globalconstants.SomethingWentWrong, globalconstants.ActionText, globalconstants.RedBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch('SlotAndClassSubjects', this.SlotNClassSubjectData, this.SlotNClassSubjectData.SlotClassSubjectId, 'patch')
      .subscribe(
        (data: any) => {
          this.loadingFalse();
          row.Action = false;
          if (this.DataToUpdateCount == 0) {
            this.DataToUpdateCount = -1;
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.GetSelectedSubjectsForSelectedExam();
          }
        }, err => {
          this.loadingFalse();
          console.log("slot and subject update", err);
          this.contentservice.openSnackBar(globalconstants.SomethingWentWrong, globalconstants.ActionText, globalconstants.RedBackground);
        });
  }
  onBlur(element) {
    element.Action = true;
  }
  GetClassSubject() {
    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    this.loading = true;
    //filterStr += ' and BatchId eq ' + this.SelectedBatchId;
    let list: List = new List();
    list.fields = [
      'ClassSubjectId',
      'SubjectId',
      'ClassId',
      'Active'
    ];

    list.PageName = "ClassSubjects";
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  //console.log('data.value', data.value);
        this.ClassSubjectList = [];
        data.value.forEach(item => {
          var _class = '';
          var _subject = '';
          var clsobj = this.Classes.filter(c => c.ClassId == item.ClassId)
          var subjobj = this.Subjects.filter(c => c.MasterDataId == item.SubjectId)

          if (clsobj.length > 0 && subjobj.length > 0) {
            _class = clsobj[0].ClassName;
            _subject = subjobj[0].MasterDataName;
            this.ClassSubjectList.push({
              ClassSubjectId: item.ClassSubjectId,
              ClassSubject: _class + " - " + _subject,
              Subject: _subject,
              ClassName: _class,
              SubjectId: item.SubjectId,
              ClassId: item.ClassId
            })
          }
        })
        this.loading = false;
        console.log("this.ClassSubjectList", this.ClassSubjectList);
      });
  }
  GetExams() {

    //var orgIdSearchstr = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);

    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId", "StartDate", "EndDate",
      "ReleaseResult", "ReleaseDate", "OrgId", "BatchId", "Active"];
    list.PageName = "Exams";
    list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"] +
      " and BatchId eq " + this.SelectedBatchId];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //this.Exams = [...data.value];
        this.Exams = this.ExamNames.map(e => {
          let existing = data.value.filter(db => db.ExamNameId == e.MasterDataId);
          if (existing.length > 0) {
            existing[0].ExamName = this.ExamNames.filter(f => f.MasterDataId == existing[0].ExamNameId)[0].MasterDataName;
            existing[0].Action = false;
            return existing[0];
          }
          else {
            return {
              ExamId: 0,
              ExamNameId: e.MasterDataId,
              ExamName: e.MasterDataName,
              StartDate: new Date(),
              EndDate: new Date(),
              ReleaseResult: 0,
              ReleaseDate: null,
              OrgId: 0,
              //BatchId: 0,
              Active: 0,
              Action: false
            }
          }
        })
        ////console.log('this', this.Exams)
        this.Exams.sort((a, b) => {
          return this.getTime(a.StartDate) - this.getTime(b.StartDate)
        })
        this.loading = false;
      })
  }
  private getTime(date?: Date) {
    var std = new Date(date);
    return std != null ? std.getTime() : 0;
  }
  GetExamSlots() {

    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = '';
    //filterstr = " and ExamDate ge datetime'" + new Date().toISOString() + "'";
    this.loading = true;
    let list: List = new List();
    list.fields = [
      "ExamSlotId",
      "ExamId",
      "SlotNameId",
      "ExamDate",
      "StartTime",
      "Sequence",
      "EndTime"
    ];
    list.PageName = "ExamSlots";
    list.lookupFields = ["Exam($select=ExamNameId)"];
    list.filter = ["Active eq 1 " + orgIdSearchstr + filterstr];
    list.orderBy = "ExamDate,Sequence";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //this.Exams = [...data.value];
        //this.ExamSlots = 
        var result = data.value.map(s => {

          let exams = this.ExamNames.filter(e => e.MasterDataId == s.Exam.ExamNameId);
          var day = this.weekday[new Date(s.ExamDate).getDay()]
          var _examname = '';
          if (exams.length > 0)
            _examname = exams[0].MasterDataName;
          var _slotName = '';
          var obj = this.SlotNames.filter(f => f.MasterDataId == s.SlotNameId);
          if (obj.length > 0)
            _slotName = obj[0].MasterDataName;
          return {
            ExamId: s.ExamId,
            ExamSlotId: s.ExamSlotId,
            ExamDate: this.datepipe.transform(s.ExamDate, 'dd/MM/yyyy'),
            ExamDateDetail: this.datepipe.transform(s.ExamDate, 'dd/MM/yyyy') + " - " + day + " - (" + s.StartTime + " - " + s.EndTime + "), " + _slotName,
            Sequence: s.Sequence
          }
        })
        this.ExamSlots = [...result];//.sort((a, b) => a.ExamDate.getTime() - b.ExamDate.getTime())
        //this.DistinctExamDate = alasql("select DISTINCT ExamId,ExamDate,ExamDateDetail from ? group by ExamId,ExamDate,ExamDateDetail",[result]);        
        //console.log("this.DistinctExamDate",this.DistinctExamDate)
      })
  }
  GetSelectedExamSlot() {
    this.SelectedExamSlots = this.ExamSlots.filter(f => f.ExamId == this.searchForm.get("searchExamId").value)
      .sort((a, b) => moment.utc(a.ExamDate).diff(moment.utc(b.ExamDate)));
    // {
    //   //a.gsize == b.gsize ? a.glow - b.glow : a.gsize - b.gsize
    //   var datediff =moment.utc(a.ExamDate).diff(moment.utc(b.ExamDate));
    //   return datediff==0? a.Sequence - b.Sequence:0;

    // });
    console.log("this.SelectedExamSlots", this.SelectedExamSlots);

    this.GetSelectedSubjectsForSelectedExam();
  }
  GetSelectedSubjectsForSelectedExam() {

    var filterstr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;

    filterstr += ' and ExamId eq ' + this.searchForm.get("searchExamId").value;

    let list: List = new List();
    list.fields = [
      "ExamId",
      "SlotNameId",
      "Sequence",
      "ExamDate"
    ];
    list.PageName = "Examslots";
    list.filter = [filterstr];
    list.lookupFields = ["SlotAndClassSubjects($select=SlotId,ClassSubjectId)"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AllSelectedSubjects = data.value.map(m => {
          var _slotName = this.SlotNames.filter(name => name.MasterDataId == m.SlotNameId)[0].MasterDataName;
          m.SlotName = _slotName;
          m.Tooltip = moment(m.ExamDate).format('DD/MM/yyyy') + " - " + _slotName;
          return m;
        });
        //console.log("all",this.AllSelectedSubjects)
      })
  }
  GetSlotNClassSubjects() {

    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1';
    if (this.searchForm.get("searchSlotId").value == 0) {
      this.contentservice.openSnackBar("Please select exam slot", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    filterstr += ' and SlotId eq ' + this.searchForm.get("searchSlotId").value;

    let list: List = new List();
    list.fields = [
      "SlotClassSubjectId",
      "SlotId",
      "ClassSubjectId",
      "Active"
    ];
    list.PageName = "SlotAndClassSubjects";
    list.lookupFields = ["ClassSubject($select=SubjectId,ClassId)", "Slot($select=SlotNameId)"];
    list.filter = [filterstr + orgIdSearchstr];

    this.ClassWiseSubjectDisplay = [];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.StoreForUpdate = [];
        this.Classes.forEach(cls => {
          this.ClassWiseSubjectDisplay.push({
            ClassName: cls.ClassName,
            Subject: []
          });
        })
        debugger;
        this.ClassWiseSubjectDisplay.forEach(displayrow => {
          displayrow["Subject"] = [];
          displayrow["SlotClassSubjectId"] = 0;
          var _currentClassSubjectlist = this.ClassSubjectList.filter(f => f.ClassName == displayrow.ClassName)
            .sort((a, b) => a.Subject - b.Subject);
          _currentClassSubjectlist.forEach((clssub) => {

            var selected = 0;
            var toolTip = '';
            let existing = data.value.filter(db => db.ClassSubjectId == clssub.ClassSubjectId);

            if (existing.length > 0) {
              let existingsubject = this.AllSelectedSubjects
                .filter(f => f.SlotAndClassSubjects.filter(c => c.SlotId != existing[0].SlotId && c.ClassSubjectId == clssub.ClassSubjectId).length > 0)
              if (existingsubject.length > 0) {
                toolTip = existingsubject[0].Tooltip;
                selected = 2;
              }
              displayrow["SlotClassSubjectId"] = existing[0].SlotClassSubjectId;
              displayrow["Subject"].push(
                {
                  ClassSubjectId: existing[0].ClassSubjectId,
                  SubjectName: clssub.Subject,
                  value: selected == 2 ? 2 : 1,
                  Tooltip: toolTip
                });
              // displayrow["Subject"][clssub.Subject] = +existing[0].Active;
              //displayrow['Selected'] = selected;
              this.StoreForUpdate.push({
                SlotClassSubjectId: existing[0].SlotClassSubjectId,
                SlotId: existing[0].SlotId,
                Slot: this.ExamSlots.filter(s => s.ExamSlotId == existing[0].SlotId)[0].ExamSlotName,
                ClassSubjectId: existing[0].ClassSubjectId,
                ClassSubject: clssub.ClassSubject,
                Subject: clssub.Subject,
                SubjectId: existing[0].ClassSubject.SubjectId,
                ClassId: existing[0].ClassSubject.ClassId,
                ClassName: displayrow.ClassName,
                Active: existing[0].Active,
                Action: false
              });
            }
            else {
              var toopTip = '';
              let existingsubject = this.AllSelectedSubjects
                .filter(f => f.SlotAndClassSubjects.filter(c => c.ClassSubjectId == clssub.ClassSubjectId).length > 0)
              if (existingsubject.length > 0) {
                toopTip = existingsubject[0].Tooltip;
                selected = 2;
              }
              displayrow["Subject"].push(
                {
                  ClassSubjectId: clssub.ClassSubjectId,
                  SubjectName: clssub.Subject,
                  value: selected,
                  Tooltip: toopTip
                });

              this.StoreForUpdate.push({
                SlotClassSubjectId: 0,
                SlotId: this.searchForm.get("searchSlotId").value,
                Slot: this.ExamSlots.filter(s => s.ExamSlotId == this.searchForm.get("searchSlotId").value)[0].ExamSlotName,
                ClassSubjectId: clssub.ClassSubjectId,
                ClassSubject: clssub.ClassSubject,
                Subject: clssub.Subject,
                SubjectId: clssub.ClassSubject.SubjectId,
                ClassId: clssub.ClassSubject.ClassId,
                ClassName: displayrow.ClassName,
                Active: 0,
                Action: false
              });
            }
          });
          displayrow["Action"] = false;
        })
        if (this.StoreForUpdate.length == 0) {
          this.contentservice.openSnackBar("No record found! Subject not defined in class subject module.", globalconstants.ActionText, globalconstants.RedBackground);
        }
        //console.log('ClassWiseSubjectDisplay', this.ClassWiseSubjectDisplay)
        this.dataSource = new MatTableDataSource<any>(this.ClassWiseSubjectDisplay);
        this.loading = false;
      })
  }
  checkall(value) {
    this.StoreForUpdate.forEach(record => {
      if (value.checked)
        record.Active = 1;
      else
        record.Active = 0;
      record.Action = !record.Action;
    })
  }
  SaveAll() {
    debugger;
    var toUpdate = this.ClassWiseSubjectDisplay.filter(f => f.Action == true);
    this.DataToUpdateCount = toUpdate.length;
    toUpdate.forEach(record => {
      this.DataToUpdateCount--;
      this.UpdateOrSave(record);
    })
  }

  UpdateAll() {
    this.StoreForUpdate.forEach(element => {
      this.SaveRow(element);
    })
  }


  IsEquivalent(a, b) {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
      return false;
    }

    for (var i = 0; i < aProps.length; i++) {
      var propName = aProps[i];

      // If values of same property are not equal,
      // objects are not equivalent
      if (a[propName] !== b[propName]) {
        return false;
      }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.SlotNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSLOTNAME);
        this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
          this.GetExams();
          this.GetExamSlots();
          this.GetClassSubject();
        })
        this.shareddata.ChangeBatch(this.Batches);

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
export interface ISlotNClassSubject {
  SlotClassSubjectId: number;
  SlotId: number;
  Slot: string;
  ClassSubjectId: number;
  ClassSubject: string;
  Subject: string,
  SubjectId: number;
  ClassId: number;
  ClassName: string;
  Active: number;
  Action: boolean;
}


