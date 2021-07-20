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
  selector: 'app-employee-salary-component',
  templateUrl: './employee-salary-component.component.html',
  styleUrls: ['./employee-salary-component.component.scss']
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
  GradeComponents: IGradeComponent[] = [];
  SelectedBatchId = 0;
  StoredForUpdate = [];
  //SubjectMarkComponents = [];
  //MarkComponents = [];
  Employees = [];
  Grades = [];
  SalaryComponents = [];
  ComponentTypes = [];
  Batches = [];
  dataSource: MatTableDataSource<IEmployeeSalaryComponent>;
  allMasterData = [];
  filteredOptions: Observable<IEmployee[]>;
  EmployeeSalaryComponentList = [];
  EmployeeSalaryComponentData = {
    EmployeeSalaryComponentId: 0,
    EmployeeId: 0,
    EmpGradeComponentId: 0,
    ActualEmpployeeCompPCorAmount: '',
    OrgId: 0,
    Amount: 0,
    Active: 1
  };
  displayedColumns = [
    "Grade",
    "SalaryComponent",
    "PercentOfBasicOrAmount",
    "ActualEmpployeeCompPCorAmount",
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
    this.searchForm = this.fb.group({
      searchEmployee: [''],
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
    let checkFilterString = "EmployeeId eq " + this.searchForm.get("searchEmployee").value.EmployeeId +
      " and EmpGradeComponentId eq " + row.EmpGradeComponentId


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
          this.EmployeeSalaryComponentData.ActualEmpployeeCompPCorAmount = row.ActualEmpployeeCompPCorAmount;
          this.EmployeeSalaryComponentData.EmployeeId = row.EmployeeId;
          this.EmployeeSalaryComponentData.Active = row.Active;
          this.EmployeeSalaryComponentData.Amount = row.Amount;
          this.EmployeeSalaryComponentData.EmpGradeComponentId = row.EmpGradeComponentId;
          this.EmployeeSalaryComponentData.OrgId = this.LoginUserDetail[0]["orgId"];
          //console.log('data', this.ClassSubjectData);
          if (this.EmployeeSalaryComponentData.EmployeeSalaryComponentId == 0) {
            this.EmployeeSalaryComponentData["CreatedDate"] = new Date();
            this.EmployeeSalaryComponentData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EmployeeSalaryComponentData["UpdatedDate"] = new Date();
            delete this.EmployeeSalaryComponentData["UpdatedBy"];
            //console.log('exam slot', this.ExamStudentSubjectResultData)
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
    var _colName = event.srcElement.name;
    console.log("event", event);
    var row = this.StoredForUpdate.filter(s => s.SubjectMarkComponent == _colName && s.StudentClassSubjectId == element.StudentClassSubjectId);
    row[0][_colName] = element[_colName];
  }

  // UpdateAll() {
  //   this.GradeComponentList.forEach(element => {
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
        this.SalaryComponents = this.getDropDownData(globalconstants.MasterDefinitions[2].employee[0].SALARYCOMPONENT);
        this.ComponentTypes = this.getDropDownData(globalconstants.MasterDefinitions[2].employee[0].COMPONENTTYPE);
        //this.loading = false;
        this.GetEmployees();
      });
  }
  GetGradeComponents() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();

    list.fields = [
      "EmpGradeSalaryComponentId",
      "EmpGradeId",
      "SalaryComponentId",
      "PercentOfBasicOrAmount",
      "ComponentTypeId",
      "Active"
    ];

    list.PageName = "EmpGradeComponents";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";
    this.GradeComponents = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        this.GradeComponents = data.value.map(d => {
          return {
            EmpGradeSalaryComponentId: d.EmpGradeSalaryComponentId,
            EmpGradeId: d.EmpGradeId,
            SalaryComponentId: d.SalaryComponentId,
            PercentOfBasicOrAmount: d.PercentOfBasicOrAmount,
            Grade: this.Grades.filter(g => g.MasterDataId == d.EmpGradeId)[0].MasterDataName,
            SalaryComponent: this.SalaryComponents.filter(g => g.MasterDataId == d.SalaryComponentId)[0].MasterDataName
          }
        })
        this.loading = false;
        //this.dataSource = new MatTableDataSource<IEmployeeSalaryComponent>(this.GradeComponentList);
      })
  }
  GetEmployeeSalaryComponents() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();

    list.fields = [
      "EmployeeSalaryComponentId",
      "EmployeeId",
      "EmpGradeComponentId",
      "ActualEmpployeeCompPCorAmount",
      "PercentOfBasicOrAmount",
      "Amount",
      "Active",
      "EmpEmployeeGradeSalHistory/EmpGradeId"
    ];

    list.PageName = "EmpEmployeeSalaryComponents";
    list.lookupFields=["EmpEmployeeGradeSalHistory"]
    list.filter = ["Active eq 1 and EmployeeId eq " + this.searchForm.get("searchEmployee").value.EmployeeId + orgIdSearchstr];
    //list.orderBy = "ParentId";
    this.GradeComponents = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.GradeComponents.forEach(gc => {
          var existing = data.value.filter(e => e.EmpGradeComponentId == gc.SalaryComponentId);
          if (existing.length > 0)
            this.EmployeeSalaryComponentList.push({
              EmployeeSalaryComponentId: existing[0].EmployeeSalaryComponentId,
              EmployeeId: existing[0].EmployeeId,
              EmpGradeComponentId: gc.SalaryComponentId,
              SalaryComponent: gc.SalaryComponent,
              Grade: gc.Grade,
              ActualEmpployeeCompPCorAmount: existing[0].ActualEmpployeeCompPCorAmount,
              PercentOfBasicOrAmount: gc.PercentOfBasicOrAmount,
              Amount: existing[0].Amount,
              Active: existing[0].Active
            });
          else
            this.EmployeeSalaryComponentList.push({
              EmployeeSalaryComponentId: 0,
              EmployeeId: this.searchForm.get("searchEmployee").value.EmployeeId,
              EmpGradeComponentId: gc.SalaryComponentId,
              SalaryComponent: gc.SalaryComponent,
              Grade: gc.Grade,
              ActualEmpployeeCompPCorAmount: gc.PercentOfBasicOrAmount,
              PercentOfBasicOrAmount: gc.PercentOfBasicOrAmount,
              Amount: 0,
              Active: 0
            });
        })
        this.dataSource = new MatTableDataSource<IEmployeeSalaryComponent>(this.EmployeeSalaryComponentList);
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
        this.GetGradeComponents();
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
export interface IEmployeeSalaryComponent {
  EmployeeSalaryComponentId: number;
  EmployeeId: number;
  EmpGradeComponentId: number;
  ActualEmpployeeCompPCorAmount: string;
  PercentOfBasicOrAmount: number;
  Amount: number;
  Active: number;
  Action: boolean;
}
export interface IGradeComponent {
  EmpGradeSalaryComponentId: number;
  EmpGradeId: number;
  SalaryComponentId: number;
  PercentOfBasicOrAmount: number;
  Grade: string;
  SalaryComponent: string;
}
export interface IEmployee {
  EmployeeId: number;
  Name: string;
}