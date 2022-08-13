import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-teacherattendance',
  templateUrl: './teacherattendance.component.html',
  styleUrls: ['./teacherattendance.component.scss']
})
export class TeacherAttendanceComponent implements OnInit { PageLoading=true;

  //@Input() StudentClassId:number;
  @ViewChild("table") mattable;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  edited = false;
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  EnableSave = true;
  SaveAll = false;
  NoOfRecordToUpdate = 0;
  StudentDetailToDisplay = '';
  StudentClassId = 0;
  StandardFilter = '';
  loading = false;
  Teachers = [];
  WorkAccounts = [];
  SelectedBatchId = 0;
  SelectedApplicationId = 0;
  Batches = [];
  AttendanceStatus = [];
  Permission = 'deny';
  TeacherAttendanceList: ITeacherAttendance[] = [];
  dataSource: MatTableDataSource<ITeacherAttendance>;
  allMasterData = [];
  searchForm = this.fb.group({
    searchClassId: [0],
    searchSectionId: [0],
    searchAttendanceDate: [new Date()]
  });
  TeacherAttendanceData = {
    AttendanceId: 0,
    TeacherId: 0,
    AttendanceStatus: 0,
    AttendanceDate: new Date(),
    Remarks: '',
    BatchId: 0,
    OrgId: 0
  };
  displayedColumns = [
    'TeacherName',
    'AttendanceStatus',
    'Remarks',
    'Action'
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,

    private nav: Router,
    private contentservice: ContentService,
    private datepipe: DatePipe
  ) { }

