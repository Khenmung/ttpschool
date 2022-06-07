import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-schooltimetable',
  templateUrl: './schooltimetable.component.html',
  styleUrls: ['./schooltimetable.component.scss']
})
export class SchooltimetableComponent implements OnInit { PageLoading=true;
  //weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  SelectedApplicationId = 0;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  StandardFilterWithBatchId = '';
  loading = false;
  rowCount = -1;
  DataToSave = 0;
  SelectedBatchId = 0;
  StoredForUpdate = [];
  PeriodTypes = [];
  Classes = [];
  Sections = [];
  Subjects = [];
  WeekDays = [];
  Periods = [];
  Batches = [];
  ClassSubjects = [];
  ClassWiseSubjects = [];
  AllClassPeriods = [];
  AllTimeTable = [];
  SchoolTimeTableListName = "SchoolTimeTables";
  SchoolTimeTableList = [];
  dataSource: MatTableDataSource<any[]>;
  allMasterData = [];
  Permission = '';
  SchoolTimeTableData = {
    TimeTableId: 0,
    DayId: 0,
    ClassId: 0,
    SectionId: 0,
    SchoolClassPeriodId: 0,
    ClassSubjectId: 0,
    OrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns: any[] = [];
  searchForm: FormGroup;
  constructor(
    private datepipe: DatePipe,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private nav: Router,
    private shareddata: SharedataService,
    private fb: FormBuilder
  ) {

  }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchClassId: [0],
      searchSectionId: [0]
    });
    this.dataSource = new MatTableDataSource<any[]>([]);
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
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.TIMETABLE.CLASSTIMETABLE)
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
        });

        this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
        this.GetMasterData();
      }
    }
  }
  updateActive(row, value) {

    row.Action = true;
    row.Active = value.checked ? 1 : 0;
    var updateActive = this.StoredForUpdate.filter(s => s.DayId == row.DayId);
    updateActive.forEach(u => u.Active = 1)
  }
  // Save(row) {
  //   this.rowCount = 0;
  //   this.UpdateOrSave(row);
  // }
  UpdateOrSave(row) {

    debugger;
    //this.StoredForUpdate.filter(f=>f.TeacherId == row.)
    this.loading = true;
    let checkFilterString =
      "DayId eq " + row.DayId +
      //" and ClassSubjectId eq " + row.ClassSubjectId +   
      //" and TeacherId eq " + row.TeacherId +
      " and Active eq 1"
    //console.log("this.AllTimeTable", this.AllTimeTable)
    var duplicateCheck = alasql("select DayId,PeriodId,TeacherId,TeacherId from ? where DayId = ? and PeriodId = ? and TeacherId = ?", [this.AllTimeTable, row.DayId, row.PeriodId, row.TeacherId])
    if (duplicateCheck.length > 0) {
      //console.log("duplicateCheck",duplicateCheck);
      var _teacherobj = this.ClassSubjects.filter(f => f.TeacherId == row.TeacherId)
      this.contentservice.openSnackBar("Teacher " + _teacherobj[0].TeacherShortName + " already exists in the same period", globalconstants.ActionText, globalconstants.RedBackground);
      //this.loading = false; this.PageLoading=false;
    }
    else {

      this.SchoolTimeTableData.TimeTableId = row.TimeTableId;
      this.SchoolTimeTableData.SchoolClassPeriodId = row.SchoolClassPeriodId;
      this.SchoolTimeTableData.ClassId = row.ClassId;
      this.SchoolTimeTableData.Active = row.Active;
      this.SchoolTimeTableData.DayId = row.DayId;
      this.SchoolTimeTableData.SectionId = row.SectionId;
      this.SchoolTimeTableData.ClassSubjectId = row.ClassSubjectId;

      this.SchoolTimeTableData.OrgId = this.LoginUserDetail[0]["orgId"];
      this.SchoolTimeTableData.BatchId = this.SelectedBatchId;

      //console.log('data', this.SchoolTimeTableData);
      if (this.SchoolTimeTableData.TimeTableId == 0) {
        this.SchoolTimeTableData["CreatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
        this.SchoolTimeTableData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
        this.SchoolTimeTableData["UpdatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
        delete this.SchoolTimeTableData["UpdatedBy"];
        ////console.log('exam slot', this.SchoolClassPeriodListData)
        this.insert(row);
      }
      else {
        delete this.SchoolTimeTableData["CreatedDate"];
        delete this.SchoolTimeTableData["CreatedBy"];
        this.SchoolTimeTableData["UpdatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd')
        this.SchoolTimeTableData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
        this.update(row);
      }
    }
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.SchoolTimeTableListName, this.SchoolTimeTableData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.TimeTableId = data.TimeTableId;
          this.GetAllSchoolTimeTable();
          row.Action = false;
          this.loading = false; this.PageLoading=false;

          if (this.rowCount == 0) {
            this.rowCount = -1;
            this.loading = false; this.PageLoading=false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
          //this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.SchoolTimeTableListName, this.SchoolTimeTableData, this.SchoolTimeTableData.TimeTableId, 'patch')
      .subscribe(
        (data: any) => {
          debugger;
          this.GetAllSchoolTimeTable();
          //var this.AllTimeTable.filter(f=>)
          //this.loading = false; this.PageLoading=false;
          //this.rowCount++;
          row.Action = false;
          if (this.rowCount == 0) {
            this.rowCount = -1;
            this.loading = false; this.PageLoading=false;
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
          //this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
        });
  }
  // FilterClassSubject(pPeriod) {
  //   var _teacherIds = [];
  //   this.SchoolTimeTableList.forEach(timetable => {
  //     if (timetable.Period == pPeriod) {
  //       _teacherIds.push(timetable.TeacherId)
  //     }
  //   });
  //   this.ClassWiseSubjects = this.ClassSubjects.filter(f => _teacherIds.indexOf(f.TeacherId)==-1 &&);
  // }
  GetSchoolTimeTable() {
    debugger;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.SchoolTimeTableList = [];
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1';
    if (this.searchForm.get("searchClassId").value == 0) {
      this.contentservice.openSnackBar("Please select class", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (this.searchForm.get("searchSectionId").value == 0) {
      this.contentservice.openSnackBar("Please select section", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    filterstr += ' and ClassId eq ' + this.searchForm.get("searchClassId").value +
      ' and SectionId eq ' + this.searchForm.get("searchSectionId").value

    let list: List = new List();
    list.fields = [
      "TimeTableId",
      "DayId",
      "ClassId",
      "SectionId",
      "SchoolClassPeriodId",
      "ClassSubjectId",
      "Active"
    ];
    list.PageName = this.SchoolTimeTableListName;
    list.lookupFields = ["ClassSubject($select=TeacherId),SchoolClassPeriod($select=PeriodId)"]
    list.filter = [filterstr + orgIdSearchstr];
    this.displayedColumns = [
      'Day'
    ];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        var dbTimeTable = data.value.map((d => {
          d.Day = this.WeekDays.filter(w => w.MasterDataId == d.DayId)[0].MasterDataName;
          return d;
        }))
        var forDisplay: any[] = [];
        var _classId = this.searchForm.get("searchClassId").value;
        //this is used in html for subject dropdown.
        this.ClassWiseSubjects = this.ClassSubjects.filter(f => f.ClassId == _classId);

        //iterrate through class
        //iterrate through weekdays
        // iterate through class periods

        ////console.log('this.WeekDays',this.WeekDays);
        var filterPeriods = this.AllClassPeriods.filter(a => a.ClassId == _classId);
        if (filterPeriods.length == 0) {
          this.contentservice.openSnackBar("Period not yet defined for this class.", globalconstants.ActionText, globalconstants.RedBackground);

        }
        else {
          this.WeekDays.forEach(p => {
            forDisplay = [];
            forDisplay["Day"] = p.MasterDataName;
            forDisplay["DayId"] = p.MasterDataId;

            var forSelectedClsPeriods;


            forSelectedClsPeriods = filterPeriods.sort((a, b) => a.Sequence - b.Sequence);

            forSelectedClsPeriods.forEach(clsperiod => {
              var _period = clsperiod.PeriodType.includes('Free Time') ? 'f_' + clsperiod.Period : clsperiod.Period;

              if (!this.displayedColumns.includes(_period))
                this.displayedColumns.push(_period);

              var existing = dbTimeTable.filter(d => d.SchoolClassPeriod.PeriodId == clsperiod.PeriodId && d.DayId == p.MasterDataId)
              if (existing.length > 0) {
                existing[0].PeriodId = clsperiod.PeriodId;
                existing[0].Period = _period;
                existing[0].Action = false;
                existing[0].TeacherId = existing[0].ClassSubject.TeacherId;
                existing[0].Sequence = clsperiod.Sequence;
                this.StoredForUpdate.push(existing[0]);
                forDisplay[clsperiod.Period] = existing[0].ClassSubjectId;//this.ClassSubjects.filter(s => s.ClassSubjectId == )[0].SubjectName
                //this.ClassWiseSubjects = this.ClassWiseSubjects.filter(f=>f.TeacherId != existing[0].TeacherId) 
                forDisplay["Active"] = existing[0].Active;
              }
              else {
                forDisplay[clsperiod.Period] = 0;
                this.StoredForUpdate.push({
                  "TimeTableId": 0,
                  "DayId": p.MasterDataId,
                  "Day": p.MasterDataName,
                  "ClassId": clsperiod.ClassId,
                  "SectionId": this.searchForm.get("searchSectionId").value,
                  "SchoolClassPeriodId": clsperiod.SchoolClassPeriodId,
                  "ClassSubjectId": 0,
                  "TeacherId": 0,
                  "Sequence": clsperiod.Sequence,
                  "Period": _period,
                  "PeriodId": clsperiod.PeriodId,
                  "Active": 0,
                  "Action": false
                })
              }

            })
            forDisplay["Action"] = false;
            forDisplay["Sequence"] = p.Sequence;
            this.SchoolTimeTableList.push(forDisplay);

          })
        }
        this.SchoolTimeTableList.sort((a, b) => a.Sequence - b.Sequence)
        this.displayedColumns.push("Action");
        this.dataSource = new MatTableDataSource<any>(this.SchoolTimeTableList);
        this.loading = false; this.PageLoading=false;
      })
  }
  GetAllSchoolTimeTable() {
    debugger;
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1';

    let list: List = new List();
    list.fields = [
      "TimeTableId",
      "DayId",
      "ClassId",
      "SectionId",
      "SchoolClassPeriodId",
      "ClassSubjectId",
      "Active"
    ];
    list.PageName = this.SchoolTimeTableListName;
    list.lookupFields = ["ClassSubject($select=TeacherId),SchoolClassPeriod($select=PeriodId)"]
    list.filter = [filterstr + orgIdSearchstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        var dbTimeTable = data.value.map((d => {
          d.Day = this.WeekDays.filter(w => w.MasterDataId == d.DayId)[0].MasterDataName;
          return d;
        }))
        this.AllTimeTable = [];
        //this.WeekDays.forEach(p => {
        //  this.AllClassPeriods.forEach(clsperiod => {
        //    var _period = clsperiod.PeriodType.includes('Free Time') ? 'f_' + clsperiod.Period : clsperiod.Period;

        //var existing = dbTimeTable.filter(d => d.SchoolClassPeriod.PeriodId == clsperiod.PeriodId && d.DayId == p.MasterDataId)
        //if (existing.length > 0) {
        dbTimeTable.forEach(f => {
          f.PeriodId = f.SchoolClassPeriod.PeriodId;
          f.TeacherId = f.ClassSubject.TeacherId;
          this.AllTimeTable.push(f);
        })
        // existing[0].PeriodId = _period;
        // existing[0].TeacherId = existing[0].ClassSubject.TeacherId;
        // this.AllTimeTable.push(existing[0]);
        //}
        // })
        //})
      })
  }

  GetAllClassPeriods() {
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.SchoolTimeTableList = [];
    var orgIdSearchstr = ' OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    //var filterstr = '';// 'Active eq 1 ';

    this.loading = true;

    let list: List = new List();
    list.fields = [
      "SchoolClassPeriodId",
      "ClassId",
      "PeriodId",
      "PeriodTypeId",
      "Sequence",
      "FromToTime",
      "Active"
    ];
    list.PageName = "SchoolClassPeriods";
    list.filter = [orgIdSearchstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AllClassPeriods = data.value.map(m => {
          var _PeriodType = '';
          if (m.PeriodTypeId != null && m.PeriodTypeId != 0)
            _PeriodType = this.PeriodTypes.filter(p => p.MasterDataId == m.PeriodTypeId)[0].MasterDataName;
          var obj = this.Periods.filter(p => p.MasterDataId == m.PeriodId);
          m.Period = '';
          if (obj.length > 0)
            m.Period = obj[0].MasterDataName + " - " + m.FromToTime;

          m.PeriodType = _PeriodType;
          return m;
        }).sort((a, b) => a.Sequence - b.Sequence);

        this.loading = false; this.PageLoading=false;
        //console.log("this.AllClassPeriods", this.AllClassPeriods);
        this.GetAllSchoolTimeTable();
      })
  }
  GetClassSubject() {

    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    //+ ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();
    list.fields = [
      "ClassSubjectId",
      "ClassId",
      "SubjectId",
      "TeacherId"
    ];
    list.PageName = "ClassSubjects";
    list.lookupFields = ["Teacher($select=ShortName)"];
    list.filter = [filterStr];
    this.loading = true;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassSubjects = data.value.map(cs => {
          var objclass = this.Classes.filter(c => c.ClassId == cs.ClassId);
          var _class = '';
          if (objclass.length > 0)
            _class = objclass[0].ClassName;
          var objsubject = this.Subjects.filter(c => c.MasterDataId == cs.SubjectId);
          var _subject = '';
          if (objsubject.length > 0)
            _subject = objsubject[0].MasterDataName;

          var _shortName = cs.Teacher.ShortName;
          _shortName = _shortName == null ? '' : _shortName;

          return {
            ClassSubjectId: cs.ClassSubjectId,
            ClassId: cs.ClassId,
            ClassName: _class,
            TeacherId: cs.TeacherId,
            TeacherShortName: _shortName,
            SubjectAndTeacherName: _subject + " (" + _shortName + ")"
          }
        })
        this.loading = false; this.PageLoading=false;
      })
  }
  ReplicateToClasses() {

    if (this.searchForm.get("searchClassIdApplyAll").value == 0) {
      this.contentservice.openSnackBar("Please select classes to replicate to!", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    this.rowCount = 0;

    //not action means data has been saved.
    var filteredAction = this.SchoolTimeTableList.filter(s => !s.Action);
    var selectedClassIds = this.searchForm.get("searchClassIdApplyAll").value;
    delete selectedClassIds[this.searchForm.get("searchClassId").value];
    this.DataToSave = filteredAction.length * selectedClassIds.length;
    var existInDB = [];

    filteredAction.forEach(toReplicate => {
      selectedClassIds.forEach(toSelectedClassId => {
        existInDB = this.AllClassPeriods.filter(d => d.ClassId == toSelectedClassId && d.PeriodId == toReplicate.PeriodId)
        if (existInDB.length == 0) {
          var toinsert = JSON.parse(JSON.stringify(toReplicate));
          toinsert.SchoolClassPeriodId = 0;
          toinsert.ClassId = toSelectedClassId;
          this.UpdateOrSave(toinsert);
        }
        else {
          var _schoolClassPeriodId = 0;
          existInDB.forEach(e => {
            _schoolClassPeriodId = JSON.parse(JSON.stringify(e.SchoolClassPeriodId));
            e = JSON.parse(JSON.stringify(toReplicate));
            e.SchoolClassPeriodId = _schoolClassPeriodId;
            e.ClassId = toSelectedClassId;
            this.UpdateOrSave(e);

          })
        }
      })
    })


  }

  SaveRow(element) {
    //debugger;
    this.loading = true;
    this.rowCount = 0;

    var _toUpdate = this.StoredForUpdate.filter(s => s.Day == element.Day && s.Action);

    var validated = _toUpdate.filter(t => t.ClassSubjectId == 0 && !t.Period.includes('f_'));
    if (validated.length > 0) {
      this.loading = false; this.PageLoading=false;
      this.contentservice.openSnackBar("Subject must be selected for periods", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.rowCount = _toUpdate.length;
    for (var rowCount = 0; rowCount < _toUpdate.length; rowCount++) {
      this.rowCount--;
      this.UpdateOrSave(_toUpdate[rowCount]);
    }
    element.Action = false;

  }
  SaveAll() {
    var _toUpdate = this.StoredForUpdate.filter(s => s.Action);

    var validated = _toUpdate.filter(t => t.ClassSubjectId == 0 && !t.Period.includes('f_'));
    if (validated.length > 0) {
      this.loading = false; this.PageLoading=false;
      this.contentservice.openSnackBar("Subject must be selected for periods", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.rowCount = _toUpdate.length;
    for (var i = 0; i < _toUpdate.length; i++) {
      this.rowCount--;
      this.UpdateOrSave(_toUpdate[i]);
    }
  }
  CheckAll(value) {
    this.SchoolTimeTableList.forEach(record => {
      if (value.checked)
        record.Active = 1;
      else
        record.Active = 0;
      record.Action = !record.Action;
    })
  }

  onBlur(element, event, columnName) {
    debugger;
    var rowtoUpdateForSavingPurpose = this.StoredForUpdate.filter(s => s.Period == columnName && s.Day == element.Day);
    if (rowtoUpdateForSavingPurpose.length > 0) {
      rowtoUpdateForSavingPurpose[0]["ClassSubjectId"] = event.value;
      rowtoUpdateForSavingPurpose[0]["Action"] = true;
      rowtoUpdateForSavingPurpose[0]["Active"] = 1;
      rowtoUpdateForSavingPurpose[0]["TeacherId"] = this.ClassWiseSubjects.filter(f => f.ClassSubjectId == event.value)[0].TeacherId;
      //this.ClassWiseSubjects = this.ClassWiseSubjects.filter(f=>f.TeacherId!=rowtoUpdateForSavingPurpose[0]["TeacherId"])
    }

    element.Action = true;
  }

  GetMasterData() {
    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Periods = this.getDropDownData(globalconstants.MasterDefinitions.school.PERIOD);
        this.Periods.sort((a, b) => a.Sequence - b.Sequence);

        this.PeriodTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.PERIODTYPE);
        this.WeekDays = this.getDropDownData(globalconstants.MasterDefinitions.school.WEEKDAYS);

        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.Batches = this.tokenstorage.getBatches()
        //this.shareddata.ChangeBatch(this.Batches);
        //this.loading = false; this.PageLoading=false;
        this.GetClassSubject();
        this.GetAllClassPeriods();
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
export interface ISchoolTimeTable {

  TimeTableId: number;
  DayId: number;
  ClassId: number;
  SectionId: number;
  SchoolClassPeriodId: number;
  ClassSubjectId: number;
  Active: number;
  Action: boolean;
}




