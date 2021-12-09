import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
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
  Permission = 'deny';
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
    private contentservice: ContentService,
    private nav: Router,
    private shareddata: SharedataService,
    private datepipe: DatePipe,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchExamId: [0],
      searchClassId: [0]
    });
    this.PageLoad();
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    //console.log('loginuserdetail', this.LoginUserDetail)
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.REPORT.EXAMTIMETABLE);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      //console.log('this.Permission', this.Permission)
      if (this.Permission != 'deny') {
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
          this.GetMasterData();
        });

        this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
        this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);


      }
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
        //debugger;
        //  //console.log('data.value', data.value);
        this.ClassSubjectList = data.value.map(item => {
          var _class = '';
          var clsObj = this.Classes.filter(c => c.ClassId == item.ClassId);
          if (clsObj.length > 0)
            _class = clsObj[0].ClassName
          var _subject = '';
          var subjObj = this.Subjects.filter(c => c.MasterDataId == item.SubjectId);
          if (subjObj.length > 0)
            _subject = subjObj[0].MasterDataName;

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
    //debugger;
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
      "Sequence",
      "EndTime"];
    list.PageName = "ExamSlots";
    list.lookupFields = ["Exam($select=ExamNameId)"];
    list.filter = ["Active eq 1 " + orgIdSearchstr + filterstr];
    list.orderBy = "ExamId,Sequence";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //var filteredExams = data.value.filter(d => d.ExamId == this.searchForm.get("searchExamId").value)

        this.ExamSlots = data.value.map(s => {

          let exams = this.ExamNames.filter(e => e.MasterDataId == s.Exam.ExamNameId);
          var _slotName = this.SlotNames.filter(e => e.MasterDataId == s.SlotNameId)[0].MasterDataName;

          var day = this.weekday[new Date(s.ExamDate).getDay()]
          var _examname = '';
          if (exams.length > 0)
            _examname = exams[0].MasterDataName;
          return {
            SlotId: s.ExamSlotId,
            SlotName: _slotName + " - (" + s.StartTime + " - " + s.EndTime + ")",
            ExamName: _examname,
            ExamDate: s.ExamDate,
            StartTime: s.StartTime,
            EndTime: s.EndTime
          }
        })


      })
  }
  GetSlotNClassSubjects() {
    ////console.log("this.searchForm.get(searchClassId).value",this.searchForm.get("searchClassId").value)
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
      "Active"];
    list.PageName = "SlotAndClassSubjects";
    list.lookupFields = ["ClassSubject($select=ClassSubjectId,SubjectId,ClassId)",
      "Slot($filter=Active eq 1;$select=SlotNameId,ExamId,ExamDate,StartTime,EndTime)"];
    list.filter = [filterstr + orgIdSearchstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        var filteredData = [];
        if (this.searchForm.get("searchClassId").value.length > 0)
          filteredData = data.value.filter(d => d.Slot.ExamId == this.searchForm.get("searchExamId").value
            && this.searchForm.get("searchClassId").value.indexOf(d.ClassSubject.ClassId) > -1);
        else
          filteredData = data.value.filter(d => d.Slot.ExamId == this.searchForm.get("searchExamId").value);

        this.SlotNClassSubjects = [];
        this.displayedColumns = [];
        var _EachExamDate = alasql("select distinct Slot->ExamDate as ExamDate from ? order by Slot->ExamDate", [filteredData]);
        var filteredOneSlotSubjects = [];

        debugger;

        //preparing data for each exam date
        //var timeTableRow = {};
        var SubjectRow = {};
        _EachExamDate.forEach(edate => {
          var RowsForOneExamDate = [];

          var header = {};
          var SlotRow = {};
          var _examDate = new Date(edate.ExamDate);
          //_examDate.setHours(0,0,0,0);
          var day = this.weekday[_examDate.getDay()]
          var _dateHeader = "<b>"+this.datepipe.transform(_examDate, 'dd/MM/yyyy') + " - " + day + "</b>";
          var timeTableRow = [];
          //this.SlotNClassSubjects.push(timeTableRow);

          var examDateSlot = this.ExamSlots.filter(f => new Date(f.ExamDate).getTime() === new Date(_examDate).getTime());
          //timeTableRow = {};
          SubjectRow = {};
          examDateSlot.forEach((slot, index) => {
            var oneSlotClasslist = [];
            if (index == 0)
              header["Slot0"] = _dateHeader;
            else
              header["Slot" + index] = '';
            SlotRow["Slot" + index] = "<b>"+slot.SlotName + "</b>";

            if (this.displayedColumns.indexOf("Slot" + index) == -1)
              this.displayedColumns.push("Slot" + index);

            //filtering only for one slot in one exam date
            filteredOneSlotSubjects = filteredData.filter(f => f.SlotId == slot.SlotId
              && this.datepipe.transform(f.Slot.ExamDate, 'dd/MM/yyyy') == this.datepipe.transform(edate.ExamDate, 'dd/MM/yyyy'));
            //timeTableRow["ExamDate"]["slot" + index]["ClassSubject"] = [];

            var distinctClasses = alasql("select distinct ClassSubject->ClassId as ClassId from ? ", [filteredOneSlotSubjects]);
            oneSlotClasslist = distinctClasses.map(d => {
              var _classobj = this.Classes.filter(s => s.ClassId == d.ClassId);
              var _className = '';
              var _classSequence = '';
              if (_classobj.length > 0) {
                _classSequence = _classobj[0].Sequence;
                _className = _classobj[0].ClassName;
              }
              //timeTableRow.push({ "ClassName": _className })
              return { ["Slot" + index]: slot.SlotName, "ClassName": _className, "ClassId": d.ClassId, "Sequence": _classSequence, "Subjects": '' }
            });

            ////console.log("distinctClasses", classIdlist);
            filteredOneSlotSubjects.forEach(f => {
              var _subject = this.Subjects.filter(s => s.MasterDataId == f.ClassSubject.SubjectId)[0].MasterDataName;
              var classobj = oneSlotClasslist.filter(c => c.ClassId == f.ClassSubject.ClassId)
              if (classobj.length > 0)
                classobj[0].Subjects += classobj[0].Subjects.length == 0 ? classobj[0].ClassName + " - " + _subject : ", " + _subject
            })
            if (timeTableRow.length == 0) {
              oneSlotClasslist.forEach((r) => {
                timeTableRow.push({ ["Slot" + index]: r.Subjects })
              })
            }
            else {
              var existingrow = timeTableRow.length;
              oneSlotClasslist.forEach((r, inx) => {
                if (existingrow <= inx)
                  timeTableRow.push({ ["Slot" + index]: r.Subjects })
                else
                  timeTableRow[inx]["Slot" + index] = r.Subjects;
              })
            }
            //console.log("timeTableRow", timeTableRow)
          })

          this.SlotNClassSubjects.push(header);
          this.SlotNClassSubjects.push(SlotRow);
          RowsForOneExamDate.push(...timeTableRow);

          RowsForOneExamDate.forEach(row => {
            this.SlotNClassSubjects.push(row);
          })
          //this.SlotNClassSubjects.push(...timeTableRow);

          //console.log("SlotNClassSubjects", this.SlotNClassSubjects)
        })
        this.dataSource = new MatTableDataSource<any>(this.SlotNClassSubjects);
        this.loading = false;
      })
  }
  GetMasterData() {

    var orgIdSearchstr = 'and (ParentId eq 0  or OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ')';

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId", "Sequence"];
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
        this.GetExams();
        this.GetExamSlots();
        this.GetClassSubject();
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