  ngOnInit(): void {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.ATTENDANCE.TEACHERATTENDANCE)
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
        this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
        this.GetMasterData();
      }
    }
    //this.GetEmployeeAttendance();
  }
  PageLoad() {

  }
  checkall(value) {
    this.TeacherAttendanceList.forEach(record => {
      if (value.checked) {
        record.AttendanceStatus = 1;
      }
      else
        record.AttendanceStatus = 0;
      record.Action = true;
    })
  }

  GetEmployeeAttendance() {
    debugger;
    this.TeacherAttendanceList = [];
    this.dataSource = new MatTableDataSource<any>(this.TeacherAttendanceList);

    var _attendanceDate = new Date(this.searchForm.get("searchAttendanceDate").value);
    if (_attendanceDate == null) {
      this.contentservice.openSnackBar("Please select attendance date.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    //var attendancedate = new Date(this.searchForm.get("searchAttendanceDate").value);
    _attendanceDate.setHours(0, 0, 0, 0);
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    if (_attendanceDate.getTime() > today.getTime()) {
      this.contentservice.openSnackBar("Attendance date cannot be greater than today's date", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else if (_attendanceDate.getTime() != today.getTime()) {
      this.EnableSave = false;
    }
    else
      this.EnableSave = true;
      
    var orgIdSearchstr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    var _WorkAccount = this.WorkAccounts.filter(f => f.MasterDataName.toLowerCase() == "teaching");
    var _workAccountId = 0;
    if (_WorkAccount.length > 0)
      _workAccountId = _WorkAccount[0].MasterDataId;

    let list: List = new List();

    list.fields = ["WorkAccountId"];
    list.PageName = "EmpEmployeeGradeSalHistories";
    list.lookupFields = ["Employee($select=EmpEmployeeId,FirstName,LastName,ShortName)"]
    list.filter = [orgIdSearchstr + " and Active eq 1 and (ManagerId eq " + localStorage.getItem("employeeId") + " or ReportingTo eq " + localStorage.getItem("employeeId") + ")"];
    //list.orderBy = "ParentId";
    this.Teachers = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.filter(f => {
          this.Teachers.push({
            TeacherId: f.Employee.EmpEmployeeId,
            TeacherName: f.Employee.FirstName + " " + f.Employee.LastName + " (" + f.Employee.ShortName + ")"
          })
        })


        list = new List();
        list.fields = [
          "AttendanceId",
          "TeacherId",
          "AttendanceDate",
          "AttendanceStatus",
          "Remarks",
          "OrgId",
          "BatchId"
        ];
        list.PageName = "Attendances";
        var datefilterStr = ' and AttendanceDate ge ' + moment(_attendanceDate).format('yyyy-MM-DD')
        datefilterStr += ' and AttendanceDate lt ' + moment(_attendanceDate).add(1, 'day').format('yyyy-MM-DD')

        list.filter = ["OrgId eq " + this.LoginUserDetail[0]["orgId"] + datefilterStr];

        this.dataservice.get(list)
          .subscribe((attendance: any) => {

            this.Teachers.forEach(sc => {
              let existing = attendance.value.filter(db => db.TeacherId == sc.TeacherId);
              if (existing.length > 0) {
                this.TeacherAttendanceList.push({
                  AttendanceId: existing[0].AttendanceId,
                  TeacherId: existing[0].TeacherId,
                  AttendanceStatus: existing[0].AttendanceStatus,
                  AttendanceDate: existing[0].AttendanceDate,
                  Remarks: existing[0].Remarks,
                  TeacherName: sc.TeacherName,
                  Action: false
                });
              }
              else
                this.TeacherAttendanceList.push({
                  AttendanceId: 0,
                  TeacherId: sc.TeacherId,
                  AttendanceStatus: 0,
                  AttendanceDate: new Date(),
                  Remarks: '',
                  TeacherName: sc.TeacherName,
                  Action: false
                });
            })
            this.TeacherAttendanceList = this.TeacherAttendanceList.sort((a,b)=>b.AttendanceStatus-a.AttendanceStatus);
            this.dataSource = new MatTableDataSource<ITeacherAttendance>(this.TeacherAttendanceList);
            this.dataSource.paginator=this.paginator;
            this.dataSource.sort = this.sort;
            this.loading = false; this.PageLoading=false;
          });
        //this.changeDetectorRefs.detectChanges();
      });
  }
  clear() {

  }
  UpdateActive(element, event) {
    element.Action = true;
    //debugger;
    element.AttendanceStatus = event.checked == true ? 1 : 0;
  }
  onChangeEvent(row, value) {
    //debugger;
    if (row.Remarks.length > 0)
      row.Action = true;
  }

  saveall() {
    var toUpdateAttendance = this.TeacherAttendanceList.filter(f => f.Action);
    this.NoOfRecordToUpdate = toUpdateAttendance.length;
    this.loading=true;
    toUpdateAttendance.forEach((record, indx) => {
      this.UpdateOrSave(record, indx);
    })
    if(toUpdateAttendance.length==0)
    {
      this.loading=false;
    }
  }
  UpdateOrSave(row, indx) {
    let checkFilterString = "AttendanceId eq " + row.AttendanceId +
      " and TeacherId eq " + row.TeacherId +
      " and AttendanceDate ge " + moment(row.AttendanceDate).format('YYYY-MM-DD') +
      " and AttendanceDate lt " + moment(row.AttendanceDate).add(1,'day').format('YYYY-MM-DD') +
      " and " + this.StandardFilter;

    if (row.AttendanceId > 0)
      checkFilterString += " and AttendanceId ne " + row.AttendanceId;

    let list: List = new List();
    list.fields = ["AttendanceId"];
    list.PageName = "Attendances";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.TeacherAttendanceData.TeacherId = row.TeacherId;
          this.TeacherAttendanceData.AttendanceDate = row.AttendanceDate;
          this.TeacherAttendanceData.AttendanceId = row.AttendanceId;
          this.TeacherAttendanceData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.TeacherAttendanceData.BatchId = this.SelectedBatchId;
          this.TeacherAttendanceData.AttendanceStatus = row.AttendanceStatus;
          this.TeacherAttendanceData.Remarks = row.Remarks;
          if (this.TeacherAttendanceData.AttendanceId == 0) {
            this.TeacherAttendanceData["CreatedDate"] = new Date();
            this.TeacherAttendanceData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.TeacherAttendanceData["UpdatedDate"];
            delete this.TeacherAttendanceData["UpdatedBy"];
            this.insert(row, indx);
          }
          else {
            delete this.TeacherAttendanceData["CreatedDate"];
            delete this.TeacherAttendanceData["CreatedBy"];
            this.TeacherAttendanceData["UpdatedDate"] = new Date();
            this.TeacherAttendanceData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(indx);
          }
          row.Action = false;
        }
      });
  }

  insert(row, indx) {

    this.dataservice.postPatch('Attendances', this.TeacherAttendanceData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.edited = false;
          row.AttendanceId = data.AttendanceId;
          if (this.NoOfRecordToUpdate > 0) {
            if (this.NoOfRecordToUpdate == indx + 1) {
              this.loading=false;
              this.NoOfRecordToUpdate = 0;
              this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            }
          }
        });
  }
  update(indx) {
    this.dataservice.postPatch('Attendances', this.TeacherAttendanceData, this.TeacherAttendanceData.AttendanceId, 'patch')
      .subscribe(
        (data: any) => {
          this.edited = false;
          if (this.NoOfRecordToUpdate > 0) {
            if (this.NoOfRecordToUpdate == indx + 1) {
              this.NoOfRecordToUpdate = 0;
              this.loading=false;
              this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            }
          }
        });
  }
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.WorkAccounts = this.getDropDownData(globalconstants.MasterDefinitions.employee.WORKACCOUNT);
        this.AttendanceStatus = this.getDropDownData(globalconstants.MasterDefinitions.school.ATTENDANCESTATUS);
        this.loading = false; this.PageLoading=false;
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
export interface ITeacherAttendance {
  AttendanceId: number;
  TeacherId: number;
  AttendanceStatus: number;
  AttendanceDate: Date;
  TeacherName: string;
  Remarks: string;
  Action: boolean
}


