import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-employee-gradehistory',
  templateUrl: './employee-gradehistory.component.html',
  styleUrls: ['./employee-gradehistory.component.scss']
})
export class EmployeeGradehistoryComponent implements OnInit {
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
  StandardFilter = '';
  loading = false;
  rowCount = 0;
  EmployeeGradeHistoryList: IEmployeeGradeHistory[] = [];
  Employees: IEmployee[] = [];
  //EmployeeSalaryComponentList: IEmployeeSalaryComponent[] = [];
  SelectedBatchId = 0;
  StoredForUpdate = [];
  //SubjectMarkComponents = [];
  GradeComponents = [];
  Grades = [];
  SalaryComponents = [];
  ComponentTypes = [];
  Batches = [];
  Departments = [];
  WorkAccounts = [];
  JobTitles = [];
  Designations = [];
  dataSource: MatTableDataSource<IEmployeeGradeHistory>;
  allMasterData = [];
  filteredOptions: Observable<IEmployee[]>;
  
  EmployeeGradeHistoryData = {
    "EmployeeGradeHistoryId": 0,
    "EmployeeId": 0,
    "DepartmentId": 0,
    "EmpGradeId": 0,
    "WorkAccountId": 0,
    "JobTitleId": 0,
    "DesignationId": 0,
    "CTC": 0,
    "FromDate": new Date(),
    "ToDate": new Date(),
    "Active": 0,
    "OrgId": 0
  };
  displayedColumns = [
    "DepartmentId",
    "EmpGradeId",
    "WorkAccountId",
    "JobTitleId",
    "DesignationId",
    "CTC",
    "FromDate",
    "ToDate",
    "Active",
    "Action"
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
      searchEmployeeName: [''],
    });
    this.PageLoad();
    this.filteredOptions = this.searchForm.get("searchEmployeeName").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Employees.slice())
      );
    this.GetEmployees();
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
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    //this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {

      this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
      this.GetMasterData();

    }
  }
  updateActive(row, value) {
    //if(!row.Action)
    row.Action = !row.Action;
    row.Active = row.Active == 1 ? 0 : 1;
  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {
          // this.GetApplicationRoles();
          this.alert.success("Data deleted successfully.", this.optionAutoClose);

        });
  }
  UpdateOrSave(row) {

    debugger;

    this.loading = true;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    let checkFilterString = "EmployeeId eq " + this.searchForm.get("searchEmployeeName").value.EmployeeId +
      " and JobTitleId eq " + row.JobTitleId +
      " and EmpGradeId eq " + row.EmpGradeId +
      " and DepartmentId eq " + row.DepartmentId +
      " and DesignationId eq " + row.DesignationId

    if (row.EmployeeGradeHistoryId > 0)
      checkFilterString += " and EmployeeGradeHistoryId ne " + row.EmployeeGradeHistoryId;
    checkFilterString += " and " + this.StandardFilter;

    let list: List = new List();
    list.fields = ["EmployeeGradeHistoryId"];
    list.PageName = "EmpEmployeeGradeSalHistories";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {

          this.EmployeeGradeHistoryData.EmployeeGradeHistoryId = row.EmployeeGradeHistoryId;
          this.EmployeeGradeHistoryData.EmployeeId = this.searchForm.get("searchEmployeeName").value.EmployeeId;
          this.EmployeeGradeHistoryData.Active = row.Active;
          this.EmployeeGradeHistoryData.DepartmentId = row.DepartmentId;
          this.EmployeeGradeHistoryData.DesignationId = row.DesignationId;
          this.EmployeeGradeHistoryData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.EmployeeGradeHistoryData.WorkAccountId = row.WorkAccountId;
          this.EmployeeGradeHistoryData.EmpGradeId = row.EmpGradeId;
          this.EmployeeGradeHistoryData.FromDate = row.FromDate;
          this.EmployeeGradeHistoryData.ToDate = row.ToDate;
          this.EmployeeGradeHistoryData.CTC = row.CTC.toString();
          this.EmployeeGradeHistoryData.JobTitleId = row.JobTitleId;
          if (this.EmployeeGradeHistoryData.EmployeeGradeHistoryId == 0) {
            this.EmployeeGradeHistoryData["CreatedDate"] = new Date();
            this.EmployeeGradeHistoryData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EmployeeGradeHistoryData["UpdatedDate"] = new Date();
            delete this.EmployeeGradeHistoryData["UpdatedBy"];
            console.log('exam EmployeeGradeHistoryData', this.EmployeeGradeHistoryData)
            this.insert(row);
          }
          else {
            delete this.EmployeeGradeHistoryData["CreatedDate"];
            delete this.EmployeeGradeHistoryData["CreatedBy"];
            this.EmployeeGradeHistoryData["UpdatedDate"] = new Date();
            this.EmployeeGradeHistoryData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    debugger;
    this.dataservice.postPatch('EmpEmployeeGradeSalHistories', this.EmployeeGradeHistoryData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EmployeeGradeHistoryId = data.EmployeeGradeHistoryId;
          this.loading = false;
          // this.rowCount++;
          // if (this.rowCount == this.displayedColumns.length - 2) {
          //   this.loading = false;
          //   this.alert.success("Data saved successfully", this.optionAutoClose);
          // }
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update(row) {
    console.log("to update", this.EmployeeGradeHistoryData)
    this.dataservice.postPatch('EmpEmployeeGradeSalHistories', this.EmployeeGradeHistoryData, this.EmployeeGradeHistoryData.EmployeeGradeHistoryId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          //this.rowCount++;
          //if (this.rowCount == this.displayedColumns.length - 2) {
          //  this.loading = false;
          //  this.alert.success("Data saved successfully", this.optionAutoClose);
          //}
          this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }

  // checkall(value) {
  //   this.EmployeeSalaryComponentList.forEach(record => {
  //     if (value.checked)
  //       record.Active = 1;
  //     else
  //       record.Active = 0;
  //     record.Action = !record.Action;
  //   })
  // }
  // saveall() {
  //   this.EmployeeSalaryComponentList.forEach(record => {
  //     if (record.Action == true) {
  //       this.UpdateOrSave(record);
  //     }
  //   })
  // }
  onBlur(element, event) {
    debugger;
    var _colName = event.srcElement.name;
    console.log("event", event);
    var row = this.StoredForUpdate.filter(s => s.SubjectMarkComponent == _colName && s.StudentClassSubjectId == element.StudentClassSubjectId);
    row[0][_colName] = element[_colName];
  }

  // UpdateAll() {
  //   this.EmployeeSalaryComponentList.forEach(element => {
  //     this.SaveRow(element);
  //   })
  // }
  SaveRow(element) {
    debugger;
    this.loading = true;
    this.rowCount = 0;
    //var columnexist;
    for (var prop in element) {

      var row: any = this.StoredForUpdate.filter(s => s.SubjectMarkComponent == prop && s.StudentClassSubjectId == element.StudentClassSubjectId);

      if (row.length > 0 && prop != 'StudentClassSubject' && prop != 'Action') {
        row[0].Active = 1;
        row[0].Marks = row[0][prop];
        this.UpdateOrSave(row[0]);
      }

    }

  }
  get f() { return this.searchForm.controls; }
  addnew() {
    this.EmployeeGradeHistoryList.push({
      "EmployeeGradeHistoryId": 0,
      "EmpEmployeeId": 0,
      "DepartmentId": 0,
      "EmpGradeId": 0,
      "WorkAccountId": 0,
      "JobTitleId": 0,
      "DesignationId": 0,
      "CTC": 0,
      "FromDate": new Date(),
      "ToDate": new Date(),
      "Active": 0,
      "Action": true
    });
    this.dataSource = new MatTableDataSource<IEmployeeGradeHistory>(this.EmployeeGradeHistoryList);
  }
  GetGradeComponents() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();

    list.fields = ["EmpGradeSalaryComponentId",
      "EmpGradeId",
      "SalaryComponentId",
      "FormulaOrAmount",
      "CommonComponent"];
    list.PageName = "EmpGradeComponents";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        this.GradeComponents = [...data.value];
      })
  }
  GetEmployees() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();

    list.fields = [
      "EmpEmployeeId",
      "FirstName",
      "LastName"];
    list.PageName = "EmpEmployees";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        this.Employees = data.value.map(m => {
          return {
            EmployeeId: m.EmpEmployeeId,
            Name: m.FirstName + " " + m.LastName
          }
        })
      })
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
        //this.Batches = this.getDropDownData(globalconstants.MasterDefinitions.school.BATCH);
        this.Departments = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.DEPARTMENT);
        this.Grades = this.getDropDownData(globalconstants.MasterDefinitions.employee.GRADE);
        this.SalaryComponents = this.getDropDownData(globalconstants.MasterDefinitions.employee.SALARYCOMPONENT);
        this.ComponentTypes = this.getDropDownData(globalconstants.MasterDefinitions.employee.COMPONENTTYPE);
        this.WorkAccounts = this.getDropDownData(globalconstants.MasterDefinitions.employee.WORKACCOUNT);
        this.JobTitles = this.getDropDownData(globalconstants.MasterDefinitions.employee.JOBTITLE);
        this.Designations = this.getDropDownData(globalconstants.MasterDefinitions.employee.DESIGNATION);
        this.loading = false;
      });
  }
  GetEmployeeGradeHistory() {
    this.loading = true;
    debugger;
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    var filterstr = 'EmployeeId eq ' + this.searchForm.get("searchEmployeeName").value.EmployeeId;
    let list: List = new List();

    list.fields = [
      "EmployeeGradeHistoryId",
      "DepartmentId",
      "EmpGradeId",
      "WorkAccountId",
      "JobTitleId",
      "DesignationId",
      "CTC",
      "FromDate",
      "ToDate",
      "Active",
    ];

    list.PageName = "EmpEmployeeGradeSalHistories";
    //list.lookupFields = ["EmpEmployeeSalaryComponents", "EmpGradeComponents"];
    list.filter = ["Active eq 1 and " + filterstr + orgIdSearchstr];
    list.orderBy = "EmployeeGradeHistoryId desc";
    //list.orderBy = "ParentId";
    this.EmployeeGradeHistoryList = [
      {
        "EmployeeGradeHistoryId": 0,
        "EmpEmployeeId": 0,
        "DepartmentId": 0,
        "EmpGradeId": 0,
        "WorkAccountId": 0,
        "JobTitleId": 0,
        "DesignationId": 0,
        "CTC": 0,
        "FromDate": new Date(),
        "ToDate": new Date(),
        "Active": 0,
        "Action": false
      }
    ];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0)
          this.EmployeeGradeHistoryList = data.value.map((h, indx) => {
            if (indx == 0)
              h.Action = true;
            else
              h.Action = false;
            return h;
          });

        this.loading = false;
        this.dataSource = new MatTableDataSource<IEmployeeGradeHistory>(this.EmployeeGradeHistoryList);
      })
  }
  GetSalaryComponents() {

    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    var filterstr = 'EmployeeId eq ' + this.searchForm.get("searchEmployeeId").value;
    let list: List = new List();

    list.fields = [
      "EmpEmployeeSalaryComponents/EmployeeSalaryComponentId",
      "EmpEmployeeSalaryComponents/EmpGradeComponentId",
      "EmpEmployeeSalaryComponents/Amount",
      "EmpEmployeeSalaryComponents/Active",
    ]
    list.PageName = "EmpEmployeeGradeSalHistory";
    list.lookupFields = ["EmpEmployeeSalaryComponents", "EmpGradeComponents"];

    list.filter = ["Active eq 1 and " + filterstr + orgIdSearchstr];
    //list.orderBy = "ParentId";
    //this.EmployeeSalaryComponentList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //this.EmployeeSalaryComponentList
      })

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
export interface IEmployeeGradeHistory {
  EmployeeGradeHistoryId: number;
  DepartmentId
  EmpGradeId: number;
  EmpEmployeeId: number;
  WorkAccountId: number;
  JobTitleId: number;
  DesignationId: number;
  CTC: number;
  FromDate: Date;
  ToDate: Date;
  Active: number;
  Action: boolean;
}
export interface IEmployeeSalaryComponent {
  EmployeeSalaryComponentId: number;
  EmployeeId: number;
  EmpGradeComponentId: number;
  Amount: number;
  Active: number;
  Action: boolean;
}
export interface IEmployee {
  EmployeeId: number;
  Name: string;
}