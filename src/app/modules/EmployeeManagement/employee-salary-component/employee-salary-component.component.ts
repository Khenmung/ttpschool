import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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
import {
  chain, evaluate, round, sqrt, min, max
} from 'mathjs';

@Component({
  selector: 'app-employee-salary-component',
  templateUrl: './employee-salary-component.component.html',
  styleUrls: ['./employee-salary-component.component.scss'],
})
export class EmployeeSalaryComponentComponent implements OnInit {
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
  SalMonthYear = '';
  CurrentEmployee = [];
  EmpComponents: IEmpComponent[] = [];
  SelectedBatchId = 0;
  //StoredForUpdate = [];
  Months = [
    { month: 'Jan', val: 1 },
    { month: 'Feb', val: 2 },
    { month: 'Mar', val: 3 },
    { month: 'Apr', val: 4 },
    { month: 'May', val: 5 },
    { month: 'Jun', val: 6 },
    { month: 'Jul', val: 7 },
    { month: 'Aug', val: 8 },
    { month: 'Sep', val: 9 },
    { month: 'Oct', val: 10 },
    { month: 'Nov', val: 11 },
    { month: 'Dec', val: 12 },
  ];
  EmployeeVariables = [];
  VariableConfigs = [];
  BasicSalary = 0;
  Employees = [];
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
  SalaryComponents = [];
  ComponentTypes = [];
  VariableTypes = [];
  dataSource: MatTableDataSource<IEmployeeSalaryComponent>;
  allMasterData = [];
  filteredOptions: Observable<IEmployee[]>;
  EmployeeSalaryComponentList = [];
  EmployeeSalaryComponentData = {
    EmployeeSalaryComponentId: 0,
    EmployeeId: 0,
    EmpComponentId: 0,
    ActualFormulaOrAmount: '',
    SalMonthYear: 0,
    OrgId: 0,
    Amount: 0,
    Active: 1
  };
  displayedColumns = [
    "SalaryComponent",
    "FormulaOrAmount",
    "ActualFormulaOrAmount",
    "Amount",
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
    var thisyear = new Date().getFullYear();
    console.log('year', thisyear);
    this.searchForm = this.fb.group({
      searchEmployee: [''],
      searchMonth: [0],
      searchYear: [thisyear, [Validators.min(2020), Validators.max(2050)]]
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
      this.getVariables();
      this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
      this.GetMasterData();

    }
  }

  updateActive(row, value) {
    //if(!row.Action)
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
          // this.GetApplicationRoles();
          this.alert.success("Data deleted successfully.", this.optionAutoClose);

        });
  }
  UpdateOrSave(row) {

    debugger;

    this.loading = true;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    let checkFilterString = "EmployeeId eq " + this.searchForm.get("searchEmployee").value.EmployeeId +
      " and EmpComponentId eq " + row.EmpComponentId +
      " and SalMonthYear eq " + row.SalMonthYear

    if (row.EmployeeSalaryComponentId > 0)
      checkFilterString += " and EmployeeSalaryComponentId ne " + row.EmployeeSalaryComponentId;
    checkFilterString += " and " + this.StandardFilter;

    let list: List = new List();
    list.fields = ["EmployeeSalaryComponentId"];
    list.PageName = "EmpEmployeeSalaryComponents";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {

          this.EmployeeSalaryComponentData.EmployeeSalaryComponentId = row.EmployeeSalaryComponentId;
          this.EmployeeSalaryComponentData.SalMonthYear = row.SalMonthYear;
          this.EmployeeSalaryComponentData.ActualFormulaOrAmount = row.ActualFormulaOrAmount.toString();
          this.EmployeeSalaryComponentData.EmployeeId = row.EmployeeId;
          this.EmployeeSalaryComponentData.Active = row.Active;
          this.EmployeeSalaryComponentData.Amount = row.Amount.toString();
          this.EmployeeSalaryComponentData.EmpComponentId = row.EmpComponentId;
          this.EmployeeSalaryComponentData.OrgId = this.LoginUserDetail[0]["orgId"];
          //console.log('data', this.ClassSubjectData);
          if (this.EmployeeSalaryComponentData.EmployeeSalaryComponentId == 0) {
            this.EmployeeSalaryComponentData["CreatedDate"] = new Date();
            this.EmployeeSalaryComponentData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EmployeeSalaryComponentData["UpdatedDate"] = new Date();
            delete this.EmployeeSalaryComponentData["UpdatedBy"];
            console.log('EmployeeSalaryComponentData', this.EmployeeSalaryComponentData)
            this.insert(row);
          }
          else {
            delete this.EmployeeSalaryComponentData["CreatedDate"];
            delete this.EmployeeSalaryComponentData["CreatedBy"];
            this.EmployeeSalaryComponentData["UpdatedDate"] = new Date();
            this.EmployeeSalaryComponentData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    debugger;
    this.dataservice.postPatch('EmpEmployeeSalaryComponents', this.EmployeeSalaryComponentData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EmployeeSalaryComponentId = data.EmployeeSalaryComponentId;
          this.loading = false;
          row.Action = false;
          this.VariableConfigs.push({ "VariableName": row.SalaryComponent, "VariableAmount": row.Amount });
          // this.rowCount++;
          // if (this.rowCount == this.displayedColumns.length - 2) {
          //   this.loading = false;
          //   this.alert.success("Data saved successfully", this.optionAutoClose);
          // }
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update(row) {

    this.dataservice.postPatch('EmpEmployeeSalaryComponents', this.EmployeeSalaryComponentData, this.EmployeeSalaryComponentData.EmployeeSalaryComponentId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.Action = false;
          var vartoUpdate = this.VariableConfigs.filter(f => f.VariableName == row.VariableName);
          if (vartoUpdate.length > 0)
            vartoUpdate[0].VariableAmount = row.Amount;
          // this.rowCount++;
          // if (this.rowCount == this.displayedColumns.length - 2) {
          //   this.loading = false;
          //   this.alert.success("Data saved successfully", this.optionAutoClose);
          // }
          this.alert.success("Data updated successfully.", this.optionAutoClose);
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
    debugger;
    //var _colName = event.srcElement.name;
    var formula = element["ActualFormulaOrAmount"];
    element["Amount"] = this.resolveFormula(formula);//_amount;
    element.Action = true;
  }
  resolveFormula(formula) {
    this.VariableConfigs.forEach(f => {
      if (formula.includes(f.VariableName))
        formula = formula.replace(f.VariableName, f.VariableAmount);
    })

    return evaluate(formula);
  }
  // UpdateAll() {
  //   this.GradeComponentList.forEach(element => {
  //     this.SaveRow(element);
  //   })
  // }
  // SaveRow(element) {
  //   debugger;
  //   this.loading = true;
  //   this.rowCount = 0;
  //   //var columnexist;
  //   for (var prop in element) {

  //     var row: any = this.StoredForUpdate.filter(s => s.SubjectMarkComponent == prop && s.StudentClassSubjectId == element.StudentClassSubjectId);

  //     if (row.length > 0 && prop != 'StudentClassSubject' && prop != 'Action') {
  //       row[0].Active = 1;
  //       row[0].Marks = row[0][prop];
  //       this.UpdateOrSave(row[0]);
  //     }

  //   }

  // }
  GetMasterData() {

    var orgIdSearchstr = 'and (ParentId eq 0  or OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ')';

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        //this.Batches = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].BATCH);
        this.Grades = this.getDropDownData(globalconstants.MasterDefinitions[2].employee[0].GRADE);
        this.Departments = this.getDropDownData(globalconstants.MasterDefinitions[0].applications[0].DEPARTMENT);
        this.WorkAccounts = this.getDropDownData(globalconstants.MasterDefinitions[2].employee[0].WORKACCOUNT);
        this.Designations = this.getDropDownData(globalconstants.MasterDefinitions[2].employee[0].DESIGNATION);
        this.JobTitles = this.getDropDownData(globalconstants.MasterDefinitions[2].employee[0].JOBTITLE);
        this.Genders = this.getDropDownData(globalconstants.MasterDefinitions[2].employee[0].EMPLOYEEGENDER);
        this.City = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].CITY);
        this.Countries = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].COUNTRY);
        this.States = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].STATE);
        this.BloodGroups = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].BLOODGROUP);
        this.Religions = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].RELIGION);
        this.Categories = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].CATEGORY);
        this.Locations = this.getDropDownData(globalconstants.MasterDefinitions[0].applications[0].LOCATION);
        this.EmploymentStatus = this.getDropDownData(globalconstants.MasterDefinitions[2].employee[0].EMPLOYMENTSTATUS);
        this.EmploymentTypes = this.getDropDownData(globalconstants.MasterDefinitions[2].employee[0].EMPLOYMENTTYPE);;
        this.Natures = this.getDropDownData(globalconstants.MasterDefinitions[2].employee[0].NATURE);
        this.MaritalStatus = this.getDropDownData(globalconstants.MasterDefinitions[2].employee[0].MARITALSTATUS);
        this.ComponentTypes = this.getDropDownData(globalconstants.MasterDefinitions[2].employee[0].COMPONENTTYPE);
        this.VariableTypes = this.getDropDownData(globalconstants.MasterDefinitions[2].employee[0].CONFIGTYPE);
        //this.loading = false;
        this.GetVariables();
        this.GetEmployees();
      });
  }
  GetVariables() {

    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    var variabletypeId = this.VariableTypes.filter(f => f.MasterDataName.toLowerCase() == 'payroll')[0].MasterDataId;
    let list: List = new List();

    list.fields = [
      "VariableName",
      "VariableAmount"
    ];

    list.PageName = "VariableConfigurations";
    list.filter = ["Active eq 1 and VariableTypeId eq " + variabletypeId + orgIdSearchstr];
    //list.orderBy = "ParentId";
    this.VariableConfigs = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.forEach(f => {
          this.VariableConfigs.push({
            "VariableName": f.VariableName, "VariableAmount": f.VariableAmount
          });
        })
      })
    console.log('this.VariableConfigs', this.VariableConfigs);
  }
  GetEmpComponents() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();

    list.fields = [
      "EmpSalaryComponentId",
      "SalaryComponent",
      "FormulaOrAmount",
      "Active"
    ];

    list.PageName = "EmpComponents";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";
    this.EmpComponents = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //var _percentorAmount = '';
        this.EmpComponents = data.value.map(d => {
          // var _percentorAmountArray = this.ComponentTypes.filter(p => p.MasterDataId == d.CommonComponent)[0].MasterDataName;
          // _percentorAmount = '';
          // if (_percentorAmountArray.toLowerCase().includes("percent"))
          //   _percentorAmount = "%";

          return {
            EmpSalaryComponentId: d.EmpSalaryComponentId,
            SalaryComponent: d.SalaryComponent,
            FormulaOrAmount: d.FormulaOrAmount
          }
        })
        this.loading = false;
        //this.dataSource = new MatemTableDataSource<IEmployeeSalaryComponent>(this.GradeComponentList);
      })
  }
  GetEmployeeSalaryComponents() {

    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    this.SalMonthYear = this.searchForm.get("searchYear").value + '' + this.searchForm.get("searchMonth").value;
    var SalMonthYearFilter = ' and SalMonthYear eq ' + this.SalMonthYear
    console.log("salmonthyear", this.SalMonthYear);
    let list: List = new List();

    list.fields = [
      "EmployeeSalaryComponentId",
      "EmployeeId",
      "EmpComponentId",
      "ActualFormulaOrAmount",
      "SalMonthYear",
      "Amount",
      "Active"
    ];

    list.PageName = "EmpEmployeeSalaryComponents";
    //list.lookupFields = ["EmpEmployeeSalaryComponents"]
    //list.orderBy = "EmployeeGradeHistoryId desc";
    //list.limitTo = 1;
    list.filter = ["EmployeeId eq " + this.searchForm.get("searchEmployee").value.EmployeeId + orgIdSearchstr + SalMonthYearFilter];
    //list.orderBy = "ParentId";
    this.EmployeeSalaryComponentList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          var objBasic = this.EmpComponents.filter(b => b.SalaryComponent.toLowerCase().includes("basic"));
          if (objBasic.length > 0)
            this.BasicSalary = objBasic[0].FormulaOrAmount;

          this.EmpComponents.forEach(ec => {

            var existing = data.value.filter(e => e.EmpComponentId == ec.EmpSalaryComponentId
              && e.SalMonthYear == this.SalMonthYear);
            if (existing.length > 0) {
              this.EmployeeSalaryComponentList.push({
                EmployeeSalaryComponentId: existing[0].EmployeeSalaryComponentId,
                EmployeeId: existing[0].EmployeeId,
                EmpComponentId: existing[0].EmpComponentId,
                SalaryComponent: ec.SalaryComponent,
                ActualFormulaOrAmount: existing[0].ActualFormulaOrAmount,
                FormulaOrAmount: ec.FormulaOrAmount,
                SalMonthYear: this.SalMonthYear,
                Amount: existing[0].Amount,
                Active: existing[0].Active,
                Action: false
              });
              this.VariableConfigs.push({
                "VariableName": ec.SalaryComponent,
                "VariableAmount": existing[0].Amount
              })
            }
            else {
              this.EmployeeSalaryComponentList.push({
                EmployeeSalaryComponentId: 0,
                EmployeeId: this.searchForm.get("searchEmployee").value.EmployeeId,
                EmpComponentId: ec.EmpSalaryComponentId,
                SalaryComponent: ec.SalaryComponent,
                ActualFormulaOrAmount: ec.FormulaOrAmount,
                FormulaOrAmount: ec.FormulaOrAmount,
                SalMonthYear: this.SalMonthYear,
                Amount: 0,
                Active: 0,
                Action: false
              });
            }
          })

        }
        else {
          this.alert.info("Employee grade has to be defined", this.optionAutoClose);
        }
        this.loading = false;
        this.dataSource = new MatTableDataSource<IEmployeeSalaryComponent>(this.EmployeeSalaryComponentList);
      })
    this.GetCurrentEmployee();
  }
  GetEmployees() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();

    list.fields = [
      "EmpEmployeeId",
      "EmployeeCode",
      "FirstName",
      "LastName"
    ];
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
        this.GetEmpComponents();
      })
  }
  GetCurrentEmployee() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    if (this.searchForm.get("searchEmployee").value.EmployeeId == 0)
      return;

    let list: List = new List();

    list.fields = ["*,EmpEmployee/*"];
    list.PageName = "EmpEmployeeGradeSalHistories";
    list.lookupFields = ["EmpEmployee"];
    list.filter = ["Active eq 1 and EmployeeId eq " + this.searchForm.get("searchEmployee").value.EmployeeId + orgIdSearchstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //this.CurrentEmployee = 
        data.value.forEach(item => {
          this.VariableConfigs.push(
            { "VariableName": "Grade", "VariableAmount": this.getMasterText(this.Grades, item.EmpGradeId) },
            { "VariableName": "Department", "VariableAmount": this.getMasterText(this.Departments, item.DepartmentId) },
            { "VariableName": "CTC", "VariableAmount": item.CTC },
            { "VariableName": "GradeFromDate", "VariableAmount": item.FromDate },
            { "VariableName": "GradeToDate", "VariableAmount": item.ToDate },
            { "VariableName": "ApprovedBy", "VariableAmount": item.ApprovedBy },
            { "VariableName": "WorkAccount", "VariableAmount": this.getMasterText(this.WorkAccounts, item.WorkAccountId) },
            { "VariableName": "JobTitle", "VariableAmount": this.getMasterText(this.JobTitles, item.JobTitleId) },
            { "VariableName": "Designation", "VariableAmount": this.getMasterText(this.Designations, item.DesignationId) },
            { "VariableName": "EmployeeId", "VariableAmount": item.EmpEmployeeId },
            { "VariableName": "FirstName", "VariableAmount": item.EmpEmployee.FirstName },
            { "VariableName": "LastName", "VariableAmount": item.EmpEmployee.LastName },
            { "VariableName": "FatherName", "VariableAmount": item.EmpEmployee.FatherName },
            { "VariableName": "MotherName", "VariableAmount": item.EmpEmployee.MotherName },
            { "VariableName": "Gender", "VariableAmount": this.getMasterText(this.Genders, item.EmpEmployee.Gender) },
            { "VariableName": "Address", "VariableAmount": item.EmpEmployee.Address },
            { "VariableName": "DOB", "VariableAmount": item.EmpEmployee.DOB },
            { "VariableName": "DOJ", "VariableAmount": item.EmpEmployee.DOJ },
            { "VariableName": "City", "VariableAmount": this.getMasterText(this.City, item.EmpEmployee.CityId) },
            { "VariableName": "Pincode", "VariableAmount": item.EmpEmployee.pincode },
            { "VariableName": "State", "VariableAmount": this.getMasterText(this.States, item.EmpEmployee.StateId) },
            { "VariableName": "Country", "VariableAmount": this.getMasterText(this.Countries, item.EmpEmployee.CountryId) },
            { "VariableName": "Bloodgroup", "VariableAmount": this.getMasterText(this.BloodGroups, item.EmpEmployee.Bloodgroup) },
            { "VariableName": "Category", "VariableAmount": this.getMasterText(this.Categories, item.EmpEmployee.CategoryId) },
            { "VariableName": "BankAccountNo", "VariableAmount": item.EmpEmployee.BankAccountNo },
            { "VariableName": "IFSCcode", "VariableAmount": item.EmpEmployee.IFSCcode },
            { "VariableName": "MICRNo", "VariableAmount": item.EmpEmployee.MICRNo },
            { "VariableName": "AdhaarNo", "VariableAmount": item.EmpEmployee.AdhaarNo },
            { "VariableName": "Religion", "VariableAmount": this.getMasterText(this.Religions, item.EmpEmployee.ReligionId) },
            { "VariableName": "ContactNo", "VariableAmount": item.EmpEmployee.ContactNo },
            { "VariableName": "AlternateContactNo", "VariableAmount": item.EmpEmployee.AlternateContactNo },
            { "VariableName": "EmailAddress", "VariableAmount": item.EmpEmployee.EmailAddress },
            { "VariableName": "Location", "VariableAmount": this.getMasterText(this.Locations, item.EmpEmployee.LocationId) },
            { "VariableName": "EmploymentStatus", "VariableAmount": this.getMasterText(this.EmploymentStatus, item.EmpEmployee.EmploymentStatusId) },
            { "VariableName": "EmploymentType", "VariableAmount": this.getMasterText(this.EmploymentTypes, item.EmpEmployee.EmploymentTypeId) },
            { "VariableName": "EmploymentTerm", "VariableAmount": this.getMasterText(this.Natures, item.EmpEmployee.EmploymentTermId) },
            { "VariableName": "ConfirmationDate", "VariableAmount": item.EmpEmployee.ConfirmationDate },
            { "VariableName": "NoticePeriodDays", "VariableAmount": item.EmpEmployee.NoticePeriodDays },
            { "VariableName": "ProbationPeriodDays", "VariableAmount": item.EmpEmployee.ProbationPeriodDays },
            { "VariableName": "PAN", "VariableAmount": item.EmpEmployee.PAN },
            { "VariableName": "PassportNo", "VariableAmount": item.EmpEmployee.PassportNo },
            { "VariableName": "MaritalStatus", "VariableAmount": this.getMasterText(this.MaritalStatus, item.EmpEmployee.MaritalStatusId) },
            { "VariableName": "MarriedDate", "VariableAmount": item.EmpEmployee.MarriedDate },
            { "VariableName": "PFAccountNo", "VariableAmount": item.EmpEmployee.PFAccountNo },
            { "VariableName": "Active", "VariableAmount": item.EmpEmployee.Active },
            { "VariableName": "EmployeeCode", "VariableAmount": item.EmpEmployee.EmployeeCode }
          )
        });
        console.log("v inside", this.VariableConfigs)
      })
  }
  getMasterText(arr, itemId) {
    var filtered = arr.filter(f => f.MasterDataId == itemId);
    if (filtered.length > 0)
      return filtered[0].MasterDataName;
    else
      return '';
  }
  getVariables() {
    this.EmployeeVariables = [...globalconstants.MasterDefinitions[3].VariableName];
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
export interface IEmployeeSalaryComponent {
  EmployeeSalaryComponentId: number;
  EmployeeId: number;
  EmpComponentId: number;
  ActualFormulaOrAmount: string;
  FormulaOrAmount: number;
  SalMonthYear: string;
  Amount: number;
  Active: number;
  Action: boolean;
}
export interface IEmpComponent {
  EmpSalaryComponentId: number;
  SalaryComponent: string;
  FormulaOrAmount: number;
}
export interface IEmployee {
  EmployeeId: number;
  Name: string;
}
