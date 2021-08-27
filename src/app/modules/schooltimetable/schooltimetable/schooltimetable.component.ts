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
  selector: 'app-schooltimetable',
  templateUrl: './schooltimetable.component.html',
  styleUrls: ['./schooltimetable.component.scss']
})
export class SchooltimetableComponent implements OnInit {
  //weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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
  rowCount = 0;
  DataToSave = 0;
  SelectedBatchId = 0;
  StoredForUpdate = [];
  Classes = [];
  Sections = [];
  Subjects = [];
  WeekDays = [];
  Periods = [];
  Batches = [];
  ClassSubjects = [];
  ClassWiseSubjects=[];
  AllClassPeriods = [];
  SchoolTimeTableListName = "SchoolTimeTables";
  SchoolTimeTableList = [];
  dataSource: MatTableDataSource<ISchoolTimeTable>;
  allMasterData = [];
  PagePermission = '';
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
  displayedColumns = [];
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
      searchClassId: [0],
      searchClassIdApplyAll: [0]
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
  updateActive(row, value) {

    row.Action = true;
    row.Active = value.checked ? 1 : 0;
  }
  UpdateOrSave(row) {

    debugger;

    this.loading = true;
    let checkFilterString = "ClassId eq " + row.ClassId +
      " and SectionId eq " + row.SectionId +
      " and DayId eq " + row.DayId +
      " and SchoolClassPeriodId eq " + row.SchoolClassPeriodId

    if (row.TimeTableId > 0)
      checkFilterString += " and TimeTableId ne " + row.TimeTableId;
    checkFilterString += " and " + this.StandardFilterWithBatchId;

    let list: List = new List();
    list.fields = ["TimeTableId"];
    list.PageName = this.SchoolTimeTableListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {

          this.SchoolTimeTableData.SchoolClassPeriodId = row.SchoolClassPeriodId;
          this.SchoolTimeTableData.ClassId = row.ClassId;
          this.SchoolTimeTableData.Active = row.Active;
          this.SchoolTimeTableData.DayId = row.PeriodId;
          this.SchoolTimeTableData.SectionId = row.SectionId;
          this.SchoolTimeTableData.ClassSubjectId = row.ClassSubjectId;

          this.SchoolTimeTableData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.SchoolTimeTableData.BatchId = this.SelectedBatchId;

          //console.log('data', this.ClassSubjectData);
          if (this.SchoolTimeTableData.TimeTableId == 0) {
            this.SchoolTimeTableData["CreatedDate"] = new Date();
            this.SchoolTimeTableData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.SchoolTimeTableData["UpdatedDate"] = new Date();
            delete this.SchoolTimeTableData["UpdatedBy"];
            //console.log('exam slot', this.SchoolClassPeriodListData)
            this.insert(row);
          }
          else {
            delete this.SchoolTimeTableData["CreatedDate"];
            delete this.SchoolTimeTableData["CreatedBy"];
            this.SchoolTimeTableData["UpdatedDate"] = new Date();
            this.SchoolTimeTableData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    debugger;
    this.dataservice.postPatch(this.SchoolTimeTableListName, this.SchoolTimeTableData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.TimeTableId = data.TimeTableId;
          row.Action = false;
          this.loading = false;
          this.rowCount++;
          if (this.rowCount == this.DataToSave) {
            this.loading = false;
            this.alert.success("Data saved successfully", this.optionAutoClose);
          }
          //this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.SchoolTimeTableListName, this.SchoolTimeTableData, this.SchoolTimeTableData.TimeTableId, 'patch')
      .subscribe(
        (data: any) => {
          //this.loading = false;
          this.rowCount++;
          row.Action = false;
          if (this.rowCount == this.DataToSave) {
            this.loading = false;
            this.alert.success("Data saved successfully", this.optionAutoClose);
          }
          //this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }

  GetSchoolTimeTable() {

    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.SchoolTimeTableList = [];
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 ';
    if (this.searchForm.get("searchClassId").value == 0) {
      this.alert.info("Please select class", this.optionAutoClose);
      return;
    }
    this.loading = true;
    filterstr = 'ClassId eq ' + this.searchForm.get("searchClassId").value;

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
    list.filter = [filterstr + orgIdSearchstr];
    this.displayedColumns = [
      'Day'
    ];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        var forDisplay;
        this.ClassWiseSubjects = this.ClassSubjects.filter(f=>f.ClassId == this.searchForm.get("searchClassId").value);
        console.log(this.ClassSubjects)
        console.log('dropdown',this.ClassWiseSubjects);
        this.WeekDays.forEach(p => {
          forDisplay = {
            Day: p.MasterDataName
          }
          var forSelectedClsPeriods; 
          var filterPeriods= this.AllClassPeriods.filter(a => a.ClassId == this.searchForm.get("searchClassId").value);
          
          forSelectedClsPeriods =filterPeriods.sort((a,b)=>a.Sequence - b.Sequence);
          
          forSelectedClsPeriods.forEach(c => {
            if (!this.displayedColumns.includes(c.Period))
              this.displayedColumns.push(c.Period);
            var existing = data.value.filter(d => d.SchoolClassPeriodId == c.SchoolClassPeriodId)
            if (existing.length > 0) {
              this.StoredForUpdate.push(existing[0]);
              forDisplay[c.Period] = this.ClassSubjects.filter(s => s.ClassSubjectId == existing[0].ClassSubjectId)[0].SubjectName                
            }
            else
            {
              forDisplay[c.Period] =0;
              this.StoredForUpdate.push({
                "TimeTableId":0,
                "DayId":p.MasterDataId,
                "ClassId":c.ClassId,
                "SectionId":this.searchForm.get("searchSectionId").value,
                "SchoolClassPeriodId":0,
                "ClassSubjectId":0,
                "Active":0
              })
            }

          })
          forDisplay["Action"] = '';
          this.SchoolTimeTableList.push(forDisplay);
          
        })
        this.displayedColumns.push("Action");
        this.dataSource = new MatTableDataSource<ISchoolTimeTable>(this.SchoolTimeTableList);
        this.loading = false;
      })
  }
  UpdateAll(){

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

  onBlur(element, event) {
    element.Action = true;
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
      "FromToTime",
      "Active"
    ];
    list.PageName = "SchoolClassPeriods";
    list.filter = [orgIdSearchstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AllClassPeriods = data.value.map(m => {
          m.Period = this.Periods.filter(p => p.MasterDataId == m.PeriodId)[0].MasterDataName;
          return m;
        });
        this.loading=false;
      })
  }
  GetClassSubject() {

    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();
    list.fields = [
      "ClassSubjectTeacherId",
      "TeacherId",
      "ClassSubjectId",
      "ClassSubject/ClassId",
      "ClassSubject/SubjectId",
      "EmpEmployee/ShortName"

    ];
    list.PageName = "ClassSubjectTeachers";
    list.lookupFields = ["EmpEmployee", "ClassSubject"];
    list.filter = [filterStr];
    this.loading=true;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassSubjects = data.value.map(cs => {
          var _class = this.Classes.filter(c => c.MasterDataId == cs.ClassSubject.ClassId)[0].MasterDataName;
          var _subject = this.Subjects.filter(c => c.MasterDataId == cs.ClassSubject.SubjectId)[0].MasterDataName;
          var _shortNameObj = this.Subjects.filter(c => c.MasterDataId == cs.EmpEmployee.ShortName)
          var _shortName = '';
          if (_shortNameObj.length > 0)
            _shortName = "," + _shortNameObj[0].MasterDataName;

          return {
            ClassSubjectId: cs.ClassSubjectId,
            ClassId: cs.ClassSubject.ClassId,
            ClassName: _class,
            SubjectName: _subject + _shortName
          }
        })
        this.loading=false;
      })
  }
  ReplicateToClasses() {

    if (this.searchForm.get("searchClassIdApplyAll").value == 0) {
      this.alert.info("Please select classes to replicate to!", this.optionsNoAutoClose);
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
  SaveAll() {

    this.loading = true;
    this.rowCount = 0;
    var checkedRows = this.SchoolTimeTableList.filter(f => f.Action);
    this.DataToSave = checkedRows.length;

    checkedRows.forEach(record => {
      this.UpdateOrSave(record);

    })
  }
  SaveRow(element) {
    debugger;
    this.loading = true;
    this.rowCount = 0;

    this.DataToSave = 1;
    this.UpdateOrSave(element);
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
        this.Periods = this.getDropDownData(globalconstants.MasterDefinitions.school.PERIOD);

        this.Periods.sort((a, b) => a.Sequence - b.Sequence);
        this.WeekDays = this.getDropDownData(globalconstants.MasterDefinitions.school.WEEKDAYS);
        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASS);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);

        this.shareddata.ChangeBatch(this.Batches);
        //this.loading = false;
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



