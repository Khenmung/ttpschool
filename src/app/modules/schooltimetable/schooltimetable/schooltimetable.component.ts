import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
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
export class SchooltimetableComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  PageLoading = true;
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
  dataSourceDayStatistic: MatTableDataSource<any[]>;
  dataSourcePeriodStatistic: MatTableDataSource<any[]>;
  allMasterData = [];
  Permission = '';
  SchoolTimeTableData = {
    TimeTableId: 0,
    DayId: 0,
    ClassId: 0,
    SectionId: 0,
    SchoolClassPeriodId: 0,
    TeacherSubjectId: 0,
    OrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns: any[] = [];
  DataForAllClasses = [];
  searchForm: UntypedFormGroup;
  constructor(
    private datepipe: DatePipe,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private nav: Router,
    private shareddata: SharedataService,
    private fb: UntypedFormBuilder
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
  UpdateOrSave(element, row) {

    debugger;
    //this.StoredForUpdate.filter(f=>f.TeacherId == row.)
    this.loading = true;
    let checkFilterString =
      "DayId eq " + row.DayId +
      //" and TeacherSubjectId eq " + row.TeacherSubjectId +   
      //" and TeacherId eq " + row.TeacherId +
      " and Active eq 1"
    //console.log("this.AllTimeTable", this.AllTimeTable)
    var duplicateCheck = alasql("select DayId,PeriodId,TeacherId from ? where DayId = ? and PeriodId = ? and TeacherId = ?",
      [this.DataForAllClasses, row.DayId, row.PeriodId, row.TeacherId])
    if (duplicateCheck.length > 1) {
      //console.log("duplicateCheck",duplicateCheck);
      var _detail = '';
      var _dupdetail = this.DataForAllClasses.filter(f => f.DayId == row.DayId && f.PeriodId == row.PeriodId && row.TeacherId == row.TeacherId);
      _dupdetail.forEach(d => {
        var objclass = this.Classes.filter(c => c.ClassId == d.ClassId);
        var _className = '';
        if (objclass.length > 0)
          _className = objclass[0].ClassName;
        var _sectionName = '';
        var objSection = this.Sections.filter(f => f.MasterDataId == d.SectionId);
        if (objSection.length > 0)
          _sectionName = objSection[0].MasterDataName;

        _detail += "Class: " + _className + ", Section: " + _sectionName + ", Period: " + d.Period + "\n";

      })
      var _teacherobj = this.TeacherSubjectList.filter(f => f.EmployeeId == row.TeacherId)
      this.contentservice.openSnackBar("Teacher " + _teacherobj[0].TeacherName + " already exists in the same period in another class.\n" + _detail, globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false;
      element.Action = true;
    }
    else {

      this.SchoolTimeTableData.TimeTableId = row.TimeTableId;
      this.SchoolTimeTableData.SchoolClassPeriodId = row.SchoolClassPeriodId;
      this.SchoolTimeTableData.ClassId = row.ClassId;
      this.SchoolTimeTableData.Active = row.Active;
      this.SchoolTimeTableData.DayId = row.DayId;
      this.SchoolTimeTableData.SectionId = row.SectionId;
      this.SchoolTimeTableData.TeacherSubjectId = row.TeacherSubjectId;

      this.SchoolTimeTableData.OrgId = this.LoginUserDetail[0]["orgId"];
      this.SchoolTimeTableData.BatchId = this.SelectedBatchId;

      //console.log('data', this.SchoolTimeTableData);
      if (this.SchoolTimeTableData.TimeTableId == 0) {
        this.SchoolTimeTableData["CreatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
        this.SchoolTimeTableData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
        this.SchoolTimeTableData["UpdatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
        delete this.SchoolTimeTableData["UpdatedBy"];
        ////console.log('exam slot', this.SchoolClassPeriodListData)
        this.insert(element, row);
      }
      else {
        delete this.SchoolTimeTableData["CreatedDate"];
        delete this.SchoolTimeTableData["CreatedBy"];
        this.SchoolTimeTableData["UpdatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd')
        this.SchoolTimeTableData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
        this.update(element);
      }
    }
  }

  insert(element, row) {

    //debugger;
    this.dataservice.postPatch(this.SchoolTimeTableListName, this.SchoolTimeTableData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.TimeTableId = data.TimeTableId;
          //this.GetAllSchoolTimeTable();
          //this.GetSchoolTimeTable();
          element.Action = false;
          this.loading = false;
          if (this.rowCount == 0) {
            this.rowCount = -1;
            this.loading = false; this.PageLoading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
          //this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }, error => console.log('insert error', error));
  }
  update(row) {

    this.dataservice.postPatch(this.SchoolTimeTableListName, this.SchoolTimeTableData, this.SchoolTimeTableData.TimeTableId, 'patch')
      .subscribe(
        (data: any) => {
          debugger;
          //this.GetAllSchoolTimeTable();
          //this.GetSchoolTimeTable();
          row.Action = false;
          if (this.rowCount == 0) {
            this.rowCount = -1;
            this.loading = false;
            this.PageLoading = false;
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
          //this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
        });
  }
  // AllSchoolTable = [];
  // GetAllSchoolTable() {
  //   var orgIdSearchstr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"] +
  //     ' and BatchId eq ' + this.SelectedBatchId;
  //   let list: List = new List();
  //   list.fields = [
  //     "TimeTableId",
  //     "DayId",
  //     "ClassId",
  //     "SectionId",
  //     "SchoolClassPeriodId",
  //     "TeacherSubjectId",
  //     "Active"
  //   ];
  //   list.PageName = this.SchoolTimeTableListName;
  //   list.lookupFields = ["TeacherSubject($select=EmployeeId),SchoolClassPeriod($select=PeriodId)"]
  //   list.filter = [orgIdSearchstr];
  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       this.AllSchoolTable = data.value.map((d => {
  //         d.Day = this.WeekDays.filter(w => w.MasterDataId == d.DayId)[0].MasterDataName;
  //         d.TeacherId = d.TeacherSubject!=null?d.TeacherSubject.EmployeeId:0;
  //         d.PeriodId = d.SchoolClassPeriod.PeriodId;
  //         d.Period = this.AllClassPeriods.filter(f=>f.PeriodId == d.SchoolClassPeriod.PeriodId)[0].Period;
  //         return d;
  //       }))
  //     });
  // }
  DayStatisticDisplay = ["TeacherName"];
  PeriodStatisticDisplay = ["TeacherName", "Day"];
  DayStatistics = [];
  PeriodStatistics = [];
  GetSchoolTimeTable() {
    debugger;
    this.DayStatistics = [];
    this.PeriodStatistics = [];
    this.dataSourceDayStatistic = new MatTableDataSource<any>(this.DayStatistics);
    this.dataSourcePeriodStatistic = new MatTableDataSource<any>(this.PeriodStatistics);
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.SchoolTimeTableList = [];

    var _classId = this.searchForm.get("searchClassId").value;
    var _sectionId = this.searchForm.get("searchSectionId").value;


    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_sectionId == 0) {
      this.contentservice.openSnackBar("Please select section", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;

    this.displayedColumns = [
      'Action',
      'Day'
    ];

    this.FormatData(_classId, _sectionId);

    this.GetStatistic();
    this.SchoolTimeTableList.sort((a, b) => a.Sequence - b.Sequence)
    //this.displayedColumns.push("Action");
    this.dataSource = new MatTableDataSource<any>(this.SchoolTimeTableList);
    this.loading = false; this.PageLoading = false;
    //})
  }
  FormatData(pClassId, pSectionId) {

    var dbTimeTable = [];
    this.StoredForUpdate = [];
    if (pClassId > 0 && pSectionId > 0)
      dbTimeTable = this.AllTimeTable.filter(f => f.ClassId == pClassId && f.SectionId == pSectionId);
    else
      dbTimeTable = [...this.AllTimeTable]

    this.SchoolTimeTableList = [];
    var forDisplay: any[] = [];
    var distinctClass = alasql("select distinct ClassId from ?", [dbTimeTable]);
    if (distinctClass.length == 0)
      distinctClass.push({ ClassId: pClassId, SectionId: pSectionId });

    distinctClass.forEach(distinctcls => {
      this.ClassWiseSubjects = this.TeacherSubjectList.filter(f => f.ClassId == distinctcls.ClassId);
      if (this.ClassWiseSubjects.length == 0 && pClassId > 0) {
        this.contentservice.openSnackBar("Subject Teacher not defined for this class!", globalconstants.ActionText, globalconstants.RedBackground);
      }
      else {
        //iterrate through class
        //iterrate through weekdays
        // iterate through class periods
        var filterPeriods = [];
        filterPeriods = this.AllClassPeriods.filter(a => a.ClassId == distinctcls.ClassId);

        if (filterPeriods.length == 0) {
          this.contentservice.openSnackBar("Period not yet defined for this class.",globalconstants.ActionText,globalconstants.RedBackground);
          console.log("Period not yet defined for this class : " + distinctcls.ClassId);
        }
        else {

          var forSelectedClsPeriods;
          forSelectedClsPeriods = filterPeriods.sort((a, b) => a.Sequence - b.Sequence);
          debugger;
          this.WeekDays.sort((a, b) => a.Sequence - b.Sequence).forEach(p => {
            if (!this.DayStatisticDisplay.includes(p.MasterDataName))
              this.DayStatisticDisplay.push(p.MasterDataName)
          })
          this.WeekDays.forEach(p => {
            forDisplay = [];
            forDisplay["Day"] = p.MasterDataName;
            forDisplay["DayId"] = p.MasterDataId;

            forSelectedClsPeriods.forEach(clsperiod => {
              var _period = clsperiod.PeriodType.includes('Free Time') ? 'f_' + clsperiod.Period : clsperiod.Period;

              if (!this.displayedColumns.includes(_period))
                this.displayedColumns.push(_period);
              if (!this.PeriodStatisticDisplay.includes(_period) && !_period.includes('f_'))
                this.PeriodStatisticDisplay.push(_period);

              var existing = dbTimeTable.filter(d =>
                d.SchoolClassPeriod.PeriodId == clsperiod.PeriodId
                //&& d.SectionId == pSectionId
                && d.DayId == p.MasterDataId
                && d.ClassId == distinctcls.ClassId)
              if (existing.length > 0) {
                existing.forEach(alreadyassignedclassperiod => {
                  alreadyassignedclassperiod.PeriodId = clsperiod.PeriodId;
                  alreadyassignedclassperiod.Period = _period;
                  alreadyassignedclassperiod.Action = false;
                  alreadyassignedclassperiod.TeacherId = alreadyassignedclassperiod.TeacherSubject == null ? 0 : alreadyassignedclassperiod.TeacherSubject.EmployeeId;
                  alreadyassignedclassperiod.Sequence = clsperiod.Sequence;
                  this.StoredForUpdate.push(alreadyassignedclassperiod);
                  forDisplay[clsperiod.Period] = alreadyassignedclassperiod.TeacherSubjectId;//this.ClassSubjects.filter(s => s.TeacherSubjectId == )[0].SubjectName
                  forDisplay["Active"] = alreadyassignedclassperiod.Active;
                })
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
                  "TeacherSubjectId": 0,
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
      }
    })//foreach distinct class

  }
  GetStatistic() {
    this.DayStatistics = [];
    this.PeriodStatistics = [];

    var _DistinctTeacher = alasql("select distinct EmployeeId,TeacherName from ?", [this.ClassWiseSubjects]);

    _DistinctTeacher.forEach(teacherobj => {
      var _forCurrentTeacher = this.DataForAllClasses.filter(assigned => assigned.TeacherId == teacherobj.EmployeeId);
      var _eachDay = alasql("select Day,Count(1) NoOfClasses from ? group by Day", [_forCurrentTeacher]);

      this.DayStatisticDisplay.forEach(col => {
        var daymatch = _eachDay.filter(d => d.Day == col);
        daymatch.forEach(d => {
          var row = this.DayStatistics.filter(s => s.TeacherName.trim() == teacherobj.TeacherName.trim());
          if (row.length > 0)
            row[0][col] = d.NoOfClasses;
          else {
            var _data = { TeacherName: teacherobj.TeacherName.trim(), TeacherId: teacherobj.EmployeeId, Day: d.Day, [d.Day]: d.NoOfClasses }
            this.DayStatistics.push(_data);
          }
        })
      })
    })
    var _colNotToCount = ['TeacherName', 'TeacherId', 'Day'];
    if (!this.DayStatisticDisplay.includes('Total'))
      this.DayStatisticDisplay.push("Total");
    this.DayStatistics.forEach(d => {
      var _totalPeriods = 0;
      Object.keys(d).forEach(period => {
        if (!_colNotToCount.includes(period)) {
          _totalPeriods += d[period]
        }
      })
      d.Total = _totalPeriods;
    })
    console.log("DayStatisticDisplay", this.DayStatisticDisplay);
    console.log("this.DayStatistics", this.DayStatistics);
    this.dataSourceDayStatistic = new MatTableDataSource<any>(this.DayStatistics);
    this.dataSourceDayStatistic.sort = this.sort;
  }
  GetPeriodStatistic(TeacherId, dayName) {
    debugger;
    var _DistinctTeacher = this.ClassWiseSubjects.filter(f => f.EmployeeId == TeacherId);
    var _forCurrentTeacher = this.DataForAllClasses.filter(assigned => assigned.TeacherId == TeacherId
      && assigned.Day == dayName);
    var _eachPeriod = alasql("select Period,Count(1) NoOfClasses from ? group by Period", [_forCurrentTeacher]);
    this.PeriodStatisticDisplay.forEach(col => {
      var periodmatch = _eachPeriod.filter(f => f.Period == col);
      if (periodmatch.length > 0) {
        var row = this.PeriodStatistics.filter(s => s.TeacherName.trim() == _DistinctTeacher[0].TeacherName.trim());
        if (row.length > 0)
          row[0][col] = periodmatch[0].NoOfClasses;
        else {
          var _data = { TeacherName: _DistinctTeacher[0].TeacherName.trim(), TeacherId: TeacherId, Day: dayName, [col]: periodmatch[0].NoOfClasses }
          this.PeriodStatistics.push(_data);
        }
      }
    })

    //console.log("PeriodStatisticDisplay", this.PeriodStatisticDisplay);
    //console.log("this.PeriodStatistics", this.PeriodStatistics);

    this.dataSourcePeriodStatistic = new MatTableDataSource<any>(this.PeriodStatistics);
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
      "TeacherSubjectId",
      "Active"
    ];
    list.PageName = this.SchoolTimeTableListName;
    list.lookupFields = ["TeacherSubject($select=TeacherSubjectId,EmployeeId),SchoolClassPeriod($select=PeriodId)"]
    list.filter = [filterstr + orgIdSearchstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        var dbTimeTable = data.value.map((d => {
          d.Day = this.WeekDays.filter(w => w.MasterDataId == d.DayId)[0].MasterDataName;
          return d;
        }))
        this.AllTimeTable = [];
        dbTimeTable.forEach(f => {
          var _teacherId = 0;
          if (f.TeacherSubject != null)
            _teacherId = f.TeacherSubject.EmployeeId;

          f.PeriodId = f.SchoolClassPeriod.PeriodId;
          f.Period = this.AllClassPeriods.filter(p => p.PeriodId == f.SchoolClassPeriod.PeriodId)[0].Period;
          f.TeacherId = _teacherId;
          this.AllTimeTable.push(f);
        })
        this.FormatData(0, 0);
        this.DataForAllClasses = JSON.parse(JSON.stringify(this.StoredForUpdate));
        this.StoredForUpdate = [];
      })
  }
  TeacherSubjectList = [];
  GetTeacherSubject() {
    let filterStr = '';//' OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    //debugger;
    this.loading = true;

    filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    let list: List = new List();
    list.fields = [
      'TeacherSubjectId',
      'EmployeeId',
      'ClassSubjectId',
      'Active',
    ];

    list.PageName = "TeacherSubjects";
    list.lookupFields = ["Employee($select=ShortName,FirstName,LastName)"];
    list.filter = [filterStr];
    this.TeacherSubjectList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        data.value.forEach(teachersubject => {
          var _teacherName = teachersubject.Employee.FirstName;
          if (teachersubject.Employee.LastName != '')
            _teacherName += " " + teachersubject.Employee.LastName;

          var objClsSubject = this.ClassSubjects.filter(clssubject => clssubject.ClassSubjectId == teachersubject.ClassSubjectId)
          objClsSubject.forEach(clssubject => {
            teachersubject["ClassName"] = clssubject["ClassName"];
            teachersubject["SubjectName"] = clssubject.SubjectName + " (" + teachersubject.Employee.ShortName + ")";
            teachersubject.ClassId = clssubject.ClassId;
            teachersubject.TeacherName = _teacherName;
            this.TeacherSubjectList.push(teachersubject);
          });
        })
        //console.log("this.TeacherSubjectList", this.TeacherSubjectList);
        this.loading = false;
        this.PageLoading = false;
      });
  }
  GetAllClassPeriods() {
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.SchoolTimeTableList = [];
    var orgIdSearchstr = ' OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;

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
        debugger;
        this.AllClassPeriods = data.value.map(m => {
          var _PeriodType = '';
          if (m.PeriodTypeId != null && m.PeriodTypeId != 0)
            _PeriodType = this.PeriodTypes.filter(p => p.MasterDataId == m.PeriodTypeId)[0].MasterDataName;
          var obj = this.Periods.filter(p => p.MasterDataId == m.PeriodId);
          m.Period = '';
          if (obj.length > 0)
            m.Period = obj[0].MasterDataName// + " - " + m.FromToTime;

          m.PeriodType = _PeriodType;
          return m;
        }).sort((a, b) => a.Sequence - b.Sequence);
        if (this.AllClassPeriods.length == 0) {
          this.contentservice.openSnackBar("Class periods not defined.", globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.GetAllSchoolTimeTable();
        }
        this.loading = false; this.PageLoading = false;

      })
  }
  GetClassSubject() {

    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    //+ ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();
    list.fields = [
      "ClassSubjectId",
      "ClassId",
      "SubjectId"
    ];
    list.PageName = "ClassSubjects";
    //list.lookupFields = ["Teacher($select=ShortName)"];
    list.filter = [filterStr];
    this.loading = true;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassSubjects = [];
        data.value.forEach(cs => {
          var objclass = this.Classes.filter(c => c.ClassId == cs.ClassId);
          var _class = '';
          if (objclass.length > 0) {
            _class = objclass[0].ClassName;
            var objsubject = this.Subjects.filter(c => c.MasterDataId == cs.SubjectId);
            var _subject = '';
            if (objsubject.length > 0) {
              _subject = objsubject[0].MasterDataName;
              this.ClassSubjects.push({
                ClassSubjectId: cs.ClassSubjectId,
                ClassId: cs.ClassId,
                ClassName: _class,
                SubjectName: _subject
              });
            }
          }
        })
        this.GetTeacherSubject();
        this.loading = false;
        this.PageLoading = false;
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
          this.UpdateOrSave(toReplicate, toinsert);
        }
        else {
          var _schoolClassPeriodId = 0;
          existInDB.forEach(e => {
            _schoolClassPeriodId = JSON.parse(JSON.stringify(e.SchoolClassPeriodId));
            e = JSON.parse(JSON.stringify(toReplicate));
            e.SchoolClassPeriodId = _schoolClassPeriodId;
            e.ClassId = toSelectedClassId;
            this.UpdateOrSave(toReplicate, e);

          })
        }
      })
    })


  }

  SaveRow(element) {
    debugger;
    this.loading = true;
    this.rowCount = 0;

    var _toUpdate = this.StoredForUpdate.filter(s => s.Day == element.Day && s.Action);

    var validated = _toUpdate.filter(t => t.TeacherSubjectId == 0 && !t.Period.includes('f_'));
    if (validated.length > 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Subject must be selected for periods", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.rowCount = _toUpdate.length;
    for (var rowCount = 0; rowCount < _toUpdate.length; rowCount++) {
      this.rowCount--;
      this.UpdateOrSave(element, _toUpdate[rowCount]);
    }
    //element.Action = false;

  }
  SaveAll() {
    var _toUpdate = this.StoredForUpdate.filter(s => s.Action);

    var validated = _toUpdate.filter(t => t.TeacherSubjectId == 0 && !t.Period.includes('f_'));
    if (validated.length > 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Subject must be selected for periods", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
debugger;
    this.rowCount = _toUpdate.length;
    for (var i = 0; i < _toUpdate.length; i++) {
      this.rowCount--;
      this.UpdateOrSave(_toUpdate[i], _toUpdate[i]);
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
    var obj = this.ClassWiseSubjects.filter(f => f.TeacherSubjectId == event.value);
    var _teacherId = 0;
    this.DayStatistics = [];
    this.PeriodStatistics = [];

    if (obj.length > 0) {
      _teacherId = obj[0].EmployeeId;
      var rowtoUpdateForSavingPurpose = this.StoredForUpdate.filter(s => s.Period == columnName && s.Day == element.Day);
      if (rowtoUpdateForSavingPurpose.length > 0) {
        rowtoUpdateForSavingPurpose[0]["TeacherSubjectId"] = event.value;
        rowtoUpdateForSavingPurpose[0]["Action"] = true;
        rowtoUpdateForSavingPurpose[0]["Active"] = 1;
        rowtoUpdateForSavingPurpose[0]["TeacherId"] = _teacherId;
      }
      var _sectionId = this.searchForm.get("searchSectionId").value;
      //var _classId =this.searchForm.get("searchClassId").value;
      var rowToSelectFrom = this.DataForAllClasses.filter(s =>
        s.ClassId == obj[0].ClassId
        && s.SectionId == _sectionId
        && s.Period == columnName
        && s.Day == element.Day);
      if (rowToSelectFrom.length > 0) {
        rowToSelectFrom[0]["TeacherSubjectId"] = event.value;
        rowToSelectFrom[0]["Action"] = true;
        rowToSelectFrom[0]["Active"] = 1;
        rowToSelectFrom[0]["TeacherId"] = _teacherId;
      }
      else {
        var _data = {
          TeacherName: obj[0].TeacherName, TeacherId: _teacherId,
          TimeTableId: 0, Day: element.Day, DayId: element.DayId, ClassId: obj[0].ClassId,
          SectionId: _sectionId,
          Period: columnName,
          TeacherSubjectId: event.value, Active: 1, Action: true
        }
        this.DataForAllClasses.push(_data);
      }
      this.GetPeriodStatistic(_teacherId, element.Day);
    }

    element.Action = true;
    this.GetStatistic();
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

        this.GetAllClassPeriods();
        this.GetClassSubject();

      });
  }

  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenstorage, this.allMasterData);
  }

}
export interface ISchoolTimeTable {

  TimeTableId: number;
  DayId: number;
  ClassId: number;
  SectionId: number;
  SchoolClassPeriodId: number;
  TeacherSubjectId: number;
  Active: number;
  Action: boolean;
}




