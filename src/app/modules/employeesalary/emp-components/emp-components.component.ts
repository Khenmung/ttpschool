import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-emp-components',
  templateUrl: './emp-components.component.html',
  styleUrls: ['./emp-components.component.scss']
})
export class EmpComponentsComponent implements OnInit {
    PageLoading = true;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  Permission = '';
  VariableTypes = [];
  VariableConfigs = [];
  EmployeeVariables = [];
  EmpComponentListName = 'EmpComponents';
  StandardFilter = '';
  loading = false;
  rowCount = 0;
  EmpComponentList: IEmpComponent[] = [];
  SelectedBatchId = 0;
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
  Batches = [];
  dataSource: MatTableDataSource<IEmpComponent>;
  allMasterData = [];


  EmpComponentData = {
    EmpSalaryComponentId: 0,
    SalaryComponent: '',
    FormulaOrAmount: 0,
    ComponentTypeId: 0,
    OrgId: 0,
    Active: 0
  };
  displayedColumns = [
    "SalaryComponent",
    "FormulaOrAmount",
    "ComponentTypeId",
    "Active",
    "Action"
  ];
  SelectedApplicationId = 0;
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,

    private route: ActivatedRoute,
    private nav: Router,
    private contentservice: ContentService,
    private datepipe: DatePipe,
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
      searchComponentId: [0],
    });
    this.PageLoad();
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.emp.employee);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission == 'deny') {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
      else {
        this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
        this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
        this.GetMasterData();
        this.getEmployeeVariables();
      }
    }
  }
  // updateDeduction(row, value) {
  //   //debugger;
  //   row.Action = true;
  //   row.Deduction = value.checked == 1 ? 1 : 0;
  // }

  updateActive(row, value) {
    //if(!row.Action)
    row.Action = true;
    row.Active = value.checked == 1 ? 1 : 0;
  }

  UpdateOrSave(row) {

    //debugger;
    this.loading = true;
    let checkFilterString = "SalaryComponent eq '" + row.SalaryComponent + "'";

    if (row.EmpSalaryComponentId > 0)
      checkFilterString += " and EmpSalaryComponentId ne " + row.EmpSalaryComponentId;
    checkFilterString += " and " + this.StandardFilter;

    let list: List = new List();
    list.fields = ["EmpSalaryComponentId"];
    list.PageName = this.EmpComponentListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.EmpComponentData.EmpSalaryComponentId = row.EmpSalaryComponentId;
          this.EmpComponentData.Active = row.Active;
          this.EmpComponentData.SalaryComponent = row.SalaryComponent;
          this.EmpComponentData.ComponentTypeId = row.ComponentTypeId;
          this.EmpComponentData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.EmpComponentData.FormulaOrAmount = row.FormulaOrAmount;
          ////console.log('data', this.EmpComponentData);
          if (this.EmpComponentData.EmpSalaryComponentId == 0) {
            this.EmpComponentData["CreatedDate"] = new Date();
            this.EmpComponentData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EmpComponentData["UpdatedDate"] = new Date();
            delete this.EmpComponentData["UpdatedBy"];
            ////console.log('exam slot', this.ExamStudentSubjectResultData)
            this.insert(row);
          }
          else {
            delete this.EmpComponentData["CreatedDate"];
            delete this.EmpComponentData["CreatedBy"];
            this.EmpComponentData["UpdatedDate"] = new Date();
            this.EmpComponentData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.EmpComponentListName, this.EmpComponentData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EmpSalaryComponentId = data.EmpSalaryComponentId;
          this.loading = false; this.PageLoading = false;
          row.Action = false;
          // this.rowCount++;
          // if (this.rowCount == this.displayedColumns.length - 2) {
          //   this.loading = false; this.PageLoading=false;
          //   this.contentservice.openSnackBar(globalconstants.AddedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          // }
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {
    ////console.log("this.EmpComponentData", this.EmpComponentData);
    this.dataservice.postPatch(this.EmpComponentListName, this.EmpComponentData, this.EmpComponentData.EmpSalaryComponentId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.loading = false; this.PageLoading = false;
          // this.rowCount++;
          // if (this.rowCount == this.displayedColumns.length - 2) {
          //   this.loading = false; this.PageLoading=false;
          //   this.contentservice.openSnackBar(globalconstants.AddedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          // }
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }

  checkall(value) {
    this.EmpComponentList.forEach(record => {
      if (value.checked)
        record.Active = 1;
      else
        record.Active = 0;
      record.Action = !record.Action;
    })
  }
  saveall() {
    this.EmpComponentList.forEach(record => {
      if (record.Action == true) {
        this.UpdateOrSave(record);
      }
    })
  }

  onBlur(element, event) {
    //debugger;
    //var _colName = event.srcElement.name;
    element.Action = true;
    ////console.log("event", event);
    //var row = this.StoredForUpdate.filter(s => s.SubjectMarkComponent == _colName && s.StudentClassSubjectId == element.StudentClassSubjectId);
    //row[0][_colName] = element[_colName];
  }

  UpdateAll() {
    this.EmpComponentList.forEach(element => {
      this.SaveRow(element);
    })
  }
  SaveRow(element) {
    //debugger;
    this.loading = true;
    this.rowCount = 0;
    //var columnexist;
    // for (var prop in element) {

    //   //var row: any = this.StoredForUpdate.filter(s => s.SubjectMarkComponent == prop && s.StudentClassSubjectId == element.StudentClassSubjectId);

    //   if (row.length > 0 && prop != 'StudentClassSubject' && prop != 'Action') {
    //     row[0].Active = 1;
    //     row[0].Marks = row[0][prop];
    //     this.UpdateOrSave(row[0]);
    //   }

    // }

  }
  GetConfigVariables() {

    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    var variabletypeId = this.VariableTypes.filter(f => f.MasterDataName.toLowerCase() == 'payroll')[0].MasterDataId;

    let list: List = new List();

    list.fields = [
      "VariableConfigurationId",
      "VariableName",
      "VariableAmount",
      "Active"
    ];

    list.PageName = "VariableConfigurations";
    list.filter = ["Active eq 1 and VariableTypeId eq " + variabletypeId + orgIdSearchstr];
    //list.orderBy = "ParentId";
    this.VariableConfigs = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.VariableConfigs = [...data.value];
      })
  }
  GetMasterData() {

    this.allMasterData = this.tokenstorage.getMasterData();
    this.VariableTypes = this.getDropDownData(globalconstants.MasterDefinitions.common.CONFIGTYPE);
    //this.Grades = this.getDropDownData(globalconstants.MasterDefinitions.employee.GRADE);
    //this.SalaryComponents = this.getDropDownData(globalconstants.MasterDefinitions.employee.SALARYCOMPONENT);
    this.ComponentTypes = this.getDropDownData(globalconstants.MasterDefinitions.employee.COMPONENTTYPE);
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

    this.GetConfigVariables();
    this.GetAllComponents();
    //this.loading = false; this.PageLoading=false;
  }
  GetEmpComponents() {

    this.loading = true;
    var orgIdSearchstr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    var compfilter = ''
    if (this.searchForm.get("searchComponentId").value > 0)
      compfilter = " and EmpSalaryComponentId eq " + this.searchForm.get("searchComponentId").value

    let list: List = new List();
    list.fields = [
      "EmpSalaryComponentId",
      "SalaryComponent",
      "FormulaOrAmount",
      "ComponentTypeId",
      "Active"
    ];

    list.PageName = this.EmpComponentListName;
    list.filter = [orgIdSearchstr + compfilter];
    //list.orderBy = "ParentId";
    this.EmpComponentList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        data.value.forEach(f => {
          f.Action = false;
        })
        this.EmpComponentList = [...data.value];
        //console.log('all data',this.EmpComponentList)
        this.dataSource = new MatTableDataSource<IEmpComponent>(this.EmpComponentList);
        this.loading = false; this.PageLoading = false;
      })
  }
  getEmployeeVariables() {
    this.EmployeeVariables = [...globalconstants.MasterDefinitions.EmployeeVariableName];
    // globalconstants.MasterDefinitions.VariableName.forEach(f=>{
    //   switch(f)
    //   {
    //     case 
    //   }
    // })
  }
  GetAllComponents() {

    var orgIdSearchstr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();

    list.fields = [
      "EmpSalaryComponentId",
      "SalaryComponent"
    ];

    list.PageName = this.EmpComponentListName;
    list.filter = [orgIdSearchstr];
    //list.orderBy = "ParentId";
    this.EmpComponentList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.SalaryComponents = [...data.value];
        this.loading = false; this.PageLoading = false;
      })
  }
  addnew() {
    var newdata = {
      "EmpSalaryComponentId": 0,
      "SalaryComponent": '',
      "FormulaOrAmount": '',
      "ComponentTypeId": 0,
      "Active": 0,
      "Action": false
    }
    this.EmpComponentList.push(newdata);
    this.dataSource = new MatTableDataSource<IEmpComponent>(this.EmpComponentList);
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
export interface IEmpComponent {
  EmpSalaryComponentId: number;
  SalaryComponent: string;
  FormulaOrAmount: string;
  ComponentTypeId: number;
  Active: number;
  Action: boolean;
}