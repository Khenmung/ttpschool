import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TableUtil } from 'src/app/shared/TableUtil';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-employeesearch',
  templateUrl: './employeesearch.component.html',
  styleUrls: ['./employeesearch.component.scss']
})
export class EmployeesearchComponent implements OnInit {
  @ViewChild("table") tableRef: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  loading = false;
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  Designations = [];
  filterOrgIdNBatchId = '';
  filterOrgIdOnly = '';
  filterBatchIdNOrgId = '';
  EmployeeData: IEmployee[];
  dataSource: MatTableDataSource<IEmployee>;
  displayedColumns = [
    'EmployeeCode',
    'Name',
    'Department',
    'Designation',
    'Grade',
    'Manager',
    'Active',
    'Action'];
  SelectedApplicationId = 0;
  allMasterData = [];
  Employees = [];
  Genders = [];
  Grades = [];
  Batches = [];
  Bloodgroup = [];
  Category = [];
  Religion = [];
  Departments = [];
  States = []
  PrimaryContact = [];
  Location = [];
  LanguageSubjUpper = [];
  LanguageSubjLower = [];
  UploadTypes = [];
  ReasonForLeaving = [];
  //StandardFilter ='';
  SelectedBatchId = 0;
  SelectedBatchEmpEmployeeIdRollNo = [];
  EmployeeClassId = 0;
  EmployeeSearchForm: FormGroup;
  filteredEmployees: Observable<IEmployee[]>;
  filteredEmployeeCode: Observable<IEmployee[]>;
  LoginUserDetail = [];
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private route: Router,
    private alert: AlertService,
    private fb: FormBuilder,
    private shareddata: SharedataService,
    private token: TokenStorageService) { }

  ngOnInit(): void {
    //debugger;
    this.loading = true;
    this.LoginUserDetail = this.token.getUserDetail();

    this.filterOrgIdOnly = globalconstants.getStandardFilter(this.LoginUserDetail);
    this.filterBatchIdNOrgId = globalconstants.getStandardFilterWithBatchId(this.token);
    this.EmployeeSearchForm = this.fb.group({
      searchemployeeName: [''],
      EmployeeCode: ['']
    })
    this.SelectedApplicationId = +this.token.getSelectedAPPId();
    this.filteredEmployees = this.EmployeeSearchForm.get("searchemployeeName").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Employees.slice())
      );
    this.filteredEmployeeCode = this.EmployeeSearchForm.get("EmployeeCode").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.EmployeeCode),
        map(EmployeeCode => EmployeeCode ? this._filterC(EmployeeCode) : this.Employees.slice())
      );

    // this.contentservice.GetGrades(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
    //   this.Grades = [...data.value];
    // });


    this.GetMasterData();
    //this.GetFeeTypes();
    this.GetEmployees();
    this.loading = false;
  }
  private _filter(name: string): IEmployee[] {

    const filterValue = name.toLowerCase();
    return this.Employees.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  private _filterC(name: string): IEmployee[] {

    const filterValue = name.toLowerCase();
    return this.Employees.filter(option => option.EmployeeCode.toLowerCase().includes(filterValue));

  }
  displayFn(emp: IEmployee): string {
    return emp && emp.Name ? emp.Name : '';
  }
  displayFnC(emp: IEmployee): string {
    return emp && emp.EmployeeCode ? emp.EmployeeCode : '';
  }
  GetMasterData() {
    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {

        this.SelectedBatchId = +this.token.getSelectedBatchId();
        this.filterOrgIdNBatchId = globalconstants.getStandardFilterWithBatchId(this.token);

        this.shareddata.ChangeMasterData(data.value);
        this.allMasterData = [...data.value];

        this.ReasonForLeaving = this.getDropDownData(globalconstants.MasterDefinitions.school.REASONFORLEAVING);
        this.shareddata.ChangeReasonForLeaving(this.ReasonForLeaving);

        this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));

        this.Category = this.getDropDownData(globalconstants.MasterDefinitions.common.CATEGORY);
        this.shareddata.ChangeCategory(this.Category);

        this.Religion = this.getDropDownData(globalconstants.MasterDefinitions.common.RELIGION);
        this.shareddata.ChangeReligion(this.Religion);

        this.States = this.getDropDownData(globalconstants.MasterDefinitions.common.STATE);
        this.shareddata.ChangeStates(this.States);

        this.PrimaryContact = this.getDropDownData(globalconstants.MasterDefinitions.school.PRIMARYCONTACT);
        this.shareddata.ChangePrimaryContact(this.PrimaryContact);

        this.Location = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.LOCATION);
        this.shareddata.ChangeLocation(this.Location);

        this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);
        this.shareddata.ChangeGenders(this.Genders);

        this.Bloodgroup = this.getDropDownData(globalconstants.MasterDefinitions.common.BLOODGROUP);
        this.shareddata.ChangeBloodgroup(this.Bloodgroup);

        this.LanguageSubjUpper = this.getDropDownData(globalconstants.MasterDefinitions.school.LANGUAGESUBJECTUPPERCLS);
        this.shareddata.ChangeLanguageSubjectUpper(this.LanguageSubjUpper);

        this.LanguageSubjLower = this.getDropDownData(globalconstants.MasterDefinitions.school.LANGUAGESUBJECTLOWERCLS);
        this.shareddata.ChangeLanguageSubjectLower(this.LanguageSubjLower);

        this.Designations = this.getDropDownData(globalconstants.MasterDefinitions.employee.DESIGNATION);
        this.Grades = this.getDropDownData(globalconstants.MasterDefinitions.employee.GRADE);
        this.Departments = this.getDropDownData(globalconstants.MasterDefinitions.employee.DEPARTMENT);
        //this.Designations = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.);
        //this.shareddata.ChangeLanguageSubjectLower(this.LanguageSubjLower);

        // this.contentservice.GetFeeDefinitions(this.SelectedBatchId, this.LoginUserDetail[0]["orgId"]).subscribe((f: any) => {
        //   this.FeeDefinitions = [...f.value];
        //   this.shareddata.ChangeFeeDefinition(this.FeeDefinitions);
        // });
        //this.FeeDefinitions = this.getDropDownData(globalconstants.MasterDefinitions.school.FEENAME);


        // this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        // this.shareddata.ChangeSection(this.Sections);

        this.UploadTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.UPLOADTYPE);
        this.shareddata.ChangeUploadType(this.UploadTypes);

        this.loading = false;
        //this.getSelectedBatchEmpEmployeeIdRollNo();


      });

  }
  getDropDownData(dropdowntype) {
    let Ids = this.allMasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    });
    if (Ids.length > 0) {
      var Id = Ids[0].MasterDataId;
      return this.allMasterData.filter((item, index) => {
        return item.ParentId == Id
      });
    }
    else
      return [];
  }
  fee(id) {
    this.route.navigate(['/edu/addEmployeefeepayment/' + id]);
  }
  class(id) {
    this.route.navigate(['/edu/addEmployeecls/' + id]);
  }
  view(element) {
    //debugger;
    this.generateDetail(element);
    //  this.route.navigate(['/admin/addEmployee/' + id], { queryParams: { scid: this.EmployeeClassId, bid: this.BatchId } });
    this.route.navigate(['/employee/info']);
  }
  feepayment(element) {
    this.generateDetail(element);
    this.route.navigate(['/edu/feepayment']);
  }
  generateDetail(element) {
    debugger;
    let EmployeeName = element.EmployeeCode + ' ' + element.Name;
    this.shareddata.ChangeEmployeeName(EmployeeName);

    this.token.saveEmployeeId(element.EmpEmployeeId);

  }
  addNew() {
    //var url = this.route.url;
    this.token.saveEmployeeId("0");
    this.route.navigate(['/employee/info']);
  }
  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.tableRef.nativeElement);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'basicinfo.xlsx');
  }
  exportArray() {
    const datatoExport: Partial<IEmployeeDownload>[] = this.EmployeeData.map(x => ({
      EmployeeCode: x.EmployeeCode,
      FistName: x.FirstName,
      LastName: x.LastName,
      Designation: x.Designation,
      Department: x.Department,
      Manager: x.Manager,
      Grade: x.Grade
    }));
    TableUtil.exportArrayToExcel(datatoExport, "ExampleArray");
  }
  getSelectedBatchEmpEmployeeIdRollNo() {
    let list: List = new List();
    list.fields = ["EmpEmployeeId", "RollNo", "SectionId", "EmployeeClassId", "ClassId"];
    list.PageName = "EmployeeClasses";
    list.filter = [this.filterOrgIdNBatchId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.SelectedBatchEmpEmployeeIdRollNo = [...data.value];

        }
      })
  }
  // GetFeeTypes() {
  //   this.loading = true;
  //   var filter = globalconstants.getStandardFilterWithBatchId(this.token);
  //   let list: List = new List();
  //   list.fields = ["FeeTypeId", "FeeTypeName", "Formula"];
  //   list.PageName = "SchoolFeeTypes";
  //   list.filter = [filter];

  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       this.FeeType = [...data.value];
  //       this.shareddata.ChangeFeeType(this.FeeType);
  //       this.loading = false;
  //     })
  // }
  GetEmployee() {
    debugger;

    let checkFilterString = '';//"OrgId eq " + this.LoginUserDetail[0]["orgId"] + ' and Batch eq ' + 
    var EmployeeName = this.EmployeeSearchForm.get("searchemployeeName").value.Name;
    if (EmployeeName != undefined && EmployeeName.trim().length > 0)
      checkFilterString += " and  EmpEmployeeId eq " + this.EmployeeSearchForm.get("searchemployeeName").value.EmployeeId;

    let list: List = new List();
    list.fields = [
      "EmpEmployeeId", "ShortName", "FirstName", "LastName", "EmployeeCode", "Active"
    ];
    list.PageName = "EmpEmployees";
    list.lookupFields = ["EmpEmployeeGradeSalHistoryEmployees($filter=Active eq 1;$select=ManagerId,EmployeeId,EmpGradeId,DepartmentId,DesignationId,Active)"];
    list.filter = [this.filterOrgIdOnly + checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        ////console.log(data.value);
        if (data.value.length > 0) {

          this.EmployeeData = data.value.map(item => {
            var gradeObj = this.Grades.filter(g => g.MasterDataId == item.EmpEmployeeGradeSalHistoryEmployees[0].EmpGradeId);
            var _gradeName = '';
            if (gradeObj.length > 0)
              _gradeName = gradeObj[0].MasterDataName;
            
              var designationObj = this.Designations.filter(d => d.MasterDataId == item.EmpEmployeeGradeSalHistoryEmployees[0].DesignationId);
            var _designationName = '';
            if (designationObj.length > 0)
            _designationName = designationObj[0].MasterDataName;
            
            var departmentObj = this.Departments.filter(d => d.MasterDataId == item.EmpEmployeeGradeSalHistoryEmployees[0].DepartmentId);
            var _departmentName = '';
            if (departmentObj.length > 0)
            _departmentName = departmentObj[0].MasterDataName;
            
            var managerObj = this.Employees.filter(d => d.EmployeeId == item.EmpEmployeeGradeSalHistoryEmployees[0].ManagerId);
            var _managerName = '';
            if (managerObj.length > 0)
            _managerName = managerObj[0].Name;

            
            item.EmployeeCode = item.EmployeeCode;
            item.Name = item.FirstName + " " + item.LastName;
            item.Grade = _gradeName;
            item.Designation = _designationName;
            item.Department = _departmentName;
            item.Manager = _managerName;//item.EmpEmployeeGradeSalHistoryManagers.FirstName + " " + item.EmpEmployeeGradeSalHistoryManagers.LastName;
            return item;
          })
        }
        else {
          this.EmployeeData = [];
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage,globalconstants.ActionText,globalconstants.RedBackground);
        }
        this.dataSource = new MatTableDataSource<IEmployee>(this.EmployeeData);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });

  }
  GetEmployees() {
    this.loading = true;
    let list: List = new List();
    list.fields = ["EmpEmployeeId", "EmployeeCode", "FirstName", "LastName", "ContactNo"];
    list.PageName = "EmpEmployees";
    list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.Employees = data.value.map(Employee => {

            var _name = Employee.FirstName + " " + Employee.LastName;
            var _fullDescription = _name + "-" + Employee.ContactNo;
            return {
              EmployeeId: Employee.EmpEmployeeId,
              EmployeeCode: Employee.EmployeeCode,
              Name: _fullDescription
            }
          })
        }
        this.loading = false;
      })
  }
}
export interface IEmployee {
  EmployeeCode: string;
  Name: string;
  FirstName: string;
  LastName: string;
  ShortName: string;
  Department: string;
  Designation: string;
  Manager: string;
  Grade: string;
  Active: boolean;
  Action: boolean;
}
export interface IEmployeeDownload {
  EmployeeCode: string;
  FistName: string;
  LastName: string;
}



