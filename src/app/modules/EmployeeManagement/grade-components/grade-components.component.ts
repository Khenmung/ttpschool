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
  selector: 'app-grade-components',
  templateUrl: './grade-components.component.html',
  styleUrls: ['./grade-components.component.scss']
})
export class GradeComponentsComponent implements OnInit {
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
  GradeComponentList: IGradeComponent[] = [];
  SelectedBatchId = 0;
  StoredForUpdate = [];
  //SubjectMarkComponents = [];
  //MarkComponents = [];
  Grades = [];
  SalaryComponents = [];
  ComponentTypes = [];
  Batches = [];
  dataSource: MatTableDataSource<IGradeComponent>;
  allMasterData = [];

  ExamId = 0;
  GradeComponentData = {
    EmpGradeSalaryComponentId: 0,
    EmpGradeId: 0,
    SalaryComponentId: 0,
    PercentOfBasicOrAmount: 0,
    ComponentTypeId: 0,
    OrgId: 0,
    Active: 0
  };
  displayedColumns = [
    "SalaryComponent",
    "PercentOfBasicOrAmount",
    "ComponentTypeId",
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
      searchGradeId: [0],
    });
    this.PageLoad();
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
    let checkFilterString = "EmpGradeId eq " + this.searchForm.get("searchGradeId").value +
      " and SalaryComponentId eq " + row.SalaryComponentId


    if (row.EmpGradeSalaryComponentId > 0)
      checkFilterString += " and EmpGradeSalaryComponentId ne " + row.EmpGradeSalaryComponentId;
    checkFilterString += " and " + this.StandardFilter;

    let list: List = new List();
    list.fields = ["EmpGradeSalaryComponentId"];
    list.PageName = "EmpGradeComponents";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {

          this.GradeComponentData.EmpGradeSalaryComponentId = row.EmpGradeSalaryComponentId;
          this.GradeComponentData.EmpGradeId = this.searchForm.get("searchGradeId").value;
          this.GradeComponentData.Active = row.Active;
          this.GradeComponentData.SalaryComponentId = row.SalaryComponentId;
          this.GradeComponentData.ComponentTypeId = row.ComponentTypeId;
          this.GradeComponentData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.GradeComponentData.PercentOfBasicOrAmount = row.PercentOfBasicOrAmount;
          //console.log('data', this.ClassSubjectData);
          if (this.GradeComponentData.EmpGradeSalaryComponentId == 0) {
            this.GradeComponentData["CreatedDate"] = new Date();
            this.GradeComponentData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.GradeComponentData["UpdatedDate"] = new Date();
            delete this.GradeComponentData["UpdatedBy"];
            //console.log('exam slot', this.ExamStudentSubjectResultData)
            this.insert(row);
          }
          else {
            delete this.GradeComponentData["CreatedDate"];
            delete this.GradeComponentData["CreatedBy"];
            this.GradeComponentData["UpdatedDate"] = new Date();
            this.GradeComponentData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    debugger;
    this.dataservice.postPatch('EmpGradeComponents', this.GradeComponentData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EmpGradeSalaryComponentId = data.EmpGradeSalaryComponentId;
          this.loading = false;
          this.rowCount++;
          if (this.rowCount == this.displayedColumns.length - 2) {
            this.loading = false;
            this.alert.success("Data saved successfully", this.optionAutoClose);
          }
          //this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update(row) {

    this.dataservice.postPatch('EmpGradeComponents', this.GradeComponentData, this.GradeComponentData.EmpGradeSalaryComponentId, 'patch')
      .subscribe(
        (data: any) => {
          //this.loading = false;
          this.rowCount++;
          if (this.rowCount == this.displayedColumns.length - 2) {
            this.loading = false;
            this.alert.success("Data saved successfully", this.optionAutoClose);
          }
          //this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }

  checkall(value) {
    this.GradeComponentList.forEach(record => {
      if (value.checked)
        record.Active = 1;
      else
        record.Active = 0;
      record.Action = !record.Action;
    })
  }
  saveall() {
    this.GradeComponentList.forEach(record => {
      if (record.Action == true) {
        this.UpdateOrSave(record);
      }
    })
  }
  onBlur(element, event) {
    debugger;
    var _colName = event.srcElement.name;
    console.log("event", event);
    var row = this.StoredForUpdate.filter(s => s.SubjectMarkComponent == _colName && s.StudentClassSubjectId == element.StudentClassSubjectId);
    row[0][_colName] = element[_colName];
  }

  UpdateAll() {
    this.GradeComponentList.forEach(element => {
      this.SaveRow(element);
    })
  }
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
        this.loading = false;
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
    list.filter = ["Active eq 1 and EmpGradeId eq " + this.searchForm.get("searchGradeId").value + orgIdSearchstr];
    //list.orderBy = "ParentId";
    this.GradeComponentList =[];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        var existingdata;
        this.SalaryComponents.forEach(s => {

          existingdata = data.value.filter(d => d.SalaryComponentId == s.MasterDataId);
          if (existingdata.length > 0) {
            existingdata[0].Grade = this.Grades.filter(g => g.MasterDataId == existingdata[0].EmpGradeId)[0].MasterDataName;
            existingdata[0].SalaryComponent = s.MasterDataName;
            this.GradeComponentList.push(existingdata[0]);
          }
          else {
            var _grade = this.Grades.filter(g => g.MasterDataId == this.searchForm.get("searchGradeId").value)[0].MasterDataName;
            
            this.GradeComponentList.push({
              EmpGradeSalaryComponentId: 0,
              EmpGradeId: this.searchForm.get("searchGradeId").value,
              SalaryComponentId: s.MasterDataId,
              SalaryComponent:s.MasterDataName,
              PercentOfBasicOrAmount: 0,
              ComponentTypeId: 0,
              Active: 0,
              Action: true
            })

          }
        })

        this.dataSource = new MatTableDataSource<IGradeComponent>(this.GradeComponentList);
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
export interface IGradeComponent {
  EmpGradeSalaryComponentId: number;
  EmpGradeId: number;
  SalaryComponentId: number;
  SalaryComponent:string;
  PercentOfBasicOrAmount: number;
  ComponentTypeId: number;
  Active: number;
  Action: boolean;
}