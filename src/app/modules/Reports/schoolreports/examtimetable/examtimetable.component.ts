import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import alasql from 'alasql';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-examtimetable',
  templateUrl: './examtimetable.component.html',
  styleUrls: ['./examtimetable.component.scss']
})
export class ExamtimetableComponent implements OnInit {
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
  StandardFilterWithBatchId = '';
  loading = false;
  SlotNClassSubjects = [];
  SelectedBatchId = 0;
  ExamSlots = [];
  Classes = [];
  Subjects = [];
  ExamNames = [];
  SlotNames = [];
  Batches = [];
  Exams = [];
  DateArray = [];
  ClassSubjectList = [];
  dataSource: MatTableDataSource<[]>;
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
      searchClassId: [0]
    });
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      //this.shareddata.CurrentSelectedBatchId.subscribe(c => this.SelectedBatchId = c);
      this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
      this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);

      this.GetMasterData();
    }
  }

  loadingFalse() {
    this.loading = false;
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
        this.loading = false;
      })
  }
  GetExamSlots() {
    debugger;
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = '';
    //filterstr = " and ExamDate ge datetime'" + new Date().toISOString() + "'";

    let list: List = new List();
    list.fields = [
      "ExamSlotId",
      "ExamId",
      "SlotNameId",
      "ExamDate",
      "StartTime",
      "EndTime",
      "Exam/ExamNameId"];
    list.PageName = "ExamSlots";
    list.lookupFields = ["Exam"];
    list.filter = ["Active eq 1 " + orgIdSearchstr + filterstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        var filteredExams = data.value.filter(d => d.ExamId == this.searchForm.get("searchExamId").value)

        this.ExamSlots = filteredExams.map(s => {

          let exams = this.ExamNames.filter(e => e.MasterDataId == s.Exam.ExamNameId);
          var _slotName = this.SlotNames.filter(e => e.MasterDataId == s.SlotNameId)[0].MasterDataName;

          var day = this.weekday[new Date(s.ExamDate).getDay()]
          var _examname = '';
          if (exams.length > 0)
            _examname = exams[0].MasterDataName;
          return {
            SlotId: s.ExamSlotId,
            SlotName: _slotName + " - " + this.datepipe.transform(s.ExamDate, 'dd/MM/yyyy') + " - " + day + " - " + s.StartTime + " - " + s.EndTime,
            ExamName: _examname
          }
        })
        this.GetClassSubject();

      })
  }
  GetSlotNClassSubjects() {
    //console.log("this.searchForm.get(searchClassId).value",this.searchForm.get("searchClassId").value)
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 ';
    if (this.searchForm.get("searchExamId").value == 0) {
      this.alert.error("Please select exam.", this.optionAutoClose);
      return;
    }


    let list: List = new List();
    list.fields = [
      "SlotClassSubjectId",
      "SlotId",
      "ClassSubjectId",
      "Active",
      "ExamSlot/SlotNameId",
      "ExamSlot/ExamId",
      "ExamSlot/ExamDate",
      "ExamSlot/StartTime",
      "ExamSlot/EndTime",
      "ClassSubject/ClassSubjectId",
      "ClassSubject/SubjectId",
      "ClassSubject/ClassId"];
    list.PageName = "SlotAndClassSubjects";
    list.lookupFields = ["ClassSubject", "ExamSlot"];
    list.filter = [filterstr + orgIdSearchstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        var filteredData = [];
        if (this.searchForm.get("searchClassId").value.length > 0)
          filteredData = data.value.filter(d => d.ExamSlot.ExamId == this.searchForm.get("searchExamId").value
            && this.searchForm.get("searchClassId").value.indexOf(d.ClassSubject.ClassId) > -1);
        else
          filteredData = data.value.filter(d => d.ExamSlot.ExamId == this.searchForm.get("searchExamId").value);

        var dateTable = [];
        this.SlotNClassSubjects = [];
        this.displayedColumns = [];
        var _EachExamDate = alasql("select distinct ExamSlot->ExamDate as ExamDate from ? ", [filteredData]);
        var filteredEachExamDate = [];
        debugger;

        //preparing data for each exam date
        _EachExamDate.forEach(edate => {

          dateTable = [];
          var _examDate = this.datepipe.transform(edate.ExamDate, 'dd/MM/yyyy');
          
          //filtering only for one exam date
          filteredEachExamDate = filteredData.filter(f => this.datepipe.transform(f.ExamSlot.ExamDate, 'dd/MM/yyyy') == this.datepipe.transform(edate.ExamDate, 'dd/MM/yyyy'));
          var day = this.weekday[new Date(edate.ExamDate).getDay()]
          var _dateHeader = "<b>" + _examDate + " - " + day + "</b>";
          filteredEachExamDate.forEach(f => {
            var _subject = this.Subjects.filter(s => s.MasterDataId == f.ClassSubject.SubjectId)[0].MasterDataName;
            var _class = this.Classes.filter(s => s.MasterDataId == f.ClassSubject.ClassId);
            var _className = _class[0].MasterDataName;
            var _classSequence = _class[0].Sequence;
            var _slotName = this.SlotNames.filter(s => s.MasterDataId == f.ExamSlot.SlotNameId)[0].MasterDataName;
            var _slotColumn = _slotName + " (" + f.ExamSlot.StartTime + "-" + f.ExamSlot.EndTime + ")";
            var _classSubject = _className + " " + _subject;

            if (!this.displayedColumns.includes(_slotColumn)) {
              this.displayedColumns.push(_slotColumn);
              dateTable[_slotColumn] = '';
            }
            var emptyrowForThisCol = dateTable.filter(d => d[_slotColumn] == '' || d[_slotColumn] == null);
            if (emptyrowForThisCol.length > 0)
              emptyrowForThisCol[0][_slotColumn] = _classSubject;
            else
              dateTable.push({
                ExamDate: _examDate,
                [_slotColumn]: _classSubject,
                Sequence: _classSequence
              })
          })

          //sort class wise.
          dateTable.sort((a, b) => a.Sequence - b.Sequence);

          //preparing date header
          var row = JSON.parse(JSON.stringify(dateTable[0]));
          this.displayedColumns.forEach((c, index) => {
            row[c] = index == 0 ? _dateHeader : '';
          })

          //inserting date header
          dateTable.splice(0, 0, row);
          
          //merging arrays;
          this.SlotNClassSubjects = [...this.SlotNClassSubjects, ...dateTable];

        })
        this.dataSource = new MatTableDataSource<any>(this.SlotNClassSubjects);
        this.loading = false;
      })
  }
  GetMasterData() {

    var orgIdSearchstr = 'and (ParentId eq 0  or OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ')';

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId", "Sequence"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.SlotNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSLOTNAME);
        this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASS);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);

        this.shareddata.ChangeBatch(this.Batches);
        this.GetExams();
        //this.GetExamSlots();
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
}



