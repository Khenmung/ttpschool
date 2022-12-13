import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
//import { string } from 'mathjs';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { IEmployee } from '../../employeesalary/employee-gradehistory/employee-gradehistory.component';

@Component({
  selector: 'app-employee-leave',
  templateUrl: './employee-leave.component.html',
  styleUrls: ['./employee-leave.component.scss']
})
export class EmployeeLeaveComponent implements OnInit { PageLoading=true;
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
  EmployeeLeaveListName = 'LeaveEmployeeLeaves';
  StandardFilter = '';
  newitem =false;
  loading = false;
  rowCount = 0;
  EmployeeLeaveList: IEmployeeLeave[] = [];
  SelectedBatchId = 0;
  Grades = [];
  Leaves = [];
  LeaveStatus = [];
  Employees = [];
  dataSource: MatTableDataSource<IEmployeeLeave>;
  filteredOptions: Observable<IEmployee[]>;
  allMasterData = [];

  EmployeeLeaveData = {
    EmployeeLeaveId: 0,
    EmployeeId: 0,
    LeaveTypeId: 0,
    LeaveFrom: Date,
    LeaveTo: Date,
    NoOfDays: 0,
    LeaveReason: String,
    ApplyDate: Date,
    LeaveStatusId: 0,
    ApproveRejecteDate: Date,
    ApprovedBy: 0,
    Remarks: String,
    OrgId: 0,
    Active: 0,
  };
  displayedColumns = [
    "LeaveTypeId",
    "LeaveFrom",
    "LeaveTo",
    "NoOfDays",
    "LeaveReason",
    //"ApplyDate",
    "LeaveStatusId",
    //"ApproveRejecteDate",
    //"ApprovedBy",
    "Remarks",
    "Active",
    "Action"
  ];
  Permission=''
  searchForm: UntypedFormGroup;
  SelectedApplicationId=0;
  constructor(private servicework: SwUpdate,
    private contentservice:ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    
    //private route: ActivatedRoute,
    private nav: Router,
    //private shareddata: SharedataService,
    //private datepipe: DatePipe,
    private fb: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.servicework.activateUpdate().then(() => {
      this.servicework.checkForUpdate().then((value) => {
        if (value) {
          location.reload();
        }
      })
    })
    //debugger;
    this.searchForm = this.fb.group({
      searchEmployee: [0],
    });
    this.PageLoad();
    this.filteredOptions = this.searchForm.get("searchEmployee").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Employees.slice())
      );

  }
  private _filter(name: string): IEmployee[] {

    const filterValue = name.toLowerCase();
    return this.Employees.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  displayFn(user: IEmployee): string {
    return user && user.Name ? user.Name : '';
  }


  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      // var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.emp.employee.EMPLOYEE);
      // if (perObj.length > 0)
      //   this.Permission = perObj[0].permission;
      
        this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
      this.GetMasterData();

    }
    
  }

  updateActive(row, value) {
    //if(!row.Action)
    row.Action = true;
    row.Active = value.checked == 1 ? 1 : 0;
  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {
          // this.GetApplicationRoles();
          this.contentservice.openSnackBar(globalconstants.DeletedMessage,globalconstants.ActionText,globalconstants.BlueBackground);

        });
  }
  UpdateOrSave(row) {

    //debugger;

    this.loading = true;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    let checkFilterString = "EmployeeId eq " + this.searchForm.get("searchEmployee").value.EmployeeId +
      " and LeaveFrom eq " + row.LeaveFrom +
      " and LeaveTo eq " + row.LeaveTo +
      " and Active eq 1"

    if (row.EmployeeLeaveId > 0)
      checkFilterString += " and EmployeeLeaveId ne " + row.EmployeeLeaveId;
    checkFilterString += " and " + this.StandardFilter;

    let list: List = new List();
    list.fields = ["EmployeeLeaveId"];
    list.PageName = this.EmployeeLeaveListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading=false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.EmployeeLeaveData.EmployeeLeaveId = row.EmployeeLeaveId;
          this.EmployeeLeaveData.EmployeeId = this.searchForm.get("searchEmployee").value.EmployeeId;
          this.EmployeeLeaveData.Active = row.Active;
          this.EmployeeLeaveData.LeaveTypeId = row.LeaveTypeId;
          this.EmployeeLeaveData.LeaveFrom = row.LeaveFrom;
          this.EmployeeLeaveData.LeaveTo = row.LeaveTo;
          this.EmployeeLeaveData.LeaveReason = row.LeaveReason;
          this.EmployeeLeaveData.LeaveStatusId = row.LeaveStatusId;
          this.EmployeeLeaveData.ApprovedBy = this.LoginUserDetail[0]["userId"];
          this.EmployeeLeaveData.NoOfDays = row.NoOfDays;
          this.EmployeeLeaveData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.EmployeeLeaveData.Remarks = row.Remarks;
          //console.log('data', this.EmployeeLeaveData);

          if (this.EmployeeLeaveData.EmployeeLeaveId == 0) {
            this.EmployeeLeaveData["CreatedDate"] = new Date();
            this.EmployeeLeaveData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EmployeeLeaveData["UpdatedDate"] = new Date();
            delete this.EmployeeLeaveData["UpdatedBy"];
            ////console.log('exam slot', this.ExamStudentSubjectResultData)
            this.insert(row);
          }
          else {
            delete this.EmployeeLeaveData["CreatedDate"];
            delete this.EmployeeLeaveData["CreatedBy"];
            this.EmployeeLeaveData["UpdatedDate"] = new Date();
            this.EmployeeLeaveData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }
get f(){
  return this.searchForm.controls;
}
  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.EmployeeLeaveListName, this.EmployeeLeaveData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EmployeeLeaveId = data.EmployeeLeaveId;
          this.loading = false; this.PageLoading=false;
          this.newitem = false;
          // this.rowCount+=1;
          // if (this.rowCount == this.displayedColumns.length - 2) {
          //   this.loading = false; this.PageLoading=false;
          //   this.contentservice.openSnackBar(globalconstants.AddedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          // }
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {
    ////console.log("this.GradeComponentData", this.GradeComponentData);
    this.dataservice.postPatch(this.EmployeeLeaveListName, this.EmployeeLeaveData, this.EmployeeLeaveData.EmployeeLeaveId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading=false;
          // this.rowCount+=1;
          // if (this.rowCount == this.displayedColumns.length - 2) {
          //   this.loading = false; this.PageLoading=false;
          //   this.contentservice.openSnackBar(globalconstants.AddedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          // }
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
        });
  }

  // checkall(value) {
  //   this.GradeComponentList.forEach(record => {
  //     if (value.checked)
  //       record.Active = 1;
  //     else
  //       record.Active = 0;
  //     record.Action = !record.Action;
  //   })
  // }
  // saveall() {
  //   this.GradeComponentList.forEach(record => {
  //     if (record.Action == true) {
  //       this.UpdateOrSave(record);
  //     }
  //   })
  // }
  onBlur(element, event) {
    //debugger;
    var _colName = event.srcElement.name;
    //console.log("event", event);
    //var row = this.StoredForUpdate.filter(s => s.SubjectMarkComponent == _colName && s.StudentClassSubjectId == element.StudentClassSubjectId);
    //row[0][_colName] = element[_colName];
  }

  // UpdateAll() {
  //   this.GradeComponentList.forEach(element => {
  //     this.SaveRow(element);
  //   })
  // }
  SaveRow(element) {
    //debugger;
    this.loading = true;
    this.rowCount = 0;

  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"],this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        //this.Batches = this.getDropDownData(globalconstants.MasterDefinitions.school.BATCH);
        this.Grades = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEGRADE);
        this.Leaves = this.getDropDownData(globalconstants.MasterDefinitions.leave.LEAVE);
        this.LeaveStatus = this.getDropDownData(globalconstants.MasterDefinitions.leave.LEAVESTATUS);
        this.loading = false; this.PageLoading=false;
        this.GetEmployees();
      });
  }
  GetEmployees() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();

    list.fields = [
      "EmpEmployeeId",
      "EmployeeCode",
      "FirstName",
      "LastName"];
    list.PageName = "EmpEmployees";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        this.Employees = data.value.map(m => {
          return {
            EmployeeId: m.EmpEmployeeId,
            Name: m.EmployeeCode + "-" + m.FirstName + " " + m.LastName
          }
        })
        //console.log("employeeid",this.searchForm.get("searchEmployee").value.EmployeeId)
        //this.GetGradeComponents();
      })

  }
  GetEmployeeLeave() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();

    list.fields = [
      "EmployeeLeaveId",
      "EmployeeId",
      "LeaveTypeId",
      "LeaveFrom",
      "LeaveTo",
      "NoOfDays",
      "LeaveReason",
      "ApplyDate",
      "LeaveStatusId",
      "ApproveRejecteDate",
      "ApprovedBy",
      "Remarks",
      "Active"
    ];

    list.PageName = this.EmployeeLeaveListName;
    list.filter = ["EmployeeId eq " + this.searchForm.get("searchEmployee").value.EmployeeId + orgIdSearchstr];
    //list.orderBy = "ParentId";
    this.EmployeeLeaveList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0)
          this.EmployeeLeaveList = [...data.value];
        else {
          this.contentservice.openSnackBar("No record found!", globalconstants.ActionText,globalconstants.RedBackground);
        }

        // data.value.forEach(appliedLeave => {
        //   var _Leave = this.Leaves.filter(g => g.MasterDataId == appliedLeave.LeaveTypeId)[0].MasterDataName;
        //   appliedLeave.Leave = _Leave;
        //     this.EmployeeLeaveList.push(appliedLeave);         
        // })

        this.dataSource = new MatTableDataSource<IEmployeeLeave>(this.EmployeeLeaveList);
      })
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
  addnew() {

    this.displayedColumns = [
      "LeaveTypeId",
      "LeaveFrom",
      "LeaveTo",
      "LeaveReason",
      "Action"
    ]
    var newdata = {
      EmployeeLeaveId: 0,
      EmployeeId: this.searchForm.get("searchEmployee").value.EmployeeId,
      LeaveTypeId: 0,
      LeaveFrom: new Date,
      LeaveTo: new Date,
      NoOfDays: 0,
      LeaveReason: '',
      ApplyDate: new Date,
      LeaveStatusId: 0,
      ApproveRejecteDate: new Date,
      ApprovedBy: 0,
      Remarks: '',
      Action: true
    }
    this.EmployeeLeaveList.push(newdata)
    this.newitem = true;
  }

}
export interface IEmployeeLeave {
  EmployeeLeaveId: number;
  EmployeeId: number;
  LeaveTypeId: number;
  LeaveFrom: Date;
  LeaveTo: Date;
  NoOfDays: number;
  LeaveReason: string;
  ApplyDate: Date;
  LeaveStatusId: number;
  ApproveRejecteDate: Date;
  ApprovedBy: number;
  Remarks: string;
  Action: boolean;
}
