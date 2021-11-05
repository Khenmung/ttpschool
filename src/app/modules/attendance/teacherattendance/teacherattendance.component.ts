import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-teacherattendance',
  templateUrl: './teacherattendance.component.html',
  styleUrls: ['./teacherattendance.component.scss']
})
export class TeacherAttendanceComponent implements OnInit {

  //@Input() StudentClassId:number;
  @ViewChild("table") mattable;
  //@ViewChild(ClasssubjectComponent) classSubjectAdd: ClasssubjectComponent;
  edited = false;
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
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
    AttendanceDate: Date,
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
    private fb: FormBuilder,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
    private datepipe: DatePipe
  ) { }

  ngOnInit(): void {
    //debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();

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
    //debugger;

    var _attendanceDate = this.searchForm.get("searchAttendanceDate").value;
    if (_attendanceDate == null) {
      this.alert.error("Please select attendance date.", this.optionAutoClose);
      return;
    }
 
    var attendancedate = new Date(this.searchForm.get("searchAttendanceDate").value);
    attendancedate.setHours(0, 0, 0, 0);
    var today = new Date(attendancedate);
    today.setHours(0, 0, 0, 0);
    if (attendancedate.getTime() > today.getTime()) {
      this.alert.error("Attendance date cannot be greater than today's date", this.optionAutoClose);
      return;
    }
    else if (_attendanceDate.getTime() != today.getTime()) {
      this.EnableSave = false;
    }

    var orgIdSearchstr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    var _WorkAccount = this.WorkAccounts.filter(f => f.MasterDataName.toLowerCase() == "teaching");
    var _workAccountId = 0;
    if (_WorkAccount.length > 0)
      _workAccountId = _WorkAccount[0].MasterDataId;

    let list: List = new List();

    list.fields = ["WorkAccountId"];
    list.PageName = "EmpEmployeeGradeSalHistories";
    list.lookupFields = ["Employee($select=EmpEmployeeId,FirstName,LastName,ShortName)"]
    list.filter = [orgIdSearchstr + " and Active eq 1 and (ManagerId eq " + this.LoginUserDetail[0]["employeeId"] + " or ReportingTo eq " + this.LoginUserDetail[0]["employeeId"] + ")"];
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
        //list.lookupFields = ["EmpEmployee"];
        list.filter = ["OrgId eq " + this.LoginUserDetail[0]["orgId"] +
          " and AttendanceDate eq " + this.datepipe.transform(attendancedate, 'yyyy-MM-dd')];

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
            this.dataSource = new MatTableDataSource<ITeacherAttendance>(this.TeacherAttendanceList);
            this.loading = false;
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
    toUpdateAttendance.forEach((record, indx) => {
      this.UpdateOrSave(record, indx);
    })
  }
  UpdateOrSave(row, indx) {
    let checkFilterString = "AttendanceId eq " + row.AttendanceId +
      " and TeacherId eq " + row.TeacherId +
      " and AttendanceDate eq " + this.datepipe.transform(row.AttendanceDate, 'yyyy-MM-dd') +
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
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
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
              this.NoOfRecordToUpdate = 0;
              this.alert.success("Data saved successfully.", this.optionAutoClose);
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
              this.alert.success("Data saved successfully.", this.optionAutoClose);
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

    var orgIdSearchstr = 'and (ParentId eq 0  or OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ')';

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.WorkAccounts = this.getDropDownData(globalconstants.MasterDefinitions.employee.WORKACCOUNT);
        this.AttendanceStatus = this.getDropDownData(globalconstants.MasterDefinitions.school.ATTENDANCESTATUS);
        this.loading = false;
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
export interface ITeacherAttendance {
  AttendanceId: number;
  TeacherId: number;
  AttendanceStatus: number;
  AttendanceDate: Date;
  TeacherName: string;
  Remarks: string;
  Action: boolean
}


