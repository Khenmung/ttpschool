//import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { evaluate } from 'mathjs';
import { observable, Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { IEmployee } from '../../employeesalary/employee-gradehistory/employee-gradehistory.component';

@Component({
  selector: 'app-leavebalance',
  templateUrl: './leavebalance.component.html',
  styleUrls: ['./leavebalance.component.scss']
})
export class LeaveBalanceComponent implements OnInit {
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
  PagePermission = '';
  LeaveBalanceListName = 'LeaveBalances';
  StandardFilter = '';
  loading = false;
  rowCount = 0;
  LeavePolicies = [];
  RawLeaveBalance = [];
  LeaveBalanceList: any[] = [];
  SelectedBatchId = 0;
  StoredForUpdate = [];
  //SubjectMarkComponents = [];
  //MarkComponents = [];
  //Emps = [];
  Leaves = [];
  Grades = [];
  Departments = [];
  WorkAccounts = [];
  Designations = [];
  JobTitles = [];
  Genders = [];
  City = [];
  Countries = [];
  States = [];
  BloodGroups = [];
  Religions = [];
  Categories = [];
  Locations = [];
  EmploymentStatus = [];
  EmploymentTypes = [];
  Natures = [];
  MaritalStatus = [];
  ComponentTypes = [];
  VariableTypes = [];
  OpenAdjustCloseLeaves = [];
  DropDownMonths = [];
  Employees = [];
  filteredOptions: Observable<IEmployee[]>;
  dataSource: MatTableDataSource<ILeaveBalance>;
  allMasterData = [];
  SelectedApplicationId=0;
  LeaveBalanceData = {
    LeaveBalanceId: 0,
    EmployeeId: 0,
    LeaveNameId: 0,
    LeaveOpenAdjustCloseId: 0,
    YearMonth: 0,
    BatchId: 0,
    OrgId: 0,
    Active: 0
  };
  displayedColumns = [
    "Employee",
    "Leave",
    "Active",
    "Action"
  ];
  searchForm: FormGroup;
  constructor(
    private shareddata: SharedataService,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    
    private nav: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchEmployee: [0]
    });
    this.PageLoad();
    this.filteredOptions = this.searchForm.get("searchEmployee").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Employees.slice())
      );

    this.DropDownMonths = this.GetSessionFormattedMonths();

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
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
      this.GetMasterData();

    }
  }
  updateCommonComponent(row, value) {
    //debugger;
    row.Action = true;
    row.CommonComponent = value.checked == 1 ? 1 : 0;

  }
  updateDeduction(row, value) {
    //debugger;
    row.Action = true;
    row.Deduction = value.checked == 1 ? 1 : 0;
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
  GetSessionFormattedMonths() {
    var _sessionStartEnd = {
      StartDate: new Date(),
      EndDate: new Date()
    };
    var Months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ]
    var monthArray = [];
    //setTimeout(() => {

      this.shareddata.CurrentSelectedBatchStartEnd$.subscribe((b: any) => {
        
        if (b.length !=0) {
          _sessionStartEnd = {...b};
          //console.log('b',b)
          var _Year = new Date(_sessionStartEnd.StartDate).getFullYear();
          var startMonth = new Date(_sessionStartEnd.StartDate).getMonth();

          for (var month = 0; month < 12; month++, startMonth++) {
            monthArray.push({
              MonthName: Months[startMonth]+ " " + _Year,
              val: _Year + startMonth.toString().padStart(2, "0")
            })
            if(startMonth == 11)
            {
              startMonth =  -1;
              _Year++; 
            }
          }
        }
      });
      ////console.log('monthArray',monthArray);
    //}, 3000);
    return monthArray;
  }
  UpdateOrSave(row) {

    //debugger;

    this.loading = true;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    let checkFilterString = "LeaveNameId eq " + row.LeaveNameId +
      " and EmployeeId eq " + this.searchForm.get("searchEmployee").value

    if (row.LeaveBalanceId > 0)
      checkFilterString += " and LeaveBalanceId ne " + row.LeaveBalanceId;
    checkFilterString += " and " + this.StandardFilter;

    let list: List = new List();
    list.fields = ["LeaveBalanceId"];
    list.PageName = this.LeaveBalanceListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.LeaveBalanceData.LeaveBalanceId = row.LeaveBalanceId;
          this.LeaveBalanceData.EmployeeId = row.EmployeeId;
          this.LeaveBalanceData.LeaveOpenAdjustCloseId = row.LeaveOpenAdjustCloseId;
          this.LeaveBalanceData.YearMonth = row.YearMonth;
          this.LeaveBalanceData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.LeaveBalanceData.BatchId = this.SelectedBatchId;
          this.LeaveBalanceData.Active = row.Active;

          //console.log('data', this.LeaveBalanceData);
          if (this.LeaveBalanceData.LeaveBalanceId == 0) {
            this.LeaveBalanceData["CreatedDate"] = new Date();
            this.LeaveBalanceData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.LeaveBalanceData["UpdatedDate"] = new Date();
            delete this.LeaveBalanceData["UpdatedBy"];
            ////console.log('exam slot', this.ExamStudentSubjectResultData)
            this.insert(row);
          }
          else {
            delete this.LeaveBalanceData["CreatedDate"];
            delete this.LeaveBalanceData["CreatedBy"];
            this.LeaveBalanceData["UpdatedDate"] = new Date();
            this.LeaveBalanceData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.LeaveBalanceListName, this.LeaveBalanceData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.LeaveBalanceId = data.LeaveBalanceId;
          this.loading = false;
          // this.rowCount++;
          // if (this.rowCount == this.displayedColumns.length - 2) {
          //   this.loading = false;
          //   this.contentservice.openSnackBar(globalconstants.AddedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          // }
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {
    ////console.log("this.EmpComponentData", this.EmpComponentData);
    this.dataservice.postPatch(this.LeaveBalanceListName, this.LeaveBalanceData, this.LeaveBalanceData.LeaveBalanceId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          // this.rowCount++;
          // if (this.rowCount == this.displayedColumns.length - 2) {
          //   this.loading = false;
          //   this.contentservice.openSnackBar(globalconstants.AddedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          // }
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
        });
  }

  // checkall(value) {
  //   this.EmpComponentList.forEach(record => {
  //     if (value.checked)
  //       record.Active = 1;
  //     else
  //       record.Active = 0;
  //     record.Action = !record.Action;
  //   })
  // }
  // saveall() {
  //   this.EmpComponentList.forEach(record => {
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
  //   this.EmpComponentList.forEach(element => {
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
        //debugger;
        this.allMasterData = [...data.value];
        this.OpenAdjustCloseLeaves = this.getDropDownData(globalconstants.MasterDefinitions.leave.OPENADJUSTCLOSE);
        this.OpenAdjustCloseLeaves.sort((a, b) => a.Sequence - b.Sequence);
        this.Leaves = this.getDropDownData(globalconstants.MasterDefinitions.leave.LEAVE);
        this.Leaves.sort((a, b) => a.Sequence - b.Sequence);

        this.Grades = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEGRADE);
        this.Departments = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.DEPARTMENT);
        this.WorkAccounts = this.getDropDownData(globalconstants.MasterDefinitions.employee.WORKACCOUNT);
        this.Designations = this.getDropDownData(globalconstants.MasterDefinitions.employee.DESIGNATION);
        this.JobTitles = this.getDropDownData(globalconstants.MasterDefinitions.employee.JOBTITLE);
        this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEGENDER);
        this.City = this.getDropDownData(globalconstants.MasterDefinitions.common.CITY);
        this.Countries = this.getDropDownData(globalconstants.MasterDefinitions.common.COUNTRY);
        this.States = this.getDropDownData(globalconstants.MasterDefinitions.common.STATE);
        this.BloodGroups = this.getDropDownData(globalconstants.MasterDefinitions.common.BLOODGROUP);
        this.Religions = this.getDropDownData(globalconstants.MasterDefinitions.common.RELIGION);
        this.Categories = this.getDropDownData(globalconstants.MasterDefinitions.common.CATEGORY);
        this.Locations = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.LOCATION);
        this.EmploymentStatus = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYMENTSTATUS);
        this.EmploymentTypes = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYMENTTYPE);;
        this.Natures = this.getDropDownData(globalconstants.MasterDefinitions.employee.NATURE);
        this.MaritalStatus = this.getDropDownData(globalconstants.MasterDefinitions.employee.MARITALSTATUS);
        this.ComponentTypes = this.getDropDownData(globalconstants.MasterDefinitions.employee.COMPONENTTYPE);
        this.VariableTypes = this.getDropDownData(globalconstants.MasterDefinitions.common.CONFIGTYPE);

        this.GetEmployees();
        this.GetLeavePolicy();
      });
  }
  GetLeavePolicy() {

    var orgIdAndBatchSearchstr = 'BatchId eq ' + this.SelectedBatchId + ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    this.loading = true;
    let list: List = new List();

    list.fields = [
      "LeavePolicyId",
      "LeaveNameId",
      "LeaveOpenAdjustCloseId",
      "FormulaOrDays"];
    list.PageName = "LeavePolicies";
    list.filter = ["Active eq 1 and " + orgIdAndBatchSearchstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.LeavePolicies = [...data.value];
        this.loading = false;
      })

  }
  GetCurrentEmployeeVariableData(empId, OrgId) {

    var VariableConfigs = [];
    var orgIdSearchstr = ' and OrgId eq ' + OrgId;
    var searchfilter = '';
    if (empId > 0)
      searchfilter = " and EmployeeId eq " + empId

    let list: List = new List();

    list.fields = ["*"];
    list.PageName = "EmpEmployeeGradeSalHistories";
    list.lookupFields = ["Employee($SELECT=*)"];
    list.filter = ["IsCurrent eq 1 and Active eq 1" + searchfilter + orgIdSearchstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        //debugger;
        var existingdata;
        this.displayedColumns = ["Employee"];
        var forDisplay = [];
        var employeeVariable = {};
        var employees = [...data.value];
        employees.forEach(item => {
          employeeVariable =
          {
            "Grade": this.getMasterText(this.Grades, item.EmpGradeId),
            "Department": this.getMasterText(this.Departments, item.DepartmentId),
            "CTC": item.CTC,
            "GradeFromDate": item.FromDate,
            "GradeToDate": item.ToDate,
            "ApprovedBy": item.ApprovedBy,
            "WorkAccount": this.getMasterText(this.WorkAccounts, item.WorkAccountId),
            "JobTitle": this.getMasterText(this.JobTitles, item.JobTitleId),
            "Designation": this.getMasterText(this.Designations, item.DesignationId),
            "EmployeeId": item.EmpEmployeeId,
            "FirstName": item.Employee.FirstName,
            "LastName": item.Employee.LastName,
            "FatherName": item.Employee.FatherName,
            "MotherName": item.Employee.MotherName,
            "Gender": this.getMasterText(this.Genders, item.Employee.Gender),
            "Address": item.Employee.Address,
            "DOB": item.Employee.DOB,
            "DOJ": item.Employee.DOJ,
            "City": this.getMasterText(this.City, item.Employee.CityId),
            "Pincode": item.Employee.pincode,
            "State": this.getMasterText(this.States, item.Employee.StateId),
            "Country": this.getMasterText(this.Countries, item.Employee.CountryId),
            "Bloodgroup": this.getMasterText(this.BloodGroups, item.Employee.Bloodgroup),
            "Category": this.getMasterText(this.Categories, item.Employee.CategoryId),
            "BankAccountNo": item.Employee.BankAccountNo,
            "IFSCcode": item.Employee.IFSCcode,
            "MICRNo": item.Employee.MICRNo,
            "AdhaarNo": item.Employee.AdhaarNo,
            "Religion": this.getMasterText(this.Religions, item.Employee.ReligionId),
            "ContactNo": item.Employee.ContactNo,
            "AlternateContactNo": item.Employee.AlternateContactNo,
            "EmailAddress": item.Employee.EmailAddress,
            "Location": this.getMasterText(this.Locations, item.Employee.LocationId),
            "EmploymentStatus": this.getMasterText(this.EmploymentStatus, item.Employee.EmploymentStatusId),
            "EmploymentType": this.getMasterText(this.EmploymentTypes, item.Employee.EmploymentTypeId),
            "EmploymentTerm": this.getMasterText(this.Natures, item.Employee.EmploymentTermId),
            "ConfirmationDate": item.Employee.ConfirmationDate,
            "NoticePeriodDays": item.Employee.NoticePeriodDays,
            "ProbationPeriodDays": item.Employee.ProbationPeriodDays,
            "PAN": item.Employee.PAN,
            "PassportNo": item.Employee.PassportNo,
            "MaritalStatus": this.getMasterText(this.MaritalStatus, item.Employee.MaritalStatusId),
            "MarriedDate": item.Employee.MarriedDate,
            "PFAccountNo": item.Employee.PFAccountNo,
            "Active": item.Employee.Active,
            "EmployeeCode": item.Employee.EmployeeCode
          }
          forDisplay["Employee"] = employeeVariable["FirstName"] + " " + employeeVariable["LastName"];
          //return VariableConfigs;
          this.OpenAdjustCloseLeaves.forEach(o => {
            //var filteredleave =this.Leaves.filter(l=>l.LeaveOpenAdjustCloseId == o.LeaveOpenAdjustCloseId);
            this.Leaves.forEach(s => {

              var _leavePolicyObj = this.LeavePolicies.filter(g => g.LeaveOpenAdjustCloseId == o.MasterDataId);
              var _leavePolicyId = 0, _NoOfDays = 0, _formula = '';
              var _columnName = o.MasterDataName + " " + s.MasterDataName;
              if (!this.displayedColumns.includes(_columnName))
                this.displayedColumns.push(_columnName)


              if (_leavePolicyObj.length > 0)
                _leavePolicyId = _leavePolicyObj[0].LeavePolicyId;

              Object.keys(employeeVariable).forEach(e => {
                if (_leavePolicyObj[0].FormulaOrDays.includes('[' + e + ']'))
                  _leavePolicyObj[0].FormulaOrDays = _leavePolicyObj[0].FormulaOrDays.replaceAll('[' + e + ']', VariableConfigs[e]);

              })
              _formula = _leavePolicyObj[0].FormulaOrDays;
              _NoOfDays = evaluate(_formula);

              existingdata = this.RawLeaveBalance.filter(d => d.LeaveNameId == s.MasterDataId
                && d.LeaveOpenAdjustCloseId == o.MasterDataId
                && d.EmployeeId == item.EmpEmployeeId);
              if (existingdata.length > 0) {
                existingdata[0].Leave = s.MasterDataName;
                this.StoredForUpdate.push(existingdata[0]);
                forDisplay[_columnName] = existingdata[0].NoOfDays
              }
              else {

                var newdata = {
                  LeaveBalanceId: 0,
                  EmployeeId: 0,
                  LeavePolicyId: _leavePolicyId,
                  Leave: s.MasterDataName,
                  NoOfDays: _NoOfDays,
                  YearMonth: 0,
                  Active: 0,
                  Action: true
                }
                this.StoredForUpdate.push(newdata);
                forDisplay[_columnName] = _NoOfDays;
              }
            })
          })

          this.LeaveBalanceList.push(forDisplay);
        });
        ///////
        this.displayedColumns.push("Action");
        this.dataSource = new MatTableDataSource<any>(this.LeaveBalanceList);
      })
  }
  getMasterText(arr, itemId) {
    var filtered = arr.filter(f => f.MasterDataId == itemId);
    if (filtered.length > 0)
      return filtered[0].MasterDataName;
    else
      return '';
  }
  UpdateAll() { }
  GetEmployees() {
    this.loading = true;
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
        this.loading = false;
        ////console.log("employeeid", this.searchForm.get("searchEmployee").value.EmployeeId)
        //this.GetGradeComponents();
      })

  }
  GetLeaveBalance() {

    var orgIdSearchstr = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);// 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    var _employeeId = 0;
    var EmployeeFilter = '';
    if (this.searchForm.get("searchEmployee").value.length > 0) {
      _employeeId = this.searchForm.get("searchEmployee").value.EmployeeId;
      EmployeeFilter = " and EmployeeId eq " + _employeeId;
    }
    let list: List = new List();

    list.fields = [
      "LeaveBalanceId",
      "EmployeeId",
      "LeavePolicyId",
      "NoOfDays",
      "YearMonth",
      "Active"
    ];

    list.PageName = this.LeaveBalanceListName;
    list.filter = [orgIdSearchstr  + EmployeeFilter];
    //list.orderBy = "ParentId";
    this.LeaveBalanceList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //var employeeVariables:any=
        this.RawLeaveBalance = [...data.value];

        this.GetCurrentEmployeeVariableData(_employeeId, this.LoginUserDetail[0]["orgId"]);


        //this.dataSource = new MatTableDataSource<ILeaveBalance>(this.LeaveBalanceList);
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
export interface ILeaveBalance {
  LeaveBalanceId: number;
  EmployeeId: number;
  LeavePolicyId: number;
  Leave: string;
  NoOfDays: number;
  YearMonth: number;
  Active: number;
  Action: boolean;
}
// export interface IMonth{
//   val:number;
//   monthName:string;
// }