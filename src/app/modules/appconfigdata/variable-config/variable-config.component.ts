import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { evaluate } from 'mathjs';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-variable-config',
  templateUrl: './variable-config.component.html',
  styleUrls: ['./variable-config.component.scss']
})
export class VariableConfigComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('varPaginator') paginator: MatPaginator;

  ListName = 'VariableConfigurations';
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
  allMasterData = [];
  StandardFilter = '';
  loading = false;
  rowCount = 0;
  filteredOptions: Observable<IVariableConfig[]>;
  VariableConfig = [];
  ConfigTypes = [];
  VariableConfigList: IVariableConfig[] = [];
  dataSource: MatTableDataSource<IVariableConfig>;
  VariableConfigData = {
    VariableConfigurationId: 0,
    VariableName: '',
    VariableTypeId: 0,
    VariableDescription: '',
    VariableAmount: '',
    VariableFormula: '',
    Active: 0,
    DisplayOrder: 0,
    OrgId: 0,
  };
  displayedColumns = [
    "VariableName",
    "VariableDescription",
    "VariableFormula",
    "DisplayOrder",
    "VariableAmount",
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
    //debugger;
    this.searchForm = this.fb.group({
      searchVariableName: [''],
      searchTypeId: [0]
    });
    this.PageLoad();
    this.filteredOptions = this.searchForm.get("searchVariableName").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.VariableName),
        map(Name => Name ? this._filter(Name) : this.VariableConfig.slice())
      );

  }
  private _filter(name: string): IVariableConfig[] {

    const filterValue = name.toLowerCase();
    return this.VariableConfig.filter(option => option.VariableName.toLowerCase().includes(filterValue));

  }
  displayFn(varconfig: IVariableConfig): string {
    return varconfig && varconfig.VariableName ? varconfig.VariableName : '';
  }
  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
      this.GetMasterData();
      //      this.GetVariables();
    }
  }
  addnew() {
    var newdata = {
      VariableConfigurationId: 0,
      VariableName: 'edit me..',
      VariableDescription: 'edit me..',
      VariableAmount: '0',
      VariableFormula: '',
      Active: 0,
      DisplayOrder: 0,
      Action: true,
    }
    this.VariableConfigList = [];
    this.VariableConfigList.push(newdata);
    this.dataSource = new MatTableDataSource<IVariableConfig>(this.VariableConfigList);
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
  UpdateOrSave(row) {

    //debugger;

    this.loading = true;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    let checkFilterString = "VariableName eq '" + row.VariableName + "'";

    if (row.VariableConfigurationId > 0)
      checkFilterString += " and VariableConfigurationId ne " + row.VariableConfigurationId;
    checkFilterString += " and " + this.StandardFilter;

    let list: List = new List();
    list.fields = ["VariableConfigurationId"];
    list.PageName = this.ListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {

          this.VariableConfigData.VariableConfigurationId = row.VariableConfigurationId;
          this.VariableConfigData.VariableName = row.VariableName;
          this.VariableConfigData.VariableAmount = row.VariableAmount.toString();
          this.VariableConfigData.Active = row.Active;
          this.VariableConfigData.VariableDescription = row.VariableDescription;
          this.VariableConfigData.VariableTypeId = this.searchForm.get("searchTypeId").value;
          this.VariableConfigData.DisplayOrder = row.DisplayOrder;
          this.VariableConfigData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.VariableConfigData.VariableFormula = row.VariableFormula;
          console.log('data', this.VariableConfigData);
          if (this.VariableConfigData.VariableConfigurationId == 0) {
            this.VariableConfigData["CreatedDate"] = new Date();
            this.VariableConfigData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.VariableConfigData["UpdatedDate"] = new Date();
            delete this.VariableConfigData["UpdatedBy"];
            //console.log('exam slot', this.ExamStudentSubjectResultData)
            this.insert(row);
          }
          else {
            delete this.VariableConfigData["CreatedDate"];
            delete this.VariableConfigData["CreatedBy"];
            this.VariableConfigData["UpdatedDate"] = new Date();
            this.VariableConfigData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.ListName, this.VariableConfigData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.VariableConfigurationId = data.VariableConfigurationId;
          this.loading = false;
          row.Action = false;
          // this.rowCount++;
          // if (this.rowCount == this.displayedColumns.length - 2) {
          //   this.loading = false;
          //   this.alert.success("Data saved successfully", this.optionAutoClose);
          // }
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        }),
      this.loading = false;
    console.error();
    ;
    ;
  }
  update(row) {
    console.log("this.GradeComponentData", this.VariableConfigData);
    this.dataservice.postPatch(this.ListName, this.VariableConfigData, this.VariableConfigData.VariableConfigurationId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.Action = false;
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
    //debugger;
    var _colName = event.srcElement.name;
    var formula = element["VariableFormula"];
    //console.log("event", _colName);
    //var _amount = percentage ? + this.BasicSalary * (element["ActualFormulaOrAmount"] / 100) : element["ActualFormulaOrAmount"];
    this.VariableConfig.forEach(f => {
      if (formula.includes(f.VariableName))
        formula = formula.replace(f.VariableName, f.VariableAmount);
    })
    //console.log('evaluate',min(100,20,10));
    element["VariableAmount"] = evaluate(formula);//_amount;
    //console.log("event", event);
    element.Action = true;
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
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.ConfigTypes = this.getDropDownData(globalconstants.MasterDefinitions.employee.CONFIGTYPE);
        // this.Grades = this.getDropDownData(globalconstants.MasterDefinitions.employee.GRADE);
        // this.SalaryComponents = this.getDropDownData(globalconstants.MasterDefinitions.employee.SALARYCOMPONENT);
        // this.ComponentTypes = this.getDropDownData(globalconstants.MasterDefinitions.employee.COMPONENTTYPE);
        //this.loading = false;
        this.GetVariables();
      });
  }
  GetVariableConfigs() {

    var orgIdSearchstr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    var filter = '';
    if (this.searchForm.get("searchTypeId").value > 0)
      filter += ' and VariableTypeId eq ' + this.searchForm.get("searchTypeId").value;
    else {
      this.alert.info("Please select type", this.optionAutoClose);
      return;
    }
    
    if (this.searchForm.get("searchVariableName").value.VariableConfigurationId > 0)
      " and VariableName eq '" + this.searchForm.get("searchVariableName").value.VariableName + "'";


    let list: List = new List();

    list.fields = [
      "VariableConfigurationId",
      "VariableName",
      "VariableDescription",
      "VariableAmount",
      "VariableFormula",
      "VariableTypeId",
      "Active",
      "DisplayOrder",

    ];

    list.PageName = this.ListName;
    list.filter = [orgIdSearchstr + filter];
    //list.orderBy = "ParentId";
    this.VariableConfigList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        data.value.forEach(f => {
          f.Action = false;
        })
        this.VariableConfigList = [...data.value];
        this.dataSource = new MatTableDataSource<IVariableConfig>(this.VariableConfigList);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      })
  }
  GetVariables() {

    var orgIdSearchstr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    let list: List = new List();

    list.fields = [
      "VariableConfigurationId",
      "VariableName",
      "VariableDescription",
      "VariableAmount",
      "VariableFormula",
      "VariableTypeId",
      "Active",
      "DisplayOrder",

    ];

    list.PageName = this.ListName;
    list.filter = [orgIdSearchstr];
    //list.orderBy = "ParentId";
    this.VariableConfigList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        this.VariableConfig = [...data.value];
        this.loading = false;
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
export interface IVariableConfig {
  VariableConfigurationId: number;
  VariableName: string;
  VariableDescription: string;
  VariableAmount: string;
  VariableFormula: string;
  Active: number;
  DisplayOrder: number;
  Action: boolean;
}
