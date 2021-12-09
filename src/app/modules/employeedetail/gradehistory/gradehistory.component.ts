import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-gradehistory',
  templateUrl: './gradehistory.component.html',
  styleUrls: ['./gradehistory.component.scss']
})
export class GradehistoryComponent implements OnInit {

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
  EmploymentHistoryListName = 'EmpEmployeeGradeSalHistories';
  Employees=[];
  Grades = [];
  Designations = [];
  Departments = [];
  WorkAccounts = [];
  JobTitles = [];
  loading = false;
  SelectedBatchId = 0;
  EmploymentHistoryList: IEmployeementHistory[] = [];
  filteredOptions: Observable<IEmployeementHistory[]>;
  //filteredEmployees: Observable<IEmployee[]>;
  dataSource: MatTableDataSource<IEmployeementHistory>;
  allMasterData = [];
  EmploymentHistory = [];
  Permission = 'deny';
  EmployeeId = 0;
  EmploymentHistoryData = {
    EmployeeGradeHistoryId: 0,
    EmpGradeId: 0,
    EmployeeId: 0,
    DepartmentId: 0,
    CTC: 0,
    FromDate: new Date(),
    ToDate: new Date(),
    ManagerId: 0,
    ReportingTo: 0,
    JobTitleId: 0,
    DesignationId: 0,
    WorkAccountId: 0,
    IsCurrent: 0,
    OrgId: 0,
    Remarks: '',
    ApprovedBy: 0,
    Active: 0
  };
  displayedColumns = [
    "EmployeeGradeHistoryId",
    "EmpGradeId",
    "DesignationId",
    "JobTitleId",            
    "DepartmentId",
    "WorkAccountId",
    "ManagerName",
    "ReportingTo",            
    //"CTC",
    "FromDate",
    "ToDate",
    "Remarks",
    "Active",
    "Action"
  ];
  searchForm: FormGroup;
  constructor(
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private nav: Router,
    private datepipe: DatePipe,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchClassName: [0]
    });
    // this.filteredEmployees = this.EmployeeSearchForm.get("searchemployeeName").valueChanges
    //   .pipe(
    //     startWith(''),
    //     map(value => typeof value === 'string' ? value : value.Name),
    //     map(Name => Name ? this._filter(Name) : this.Employees.slice())
    //   );
    this.PageLoad();
  }
  filterEmployee(name: string){

    const filterValue = name.toLowerCase();
    return name && this.Employees.filter(option => option.Name.toLowerCase().includes(filterValue)) || this.Employees;

  }
  PageLoad() {

    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    this.EmployeeId = +this.tokenstorage.getEmployeeId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.emp.employee.EMPLOYMENTHISTORY)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {

        //this.nav.navigate(['/edu'])
      }
      else {
        this.GetEmployees();
        this.GetMasterData();
        
      }
    }
  }

  AddNew() {

    var newdata = {
      EmployeeGradeHistoryId: 0,
      EmpGradeId: 0,
      DepartmentId: 0,
      CTC: 0,
      FromDate: new Date(),
      ToDate: new Date(),
      ManagerId: 0,
      ReportingTo: 0,
      JobTitleId: 0,
      DesignationId: 0,
      WorkAccountId: 0,
      Remarks: '',
      Active: 0,
      Action: false
    };
    this.EmploymentHistoryList = [];
    this.EmploymentHistoryList.push(newdata);
    this.dataSource = new MatTableDataSource<IEmployeementHistory>(this.EmploymentHistoryList);
  }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = value.checked ? 1 : 0;
  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {

          this.alert.success("Data deleted successfully.", this.optionAutoClose);

        });
  }
  UpdateOrSave(row) {

    //debugger;
    this.loading = true;
    let checkFilterString = "EmpGradeId eq " + row.EmpGradeId + 
                            " and DesignationId eq " + row.DesignationId +
                            " and EmployeeId eq " + this.EmployeeId

    if (row.EmployeeGradeHistoryId > 0)
      checkFilterString += " and EmployeeGradeHistoryId ne " + row.EmployeeGradeHistoryId;
    let list: List = new List();
    list.fields = ["EmployeeGradeHistoryId"];
    list.PageName = this.EmploymentHistoryListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {

          this.EmploymentHistoryData.EmployeeGradeHistoryId = row.EmployeeGradeHistoryId;
          this.EmploymentHistoryData.Active = row.Active;
          this.EmploymentHistoryData.EmpGradeId = row.EmpGradeId;
          this.EmploymentHistoryData.EmployeeId = this.EmployeeId;
          this.EmploymentHistoryData.DesignationId = row.DesignationId;
          this.EmploymentHistoryData.DepartmentId = row.DepartmentId;
          this.EmploymentHistoryData.JobTitleId = row.JobTitleId;
          this.EmploymentHistoryData.ManagerId = +row.ManagerId;
          this.EmploymentHistoryData.ReportingTo = +row.ReportingTo;
          this.EmploymentHistoryData.WorkAccountId = +row.WorkAccountId;
          this.EmploymentHistoryData.CTC = row.CTC;          
          this.EmploymentHistoryData.FromDate = row.FromDate;
          this.EmploymentHistoryData.ToDate = row.ToDate;
          this.EmploymentHistoryData.OrgId = this.LoginUserDetail[0]["orgId"];

          if (this.EmploymentHistoryData.EmployeeGradeHistoryId == 0) {
            this.EmploymentHistoryData["CreatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            this.EmploymentHistoryData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EmploymentHistoryData["UpdatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            delete this.EmploymentHistoryData["UpdatedBy"];
            //console.log('this.EmploymentHistoryData', this.EmploymentHistoryData)
            this.insert(row);
          }
          else {
            delete this.EmploymentHistoryData["CreatedDate"];
            delete this.EmploymentHistoryData["CreatedBy"];
            this.EmploymentHistoryData["UpdatedDate"] = new Date();
            this.EmploymentHistoryData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false;
  }
  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.EmploymentHistoryListName, this.EmploymentHistoryData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EmployeeGradeHistoryId = data.EmployeeGradeHistoryId;
          row.Action = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.EmploymentHistoryListName, this.EmploymentHistoryData, this.EmploymentHistoryData.EmployeeGradeHistoryId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
          this.loadingFalse();
        });
  }
  GetEmploymentHistory() {
    debugger;

    this.loading = true;
    let filterStr = 'EmployeeId eq ' + this.EmployeeId

    let list: List = new List();
    list.fields = ["*"];

    list.PageName = this.EmploymentHistoryListName;
    list.filter = [filterStr];
    this.EmploymentHistoryList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        this.EmploymentHistoryList = data.value.map(f=>{
           
          var _ManagerNameObj=this.Employees.filter(e=>e.EmployeeId==f.ManagerId);
          var _ManagerName='';
          if(_ManagerNameObj.length>0)
          {
            _ManagerName =_ManagerNameObj[0].Name;
          }
          f.ManagerName =_ManagerName; 
          return f;
        })
        //console.log("EmploymentHistoryList",this.EmploymentHistoryList)
        this.dataSource = new MatTableDataSource<IEmployeementHistory>(this.EmploymentHistoryList);
        this.loadingFalse();
      });

  }

  GetMasterData() {

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId", "Description"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 and (ParentId eq 0 or OrgId eq " + this.LoginUserDetail[0]["orgId"] + ")"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Grades =this.getDropDownData(globalconstants.MasterDefinitions.employee.GRADE);
        this.Designations = this.getDropDownData(globalconstants.MasterDefinitions.employee.DESIGNATION);
        this.Departments = this.getDropDownData(globalconstants.MasterDefinitions.employee.DEPARTMENT);
        this.WorkAccounts = this.getDropDownData(globalconstants.MasterDefinitions.employee.WORKACCOUNT);
        this.JobTitles = this.getDropDownData(globalconstants.MasterDefinitions.employee.JOBTITLE);
        this.GetEmploymentHistory();
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
  GetEmployees() {
    this.loading = true;
    let list: List = new List();
    list.fields = ["EmpEmployeeId","EmployeeCode","FirstName","LastName","ContactNo"];
    list.PageName = "EmpEmployees";
    list.filter = ['Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.Employees = data.value.map(Employee => {
            
            var _name = Employee.FirstName + " " + Employee.LastName;
            var _fullDescription = _name + "-" + Employee.ContactNo;
            return {
              EmployeeId:Employee.EmpEmployeeId,
              EmployeeCode: Employee.EmployeeCode,
              Name: _fullDescription              
            }
          })
        }
        this.loading = false;
      })
  }
}
export interface IEmployeementHistory {
  EmployeeGradeHistoryId: number;
  EmpGradeId: number;
  DepartmentId: number;
  CTC: number;
  FromDate: Date;
  ToDate: Date;
  ManagerId: number;
  ReportingTo: number;
  JobTitleId: number;
  DesignationId: number;
  WorkAccountId: number;
  Remarks: string;
  Active: number;
  Action: boolean;
}


