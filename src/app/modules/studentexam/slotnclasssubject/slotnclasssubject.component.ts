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
  selector: 'app-slotnclasssubject',
  templateUrl: './slotnclasssubject.component.html',
  styleUrls: ['./slotnclasssubject.component.scss']
})
export class SlotnclasssubjectComponent implements OnInit {
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
  SlotNClassSubjects: ISlotNClassSubject[] = [];
  CurrentBatchId = 0;
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
    'Slot',
    'ClassSubject',
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
      searchSlotId: [0],
      searchClassId: [0],
      searchSubjectId: [0],
    });    
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);

      this.GetMasterData();
    }
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

    let checkFilterString = "SlotId eq " + this.searchForm.get("searchSlotId").value +
      " and ClassSubjectId eq " + row.ClassSubjectId +
      this.StandardFilter;

    if (row.SlotClassSubjectId > 0)
      checkFilterString += " and SlotClassSubjectId ne " + row.SlotClassSubjectId;

    let list: List = new List();
    list.fields = ["SlotClassSubjectId"];
    list.PageName = "SlotAndClassSubjects";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {
          this.SlotNClassSubjectData.SlotClassSubjectId = row.SlotClassSubjectId;
          this.SlotNClassSubjectData.SlotId = this.searchForm.get("searchSlotId").value;
          this.SlotNClassSubjectData.Active = row.Active;
          this.SlotNClassSubjectData.ClassSubjectId = row.ClassSubjectId;
          this.SlotNClassSubjectData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.SlotNClassSubjectData.BatchId = this.CurrentBatchId;
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

    debugger;
    this.dataservice.postPatch('SlotAndClassSubjects', this.SlotNClassSubjectData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.SlotClassSubjectId = data.SlotClassSubjectId;
          row.Action = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update(row) {

    this.dataservice.postPatch('SlotAndClassSubjects', this.SlotNClassSubjectData, this.SlotNClassSubjectData.SlotClassSubjectId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }
  GetClassSubject() {
    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let batchIds = this.Batches.filter(b => b.MasterDataName == globalconstants.getCurrentBatch());
    let batchId = 0;
    if (batchIds.length > 0) {
      batchId = batchIds[0].MasterDataId;
      filterStr += ' and BatchId eq ' + batchId;
    }

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
        //  console.log('data.value', data.value);
        this.ClassSubjectList = data.value.map(item => {
          var _class = this.Classes.filter(c => c.MasterDataId == item.ClassId)[0].MasterDataName;
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

    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.CurrentBatchId;
    var filterstr = '';
    filterstr = " and ExamDate ge datetime'" + new Date().toISOString() + "'";

    let list: List = new List();
    list.fields = ["ExamSlotId",
      "ExamId",
      "SlotNameId",
      "ExamDate",
      "Exam/ExamNameId"];
    list.PageName = "ExamSlots";
    list.lookupFields = ["Exam"];
    list.filter = ["Active eq 1 " + orgIdSearchstr + filterstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //this.Exams = [...data.value];
        this.ExamSlots = data.value.map(s => {
          let exams = this.ExamNames.filter(e => e.MasterDataId == s.Exam.ExamNameId);
          var _examname = '';
          if (exams.length > 0)
            _examname = exams[0].MasterDataName;
          return {
            SlotId: s.ExamSlotId,
            SlotName: _examname + " - " + this.SlotNames.filter(n => n.MasterDataId == s.SlotNameId)[0].MasterDataName
          }
        })
        this.GetClassSubject();

      })
  }
  GetSlotNClassSubjects() {

    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.CurrentBatchId;
    var filterstr = 'Active eq 1 ';
    if (this.searchForm.get("searchSlotId").value == 0) {
      this.alert.error("Please select exam slot", this.optionAutoClose);
      return;
    }
    if (this.searchForm.get("searchClassId").value == 0 && this.searchForm.get("searchSubjectId").value > 0) {
      this.alert.error("Class must be selected if subject is selected.", this.optionAutoClose);
      return;
    }

    filterstr = 'SlotId eq ' + this.searchForm.get("searchSlotId").value;

    let list: List = new List();
    list.fields = [
      "SlotClassSubjectId",
      "SlotId",
      "ClassSubjectId",
      "Active",
      "ExamSlot/SlotNameId",
      "ClassSubject/SubjectId",
      "ClassSubject/ClassId"];
    list.PageName = "SlotAndClassSubjects";
    list.lookupFields = ["ClassSubject", "ExamSlot"];
    list.filter = [filterstr + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        var filteredData = [];
        this.SlotNClassSubjects = [];
        if (this.searchForm.get("searchSubjectId").value == 0 && this.searchForm.get("searchClassId").value == 0) {
          this.ClassSubjectList.forEach(clssub => {

            let existing = data.value.filter(db => db.ClassSubjectId == clssub.ClassSubjectId);
            if (existing.length > 0)
              this.SlotNClassSubjects.push({

                SlotClassSubjectId: existing[0].SlotClassSubjectId,
                SlotId: existing[0].SlotId,
                Slot: this.ExamSlots.filter(s => s.SlotId == existing[0].SlotId)[0].SlotName,
                ClassSubjectId: existing[0].ClassSubjectId,
                ClassSubject: clssub.ClassSubject,
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
                Active: 0,
                Action: false
              });
            }
          })
        }
        else {
          if (this.searchForm.get("searchClassId").value > 0 && this.searchForm.get("searchSubjectId").value == 0) {

            filteredData = data.value.filter(d => d.ClassSubject.ClassId == this.searchForm.get("searchClassId").value);

            let fitleredClassSubject = this.ClassSubjectList.filter(f => f.ClassId == this.searchForm.get("searchClassId").value);

            fitleredClassSubject.forEach(cs => {
              let existing = filteredData.filter(ex => ex.ClassSubjectId == cs.ClassSubjectId)
              if (existing.length > 0) {
                this.SlotNClassSubjects.push({
                  SlotClassSubjectId: existing[0].SlotClassSubjectId,
                  SlotId: this.searchForm.get("searchSlotId").value,
                  Slot: this.ExamSlots.filter(s => s.SlotId == this.searchForm.get("searchSlotId").value)[0].SlotName,
                  ClassSubjectId: cs.ClassSubjectId,
                  ClassSubject: this.ClassSubjectList.filter(f => f.ClassSubjectId == cs.ClassSubjectId)[0].ClassSubject,
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
                  Active: 0,
                  Action: false
                });
              }
            })
          }
          else {
            if (this.searchForm.get("searchSubjectId").value > 0 && this.searchForm.get("searchClassId").value > 0) {
              filteredData = data.value.filter(d => d.ClassSubject.SubjectId == this.searchForm.get("searchSubjectId").value
                && d.ClassSubject.ClassId == this.searchForm.get("searchClassId").value);
            }
            if (filteredData.length > 0) {
              this.SlotNClassSubjects.push(filteredData[0]);
            }
            else {
              let _classSubjectId = this.ClassSubjectList.filter(cs => cs.SubjectId == this.searchForm.get("searchSubjectId").value &&
                cs.ClassId == this.searchForm.get("searchClassId").value)[0].ClassSubjectId;
              this.SlotNClassSubjects.push({
                SlotClassSubjectId: 0,
                SlotId: this.searchForm.get("searchSlotId").value,
                Slot: this.ExamSlots.filter(s => s.SlotId == this.searchForm.get("searchSlotId").value)[0].SlotName,
                ClassSubjectId: _classSubjectId,
                ClassSubject: this.ClassSubjectList.filter(f => f.ClassSubjectId == _classSubjectId)[0].ClassSubject,
                Active: 0,
                Action: false
              });
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
  saveall() {
    this.SlotNClassSubjects.forEach(record => {
      if (record.Action == true) {
        this.UpdateOrSave(record);
      }
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
        this.SlotNames = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].EXAMSLOTNAME);
        this.Batches = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].BATCH);
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].EXAMNAME);
        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].CLASS);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].SUBJECT);

        this.shareddata.ChangeBatch(this.Batches);
        this.GetCurrentBatchIDnAssign();
        //this.GetExamSlots();
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
  Active: number;
  Action: boolean;
}


