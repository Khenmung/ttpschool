import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-dailytimetablereport',
  templateUrl: './dailytimetablereport.component.html',
  styleUrls: ['./dailytimetablereport.component.scss']
})
export class DailytimetablereportComponent implements OnInit {
    PageLoading = true;
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
      "TeacherSubjectId",
      "Active"
    ];
    list.PageName = this.SchoolTimeTableListName;
    list.lookupFields = ["TeacherSubject($select=EmployeeId),SchoolClassPeriod($select=PeriodId)"]
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
        this.ClassWiseSubjects = this.TeacherSubjectList.filter(f => f.ClassId == _classId);

        //iterrate through class
        //iterrate through weekdays
        // iterate through class periods

        ////console.log('this.WeekDays',this.WeekDays);
        var filterPeriods = this.AllClassPeriods.filter(a => a.ClassId == _classId);
        //console.log("filterPeriods", filterPeriods)
        if (filterPeriods.length == 0) {
          this.contentservice.openSnackBar("Period not yet defined for this class.", globalconstants.ActionText, globalconstants.RedBackground);

        }
        else {
          var usedWeekDays = this.WeekDays.filter(f => dbTimeTable.filter(db => db.DayId == f.MasterDataId).length > 0)
          usedWeekDays.forEach(p => {
            forDisplay = [];
            forDisplay["Day"] = p.MasterDataName;
            forDisplay["DayId"] = p.MasterDataId;

            var forSelectedClsPeriods;


            forSelectedClsPeriods = filterPeriods.sort((a, b) => a.Sequence - b.Sequence);

            forSelectedClsPeriods.forEach(clsperiod => {
              var _period = clsperiod.PeriodType.includes('Free Time') ? 'f_' + clsperiod.Period : clsperiod.Period;
              if (!this.displayedColumns.includes(_period))
                this.displayedColumns.push(_period);

              var existing = dbTimeTable.filter(d => d.SchoolClassPeriod.PeriodId == clsperiod.PeriodId
                && d.DayId == p.MasterDataId)
              if (existing.length > 0) {
                existing.forEach(exist => {
                  exist.PeriodId = clsperiod.PeriodId;
                  exist.Period = _period;
                  exist.Action = false;
                  exist.TeacherId = exist.TeacherSubject.EmployeeId;
                  exist.Sequence = clsperiod.Sequence;

                  this.StoredForUpdate.push(exist);
                  var objcls = this.ClassWiseSubjects.filter(s => s.TeacherSubjectId == exist.TeacherSubjectId);
                  if (objcls.length > 0) {

                    forDisplay[clsperiod.Period] = objcls[0].SubjectName

                  }
                })
              }
              else {
                forDisplay[clsperiod.Period] = 0;
              }

            })
            //forDisplay["Action"] = false;
            forDisplay["Sequence"] = p.Sequence;
            this.SchoolTimeTableList.push(forDisplay);

          })
        }
        this.SchoolTimeTableList.sort((a, b) => a.Sequence - b.Sequence)
        //this.displayedColumns.push("Action");
        this.dataSource = new MatTableDataSource<any>(this.SchoolTimeTableList);
        this.loading = false; this.PageLoading = false;
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
        console.log("this.TeacherSubjectList", this.TeacherSubjectList);
        this.loading = false;
        this.PageLoading = false;
      });
  }
  // GetSchoolTimeTable() {
  //   debugger;
  //   //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
  //   this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
  //   this.SchoolTimeTableList = [];
  //   var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
  //   var filterstr = 'Active eq 1 ';
  //   if (this.searchForm.get("searchClassId").value == 0) {
  //     this.contentservice.openSnackBar("Please select class", globalconstants.ActionText, globalconstants.RedBackground);
  //     return;
  //   }
  //   if (this.searchForm.get("searchSectionId").value == 0) {
  //     this.contentservice.openSnackBar("Please select section", globalconstants.ActionText, globalconstants.RedBackground);
  //     return;
  //   }
  //   this.loading = true;
  //   filterstr = 'ClassId eq ' + this.searchForm.get("searchClassId").value +
  //     ' and SectionId eq ' + this.searchForm.get("searchSectionId").value

  //   let list: List = new List();
  //   list.fields = [
  //     "TimeTableId",
  //     "DayId",
  //     "ClassId",
  //     "SectionId",
  //     "SchoolClassPeriodId",
  //     "ClassSubjectId",
  //     "Active"
  //   ];
  //   list.PageName = this.SchoolTimeTableListName;
  //   //list.lookupFields = ["SchoolClassPeriod"]
  //   list.filter = [filterstr + orgIdSearchstr];
  //   this.displayedColumns = [
  //     'Day'
  //   ];
  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       //debugger;
  //       var dbTimeTable = data.value.map((d => {
  //         d.Day = this.WeekDays.filter(w => w.MasterDataId == d.DayId)[0].MasterDataName;
  //         return d;
  //       }))
  //       var forDisplay: any[] = [];
  //       var _classId = this.searchForm.get("searchClassId").value;
  //       //this is used in html for subject dropdown.
  //       this.ClassWiseSubjects = this.ClassSubjects.filter(f => f.ClassId == _classId);

  //       //iterrate through class
  //       //iterrate through weekdays
  //       // iterate through class periods

  //       ////console.log('this.WeekDays',this.WeekDays);
  //       var filterPeriods = this.AllClassPeriods.filter(a => a.ClassId == _classId);
  //       if (filterPeriods.length == 0) {
  //         this.contentservice.openSnackBar("Period not yet defined for this class.", globalconstants.ActionText, globalconstants.RedBackground);

  //       }
  //       else {
  //         this.WeekDays.forEach(p => {
  //           forDisplay = [];
  //           forDisplay["Day"] = p.MasterDataName;
  //           forDisplay["DayId"] = p.MasterDataId;

  //           var forSelectedClsPeriods;


  //           forSelectedClsPeriods = filterPeriods.sort((a, b) => a.Sequence - b.Sequence);

  //           forSelectedClsPeriods.forEach(c => {
  //             var _period = c.PeriodType.includes('Free Time') ? 'f_' + c.Period : c.Period;

  //             if (!this.displayedColumns.includes(_period))
  //               this.displayedColumns.push(_period);

  //             var existing = dbTimeTable.filter(d => d.SchoolClassPeriodId == c.SchoolClassPeriodId && d.DayId == p.MasterDataId)
  //             if (existing.length > 0) {
  //               existing[0].Period = _period;
  //               existing[0].Action = false;
  //               this.StoredForUpdate.push(existing[0]);
  //               forDisplay[c.Period] = this.ClassSubjects.filter(s=>s.ClassSubjectId == existing[0].ClassSubjectId)[0].SubjectName;//this.ClassSubjects.filter(s => s.ClassSubjectId == )[0].SubjectName
  //               forDisplay["Active"] = existing[0].Active;
  //             }
  //             else {
  //               forDisplay[c.Period] = '';

  //               this.StoredForUpdate.push({
  //                 "TimeTableId": 0,
  //                 "DayId": p.MasterDataId,
  //                 "Day": p.MasterDataName,
  //                 "ClassId": c.ClassId,
  //                 "SectionId": this.searchForm.get("searchSectionId").value,
  //                 "SchoolClassPeriodId": c.SchoolClassPeriodId,
  //                 "ClassSubjectId": 0,
  //                 "Period": _period,
  //                 "Active": 0,
  //                 "Action": false
  //               })
  //             }

  //           })
  //           forDisplay["Action"] = false;
  //           forDisplay["Sequence"] = p.Sequence;
  //           this.SchoolTimeTableList.push(forDisplay);

  //         })
  //       }
  //       this.SchoolTimeTableList.sort((a, b) => a.Sequence - b.Sequence)
  //       this.displayedColumns.push("Action");
  //       this.dataSource = new MatTableDataSource<any>(this.SchoolTimeTableList);
  //       this.loading = false; this.PageLoading=false;
  //     })
  // }
  GetAllClassPeriods() {
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.SchoolTimeTableList = [];
    var orgIdSearchstr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    //var filterstr = 'Active eq 1';

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
          if (obj.length > 0) {
            m.PeriodWithTime = obj[0].MasterDataName + " - " + m.FromToTime;
            m.Period = obj[0].MasterDataName;
          }
          m.PeriodType = _PeriodType;
          return m;
        }).sort((a, b) => a.Sequence - b.Sequence);

        this.loading = false; this.PageLoading = false;
        //console.log("this.AllClassPeriods", this.AllClassPeriods);
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

          // var _shortName = cs.Teacher.ShortName;
          // _shortName = _shortName == null ? '' : ", " + _shortName;

          return {
            ClassSubjectId: cs.ClassSubjectId,
            ClassId: cs.ClassId,
            ClassName: _class,
            SubjectName: _subject
          }
        })
        this.GetTeacherSubject();
        this.loading = false; this.PageLoading = false;
      })
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
    return this.contentservice.getDropDownData(dropdowntype, this.tokenstorage, this.allMasterData);
    // let Id = 0;
    // let Ids = this.allMasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();//globalconstants.GENDER
    // })
    // if (Ids.length > 0) {
    //   Id = Ids[0].MasterDataId;
    //   return this.allMasterData.filter((item, index) => {
    //     return item.ParentId == Id
    //   })
    // }
    // else
    //   return [];

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




