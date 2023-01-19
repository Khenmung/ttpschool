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
import { SwUpdate } from '@angular/service-worker';
import { SharedataService } from 'src/app/shared/sharedata.service';

@Component({
  selector: 'app-employeeattendance',
  templateUrl: './employeeattendance.component.html',
  styleUrls: ['./employeeattendance.component.scss']
})
export class EmployeeAttendanceComponent implements OnInit {
  PageLoading = true;

  //@Input() StudentClassId:number;
  @ViewChild("table") mattable;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  EnableSave = true;
  Permission = 'deny';
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  SaveAll = false;
  NoOfRecordToUpdate = -1;
  StudentDetailToDisplay = '';
  StudentClassId = 0;
  StandardFilter = '';
  loading = false;
  SelectedBatchId = 0;
  Batches = [];
  AttendanceStatus = [];
  FilteredClassSubjects = [];
  EmployeeAttendanceList: IEmployeeAttendance[] = [];
  dataSource: MatTableDataSource<IEmployeeAttendance>;
  allMasterData = [];
  searchForm = this.fb.group({
    searchAttendanceDate: [new Date()]
  });
  StudentClassSubjectId = 0;
  EmployeeAttendanceData = {
    EmployeeAttendanceId: 0,
    EmployeeId: 0,
    AttendanceStatus: 0,
    AttendanceDate: new Date(),
    ReportedTo: '',
    Approved: false,
    ApprovedBy: '',
    Remarks: '',
    BatchId: 0,
    OrgId: 0
  };
  displayedColumns = [
    'Employee',
    'AttendanceStatus',
    'Remarks',
    'Action'
  ];
  SelectedApplicationId = 0;
  Employees = [];
  constructor(private servicework: SwUpdate,

    private fb: UntypedFormBuilder,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,

  ) { }

