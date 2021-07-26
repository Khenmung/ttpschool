import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-emp-components',
  templateUrl: './emp-components.component.html',
  styleUrls: ['./emp-components.component.scss']
})
export class EmpComponentsComponent implements OnInit {
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
  EmpComponentListName = 'EmpComponents';
  StandardFilter = '';
  loading = false;
  rowCount = 0;
  EmpComponentList: IEmpComponent[] = [];
  SelectedBatchId = 0;
  Grades = [];
  SalaryComponents = [];
  ComponentTypes = [];
  Batches = [];
  dataSource: MatTableDataSource<IEmpComponent>;
  allMasterData = [];


  EmpComponentData = {
    EmpSalaryComponentId: 0,
    SalaryComponentId: 0,
    FormulaOrAmount: 0,
    Deduction: 0,
    LimitAmount: 0,
    OrgId: 0,
    Active: 0
  };
  displayedColumns = [
    "SalaryComponent",
    "FormulaOrAmount",
    "LimitAmount",
    "Deduction",
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
      this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
      this.GetMasterData();

    }
  }
  updateDeduction(row, value) {
    debugger;
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
          this.alert.success("Data deleted successfully.", this.optionAutoClose);

        });
  }
  UpdateOrSave(row) {

    debugger;
    this.loading = true;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    let checkFilterString = "SalaryComponentId eq " + this.searchForm.get("searchComponentId").value;
    //" and SalaryComponentId eq " + row.SalaryComponentId


    if (row.EmpSalaryComponentId > 0)
      checkFilterString += " and EmpSalaryComponentId ne " + row.EmpSalaryComponentId;
    checkFilterString += " and " + this.StandardFilter;

    let list: List = new List();
    list.fields = ["EmpSalaryComponentId"];
    list.PageName = this.EmpComponentListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {

          this.EmpComponentData.EmpSalaryComponentId = row.EmpSalaryComponentId;
          this.EmpComponentData.Active = row.Active;
          this.EmpComponentData.SalaryComponentId = row.SalaryComponentId;
          this.EmpComponentData.Deduction = row.Deduction;
          this.EmpComponentData.LimitAmount = row.LimitAmount.toString();
          this.EmpComponentData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.EmpComponentData.FormulaOrAmount = row.FormulaOrAmount;
          console.log('data', this.EmpComponentData);
          if (this.EmpComponentData.EmpSalaryComponentId == 0) {
            this.EmpComponentData["CreatedDate"] = new Date();
            this.EmpComponentData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EmpComponentData["UpdatedDate"] = new Date();
            delete this.EmpComponentData["UpdatedBy"];
            //console.log('exam slot', this.ExamStudentSubjectResultData)
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

    debugger;
    this.dataservice.postPatch(this.EmpComponentListName, this.EmpComponentData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EmpSalaryComponentId = data.EmpSalaryComponentId;
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
    console.log("this.EmpComponentData", this.EmpComponentData);
    this.dataservice.postPatch(this.EmpComponentListName, this.EmpComponentData, this.EmpComponentData.EmpSalaryComponentId, 'patch')
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
    debugger;
    var _colName = event.srcElement.name;
    console.log("event", event);
    //var row = this.StoredForUpdate.filter(s => s.SubjectMarkComponent == _colName && s.StudentClassSubjectId == element.StudentClassSubjectId);
    //row[0][_colName] = element[_colName];
  }

  UpdateAll() {
    this.EmpComponentList.forEach(element => {
      this.SaveRow(element);
    })
  }
  SaveRow(element) {
    debugger;
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
        //this.Grades = this.getDropDownData(globalconstants.MasterDefinitions[2].employee[0].GRADE);
        this.SalaryComponents = this.getDropDownData(globalconstants.MasterDefinitions[2].employee[0].SALARYCOMPONENT);
        this.ComponentTypes = this.getDropDownData(globalconstants.MasterDefinitions[2].employee[0].COMPONENTTYPE);
        this.loading = false;
      });
  }
  GetEmpComponents() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();

    list.fields = [
      "EmpSalaryComponentId",
      "SalaryComponentId",
      "FormulaOrAmount",
      "Deduction",
      "LimitAmount",
      "Active"
    ];

    list.PageName = this.EmpComponentListName;
    list.filter = ["SalaryComponentId eq " + this.searchForm.get("searchComponentId").value + orgIdSearchstr];
    //list.orderBy = "ParentId";
    this.EmpComponentList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        this.EmpComponentList = [...data.value];
        this.dataSource = new MatTableDataSource<IEmpComponent>(this.EmpComponentList);
      })
  }
  addnew(){
    // var newdata ={
    //   "EmpSalaryComponentId":0,
    //   "SalaryComponentId":,
    //   "FormulaOrAmount",
    //   "Deduction",
    //   "LimitAmount",
    //   "Active"
    // }
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
export interface IEmpComponent {
  EmpSalaryComponentId: number;
  SalaryComponentId: number;
  SalaryComponent: string;
  FormulaOrAmount: number;
  Deduction: number;
  LimitAmount: number;
  Active: number;
  Action: boolean;
}