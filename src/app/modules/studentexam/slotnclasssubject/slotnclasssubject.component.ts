import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
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
  Permission = 'deny';
  StandardFilterWithBatchId = '';
  loading = false;
  DataToUpdateCount = -1;
  SlotNClassSubjects: ISlotNClassSubject[] = [];
  SelectedBatchId = 0;
  ExamSlots = [];
  Classes = [];
  Subjects = [];
  ExamNames = [];
  SlotNames = [];
  Batches = [];
  ClassSubjectList = [];
  dataSource: MatTableDataSource<ISlotNClassSubject>;
  allMasterData = [];

  ExamId = 0;
  SlotNClassSubjectData = {
    SlotClassSubjectId: 0,
    SlotId: 0,
    ClassSubjectId: 0,
    OrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns = [
    'ClassSubject',
    'Active',
    'Action'
  ];
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
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
    //debugger;
    this.searchForm = this.fb.group({
      searchSlotId: [0],
      searchClassId: [0],
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
      //this.shareddata.CurrentSelectedBatchId.subscribe(c => this.SelectedBatchId = c);
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.EXAM.SLOTNCLASSSUBJECT);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
        this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);

        this.GetMasterData();
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
        })
      }
    }
  }

  updateActive(row, value) {
    row.Active = row.Active == 1 ? 0 : 1;
    row.Action = true;
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
  loadingFalse() {
    this.loading = false;
  }
  Save(row) {
    this.DataToUpdateCount = 0;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row) {

    this.loading = true;

    var duplicate = this.SlotNClassSubjects.filter(s => s.SlotId == row.SlotId
      && s.ClassId == row.ClassId
      && s.Active == 1
      && s.SlotClassSubjectId != row.SlotClassSubjectId)
    if (duplicate.length > 0) {
      this.loadingFalse();
      this.alert.error("Two subjects of one class cannot be assigned in the same slot.", this.optionsNoAutoClose);
      return;
    }
    let checkFilterString = "SlotId eq " + this.searchForm.get("searchSlotId").value +
      " and ClassSubjectId eq " + row.ClassSubjectId;


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
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {
          this.SlotNClassSubjectData.SlotClassSubjectId = row.SlotClassSubjectId;
          this.SlotNClassSubjectData.SlotId = this.searchForm.get("searchSlotId").value;
          this.SlotNClassSubjectData.Active = row.Active;
          this.SlotNClassSubjectData.ClassSubjectId = row.ClassSubjectId;
          this.SlotNClassSubjectData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.SlotNClassSubjectData.BatchId = this.SelectedBatchId;
          //console.log('data', this.ClassSubjectData);
          if (this.SlotNClassSubjectData.SlotClassSubjectId == 0) {
            this.SlotNClassSubjectData["CreatedDate"] = new Date();
            this.SlotNClassSubjectData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.SlotNClassSubjectData["UpdatedDate"] = new Date();
            delete this.SlotNClassSubjectData["UpdatedBy"];
            //console.log('exam slot', this.SlotNClassSubjectData)
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
            this.alert.success("Data saved successfully.", this.optionAutoClose);
          }
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
            this.alert.success("Data updated successfully.", this.optionAutoClose);
          }
        });
  }
  onBlur(element) {
    element.Action = true;
  }
  GetClassSubject() {
    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    filterStr += ' and BatchId eq ' + this.SelectedBatchId;
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
        //debugger;
        //  console.log('data.value', data.value);
        this.ClassSubjectList = data.value.map(item => {
          var _class = '';
          var clsobj = this.Classes.filter(c => c.ClassId == item.ClassId)
          if (clsobj.length > 0)
            _class = clsobj[0].ClassName;
          var _subject = this.Subjects.filter(c => c.MasterDataId == item.SubjectId)[0].MasterDataName;
          return {
            ClassSubjectId: item.ClassSubjectId,
            ClassSubject: _class + " - " + _subject,
            SubjectId: item.SubjectId,
            ClassId: item.ClassId
          }
        })
        this.loading = false;
      });
  }

  GetExamSlots() {

    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = '';
    //filterstr = " and ExamDate ge datetime'" + new Date().toISOString() + "'";

    let list: List = new List();
    list.fields = ["ExamSlotId",
      "ExamId",
      "SlotNameId",
      "ExamDate",
      "StartTime",
      "EndTime"
    ];
    list.PageName = "ExamSlots";
    list.lookupFields = ["Exam($select=ExamNameId)"];
    list.filter = ["Active eq 1 " + orgIdSearchstr + filterstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //this.Exams = [...data.value];
        this.ExamSlots = data.value.map(s => {

          let exams = this.ExamNames.filter(e => e.MasterDataId == s.Exam.ExamNameId);
          var day = this.weekday[new Date(s.ExamDate).getDay()]
          var _examname = '';
          if (exams.length > 0)
            _examname = exams[0].MasterDataName;
          return {
            SlotId: s.ExamSlotId,
            SlotName: _examname + " - " + this.datepipe.transform(s.ExamDate, 'dd/MM/yyyy') + " - " + day + " - " + s.StartTime + " - " + s.EndTime + " - " + this.SlotNames.filter(n => n.MasterDataId == s.SlotNameId)[0].MasterDataName
          }
        })
        this.GetClassSubject();

      })
  }
  GetSlotNClassSubjects() {
    //console.log("this.searchForm.get(searchClassId).value",this.searchForm.get("searchClassId").value)
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 ';
    if (this.searchForm.get("searchSlotId").value == 0) {
      this.alert.error("Please select exam slot", this.optionAutoClose);
      return;
    }
    if (this.searchForm.get("searchClassId").value.length == 0 && this.searchForm.get("searchSubjectId").value > 0) {
      this.alert.error("Class must be selected if subject is selected.", this.optionAutoClose);
      return;
    }

    filterstr = 'SlotId eq ' + this.searchForm.get("searchSlotId").value;

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
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        var filteredData = [];
        this.SlotNClassSubjects = [];
        if (this.searchForm.get("searchSubjectId").value == 0 && this.searchForm.get("searchClassId").value.length == 0) {
          this.ClassSubjectList.forEach(clssub => {

            let existing = data.value.filter(db => db.ClassSubjectId == clssub.ClassSubjectId);
            if (existing.length > 0)
              this.SlotNClassSubjects.push({

                SlotClassSubjectId: existing[0].SlotClassSubjectId,
                SlotId: existing[0].SlotId,
                Slot: this.ExamSlots.filter(s => s.SlotId == existing[0].SlotId)[0].SlotName,
                ClassSubjectId: existing[0].ClassSubjectId,
                ClassSubject: clssub.ClassSubject,
                SubjectId: existing[0].ClassSubject.SubjectId,
                ClassId: existing[0].ClassSubject.ClassId,
                Active: existing[0].Active,
                Action: false
              });
            else {
              this.SlotNClassSubjects.push({
                SlotClassSubjectId: 0,
                SlotId: this.searchForm.get("searchSlotId").value,
                Slot: this.ExamSlots.filter(s => s.SlotId == this.searchForm.get("searchSlotId").value)[0].SlotName,
                ClassSubjectId: clssub.ClassSubjectId,
                ClassSubject: clssub.ClassSubject,
                SubjectId: clssub.ClassSubject.SubjectId,
                ClassId: clssub.ClassSubject.ClassId,
                Active: 0,
                Action: false
              });
            }
          })
        }
        else {
          if (this.searchForm.get("searchClassId").value.length > 0 && this.searchForm.get("searchSubjectId").value == 0) {

            filteredData = data.value.filter(item => this.searchForm.get("searchClassId").value.indexOf(item.ClassSubject.ClassId) > -1)
            //.filter(d => d.ClassSubject.ClassId == this.searchForm.get("searchClassId").value);

            let fitleredClassSubject = this.ClassSubjectList.filter(f => this.searchForm.get("searchClassId").value.indexOf(f.ClassId) > -1);

            fitleredClassSubject.forEach(cs => {
              let existing = filteredData.filter(ex => ex.ClassSubjectId == cs.ClassSubjectId)
              if (existing.length > 0) {
                this.SlotNClassSubjects.push({
                  SlotClassSubjectId: existing[0].SlotClassSubjectId,
                  SlotId: this.searchForm.get("searchSlotId").value,
                  Slot: this.ExamSlots.filter(s => s.SlotId == this.searchForm.get("searchSlotId").value)[0].SlotName,
                  ClassSubjectId: cs.ClassSubjectId,
                  ClassSubject: this.ClassSubjectList.filter(f => f.ClassSubjectId == cs.ClassSubjectId)[0].ClassSubject,
                  SubjectId: cs.SubjectId,
                  ClassId: cs.ClassId,
                  Active: existing[0].Active,
                  Action: false
                });
              }
              else {
                this.SlotNClassSubjects.push({
                  SlotClassSubjectId: 0,
                  SlotId: this.searchForm.get("searchSlotId").value,
                  Slot: this.ExamSlots.filter(s => s.SlotId == this.searchForm.get("searchSlotId").value)[0].SlotName,
                  ClassSubjectId: cs.ClassSubjectId,
                  ClassSubject: this.ClassSubjectList.filter(f => f.ClassSubjectId == cs.ClassSubjectId)[0].ClassSubject,
                  SubjectId: cs.ClassSubject.SubjectId,
                  ClassId: cs.ClassSubject.ClassId,
                  Active: 0,
                  Action: false
                });
              }
            })
          }
          else {
            //debugger;
            if (this.searchForm.get("searchSubjectId").value > 0 && this.searchForm.get("searchClassId").value.length > 0) {
              filteredData = data.value.filter(d => d.ClassSubject.SubjectId == this.searchForm.get("searchSubjectId").value
                && this.searchForm.get("searchClassId").value.indexOf(d.ClassSubject.ClassId) > -1);
            }
            if (filteredData.length > 0) {
              this.SlotNClassSubjects.push({
                SlotClassSubjectId: filteredData[0].SlotClassSubjectId,
                SlotId: this.searchForm.get("searchSlotId").value,
                Slot: this.ExamSlots.filter(s => s.SlotId == this.searchForm.get("searchSlotId").value)[0].SlotName,
                ClassSubjectId: filteredData[0].ClassSubjectId,
                ClassSubject: this.ClassSubjectList.filter(f => f.ClassSubjectId == filteredData[0].ClassSubjectId)[0].ClassSubject,
                SubjectId: filteredData[0].ClassSubject.SubjectId,
                ClassId: filteredData[0].ClassSubject.ClassId,
                Active: filteredData[0].Active,
                Action: false
              });
            }
            else {
              var clssubject = this.ClassSubjectList.filter(cs => cs.SubjectId == this.searchForm.get("searchSubjectId").value &&
                this.searchForm.get("searchClassId").value.indexOf(cs.ClassId) > -1)
              if (clssubject.length > 0) {
                var _classSubjectId = clssubject[0].ClassSubjectId;

                this.SlotNClassSubjects.push({
                  SlotClassSubjectId: 0,
                  SlotId: this.searchForm.get("searchSlotId").value,
                  Slot: this.ExamSlots.filter(s => s.SlotId == this.searchForm.get("searchSlotId").value)[0].SlotName,
                  ClassSubjectId: clssubject[0].ClassSubjectId,
                  ClassSubject: this.ClassSubjectList.filter(f => f.ClassSubjectId == _classSubjectId)[0].ClassSubject,
                  SubjectId: clssubject[0].SubjectId,
                  ClassId: clssubject[0].ClassId,
                  Active: 0,
                  Action: false
                });
              }
            }
          }
        }
        if (this.SlotNClassSubjects.length == 0) {
          this.alert.info("No record found! Subject not defined in class subject module.", this.optionsNoAutoClose);
        }
        //console.log('this', this.SlotNClassSubjects)
        this.dataSource = new MatTableDataSource<ISlotNClassSubject>(this.SlotNClassSubjects);
        this.loading = false;
      })
  }
  checkall(value) {
    this.SlotNClassSubjects.forEach(record => {
      if (value.checked)
        record.Active = 1;
      else
        record.Active = 0;
      record.Action = !record.Action;
    })
  }
  SaveAll() {
    var toUpdate = this.SlotNClassSubjects.filter(f => f.Action);
    this.DataToUpdateCount = toUpdate.length;
    toUpdate.forEach(record => {
      this.DataToUpdateCount--;
      this.UpdateOrSave(record);
    })
  }
  GetMasterData() {

    var orgIdSearchstr = 'and (ParentId eq 0  or OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ')';

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.SlotNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSLOTNAME);
        this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);

        this.shareddata.ChangeBatch(this.Batches);
        this.GetExamSlots();
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
  SubjectId: number;
  ClassId: number;
  Active: number;
  Action: boolean;
}