  ngOnInit(): void {
    this.servicework.activateUpdate().then(() => {
      this.servicework.checkForUpdate().then((value) => {
        if (value) {
          location.reload();
        }
      })
    })
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    this.StudentClassId = 0;
    this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.ATTENDANCE.STUDENTATTENDANCE)
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
        this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
        this.GetMasterData();
        this.GetEmployees();

      }
    }

  }
  PageLoad() {

  }
  GetEmployees() {
    var filterStr = "OrgId eq " + this.LoginUserDetail[0]['orgId'] + " and Active eq 1";
    let list: List = new List();
    list.fields = [
      'EmpEmployeeId',
      'FirstName',
      'LastName',
      'ShortName'
    ];

    list.PageName = "EmpEmployees";
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((employee: any) => {
          this.Employees = [...employee.value];
      })
  }

  checkall(value) {
    debugger;
    this.EmployeeAttendanceList.forEach(record => {
      if (value.checked) {
        record.AttendanceStatus = 1;
      }
      else
        record.AttendanceStatus = 0;
      record.Action = true;
    })
    //this.AnyEnableSave=true;
  }

  GetEmployeeAttendance() {
    debugger;

    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"]

    var filterStrClsSub = '';

    this.loading = true;
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var _AttendanceDate = new Date(this.searchForm.get("searchAttendanceDate").value)
    _AttendanceDate.setHours(0, 0, 0, 0);
    if (_AttendanceDate.getTime() > today.getTime()) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Attendance date cannot be greater than today's date.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (this.LoginUserDetail[0]['RoleUsers'][0]['role'].toLowerCase() != 'admin' && _AttendanceDate.getTime() != today.getTime()) {
      this.EnableSave = false;
    }
    else
      this.EnableSave = true;

    filterStr += ' and BatchId eq ' + this.SelectedBatchId;


    if (filterStr.length == 0) {
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.EmployeeAttendanceList = [];
    this.dataSource = new MatTableDataSource<IEmployeeAttendance>(this.EmployeeAttendanceList);
    
    var datefilterStr = filterStr + ' and AttendanceDate ge ' + moment(this.searchForm.get("searchAttendanceDate").value).format('yyyy-MM-DD')
    datefilterStr += ' and AttendanceDate lt ' + moment(this.searchForm.get("searchAttendanceDate").value).add(1, 'day').format('yyyy-MM-DD')

    let list: List = new List();
    list.fields = [
      "EmployeeAttendanceId",
      "EmployeeId",
      "Approved",
      "ReportedTo",
      "ApprovedBy",
      "AttendanceDate",
      "AttendanceStatus",
      "Remarks",
      "OrgId",
      "BatchId"
    ];
    list.PageName = "EmployeeAttendances";
    //list.lookupFields = ["StudentClass"];
    list.filter = [datefilterStr + filterStrClsSub]; //+ //"'" + //"T00:00:00.000Z'" +

    this.dataservice.get(list)
      .subscribe((employeeAttendance: any) => {

        this.Employees.forEach(emp => {
          var empName = emp.FirstName + (emp.LastName ? " " + emp.LastName : "");
          let existing = employeeAttendance.value.filter(db => db.EmployeeId == emp.EmpEmployeeId);
          if (existing.length > 0) {
            this.EmployeeAttendanceList.push({
              Employee:empName,
              EmployeeAttendanceId: existing[0].EmployeeAttendanceId,
              EmployeeId: existing[0].EmployeeId,
              Approved: existing[0].Approved,
              ApprovedBy: existing[0].ApprovedBy,
              ReportedTo: existing[0].ReportedTo,
              AttendanceStatus: existing[0].AttendanceStatus,
              AttendanceDate: existing[0].AttendanceDate,
              Remarks: existing[0].Remarks,
              Action: false
            });
          }
          else
            this.EmployeeAttendanceList.push({
              EmployeeAttendanceId: 0,
              EmployeeId: 0,
              Employee:empName,
              Approved: false,
              ApprovedBy: '',
              ReportedTo: '',
              AttendanceStatus: 0,
              AttendanceDate: new Date(),
              Remarks: '',
              Action: false
            });
        })
        //this.EmployeeAttendanceList = this.EmployeeAttendanceList.sort((a, b) => a.RollNo - b.RollNo)
        this.dataSource = new MatTableDataSource<IEmployeeAttendance>(this.EmployeeAttendanceList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false; this.PageLoading = false;
      });
    //this.changeDetectorRefs.detectChanges();
    //});
  }
  clear() {
    this.searchForm.patchValue({
      searchClassId: 0,
      searchSection: ''
    });
  }
  UpdateActive(element, event) {
    element.Action = true;
    //this.AnyEnableSave=true;
    element.AttendanceStatus = event.checked == true ? 1 : 0;
  }
  onChangeEvent(row, value) {
    //debugger;
    if (row.Remarks.length > 0)
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
          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  saveall() {
    debugger;
    //var toUpdateAttendance = this.EmployeeAttendanceList.filter(f => f.Action);
    //console.log("toUpdateAttendance",toUpdateAttendance);
    this.NoOfRecordToUpdate = this.EmployeeAttendanceList.length;
    this.loading = true;
    this.EmployeeAttendanceList.forEach((record) => {
      this.NoOfRecordToUpdate--;
      this.UpdateOrSave(record);
    })
    if (this.EmployeeAttendanceList.length == 0) {
      this.loading = false;
    }
  }
  SaveRow(row) {
    this.NoOfRecordToUpdate = 0;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row) {

    //this.NoOfRecordToUpdate = 0;
    var _AttendanceDate = this.searchForm.get("searchAttendanceDate").value;

    let checkFilterString = "EmployeeId eq " + row.EmployeeId +
      " and AttendanceDate ge " + moment(_AttendanceDate).format('YYYY-MM-DD') +
      " and AttendanceDate lt " + moment(_AttendanceDate).add(1, 'day').format('YYYY-MM-DD')

    if (row.EmployeeAttendanceId > 0)
      checkFilterString += " and EmployeeAttendanceId ne " + row.EmployeeAttendanceId;

    let list: List = new List();
    list.fields = ["EmployeeAttendanceId"];
    list.PageName = "EmployeeAttendances";
    list.filter = [checkFilterString + " and " + this.StandardFilter];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.EmployeeAttendanceData.AttendanceDate = new Date(_AttendanceDate);
          this.EmployeeAttendanceData.EmployeeAttendanceId = row.EmployeeAttendanceId;
          this.EmployeeAttendanceData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.EmployeeAttendanceData.BatchId = this.SelectedBatchId;
          this.EmployeeAttendanceData.AttendanceStatus = row.AttendanceStatus;
          this.EmployeeAttendanceData.EmployeeId = row.EmployeeId;
          this.EmployeeAttendanceData.Approved = false;
          this.EmployeeAttendanceData.ApprovedBy = '';
          this.EmployeeAttendanceData.Remarks = row.Remarks;
          if (this.EmployeeAttendanceData.EmployeeAttendanceId == 0) {
            this.EmployeeAttendanceData["CreatedDate"] = new Date();
            this.EmployeeAttendanceData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.EmployeeAttendanceData["UpdatedDate"];
            delete this.EmployeeAttendanceData["UpdatedBy"];
            //console.log("EmployeeAttendanceData",this.EmployeeAttendanceData);
            this.insert(row);
          }
          else {
            delete this.EmployeeAttendanceData["CreatedDate"];
            delete this.EmployeeAttendanceData["CreatedBy"];
            this.EmployeeAttendanceData["UpdatedDate"] = new Date();
            this.EmployeeAttendanceData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
          row.Action = false;
        }
      });
  }

  insert(row) {

    this.dataservice.postPatch('EmployeeAttendances', this.EmployeeAttendanceData, 0, 'post')
      .subscribe(
        (data: any) => {
          //this.edited = false;
          row.AttendanceId = data.AttendanceId;
          row.Action = false;
          if (this.NoOfRecordToUpdate == 0) {
            this.NoOfRecordToUpdate = -1;
            this.loading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
  }
  update(row) {
    this.dataservice.postPatch('EmployeeAttendances', this.EmployeeAttendanceData, this.EmployeeAttendanceData.EmployeeAttendanceId, 'patch')
      .subscribe(
        (data: any) => {
          //this.edited = false;
          row.Action = false;
          if (this.NoOfRecordToUpdate == 0) {
            this.NoOfRecordToUpdate = -1;
            this.loading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
  }
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
  // GetClassSubject() {
  //   debugger;
  //   let list: List = new List();
  //   list.fields = [
  //     'ClassSubjectId',
  //     'SubjectId',
  //     'ClassId',
  //   ];

  //   list.PageName = "ClassSubjects";
  //   //list.filter = ["Active eq 1 and BatchId eq " + this.SelectedBatchId + " and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
  //   list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
  //   this.ClassSubjects = [];
  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       //debugger;
  //       //  //console.log('data.value', data.value);
  //       this.ClassSubjects = data.value.map(item => {
  //         // var _classname = ''
  //         // var objCls = this.Classes.filter(f => f.ClassId == item.ClassId)
  //         // if (objCls.length > 0)
  //         //   _classname = objCls[0].ClassName;

  //         var _subjectName = '';
  //         var objsubject = this.Subjects.filter(f => f.MasterDataId == item.SubjectId)
  //         if (objsubject.length > 0)
  //           _subjectName = objsubject[0].MasterDataName;

  //         return {
  //           ClassSubjectId: item.ClassSubjectId,
  //           ClassSubject: _subjectName,
  //           ClassId: item.ClassId
  //         }
  //       })
  //     })
  // }
  GetMasterData() {

    this.allMasterData = this.tokenstorage.getMasterData();
    this.AttendanceStatus = this.getDropDownData(globalconstants.MasterDefinitions.school.ATTENDANCESTATUS);
    this.loading = false; this.PageLoading = false;
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
export interface IEmployeeAttendance {
  EmployeeAttendanceId: number;
  EmployeeId: number;
  Employee:string;
  AttendanceStatus: number;
  AttendanceDate: Date;
  Remarks: string;
  ReportedTo: string;
  Approved: boolean;
  ApprovedBy: string;
  Action: boolean
}


