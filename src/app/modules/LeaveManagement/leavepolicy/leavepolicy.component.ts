import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { evaluate } from 'mathjs';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { IEmployee } from '../../EmployeeManagement/employee-gradehistory/employee-gradehistory.component';

@Component({
  selector: 'app-leavepolicy',
  templateUrl: './leavepolicy.component.html',
  styleUrls: ['./leavepolicy.component.scss']
})
export class LeavepolicyComponent implements OnInit {
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
  LeavePolicyListName = 'LeavePolicies';
  StandardFilter = '';
  loading = false;
  rowCount = 0;
  LeavePolicies = [];
  RawLeavePolicy = [];
  LeavePolicyList: any[] = [];
  SelectedBatchId = 0;
  StoredForUpdate = [];
  Leaves = [];

  OpenAdjustCloseLeaves = [];
  DropDownMonths = [];
  Employees = [];
  filteredOptions: Observable<IEmployee[]>;
  dataSource: MatTableDataSource<ILeavePolicy>;
  allMasterData = [];

  LeavePolicyData = {
    LeavePolicyId: 0,
    LeaveNameId: 0,
    LeaveOpenAdjustCloseId: 0,
    FormulaOrDays: '',
    BatchId: 0,
    OrgId: 0,
    Active: 0
  };
  displayedColumns = [
    "Leave",
    "LeaveType",
    "FormulaOrDays",
    "Active",
    "Action"
  ];
  searchForm: FormGroup;
  constructor(
    private shareddata: SharedataService,
    private contentService: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private nav: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    //debugger;
    // this.searchForm = this.fb.group({
    //   searchEmployee: [0]
    // });
    //this.PageLoad();
    // this.filteredOptions = this.searchForm.get("searchEmployee").valueChanges
    //   .pipe(
    //     startWith(''),
    //     map(value => typeof value === 'string' ? value : value.Name),
    //     map(Name => Name ? this._filter(Name) : this.Employees.slice())
    //   );

    // this.DropDownMonths = this.GetSessionFormattedMonths();

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
      this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
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
          this.alert.success("Data deleted successfully.", this.optionAutoClose);

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

      if (b.length != 0) {
        _sessionStartEnd = { ...b };
        console.log('b', b)
        var _Year = new Date(_sessionStartEnd.StartDate).getFullYear();
        var startMonth = new Date(_sessionStartEnd.StartDate).getMonth();

        for (var month = 0; month < 12; month++, startMonth++) {
          monthArray.push({
            MonthName: Months[startMonth] + " " + _Year,
            val: _Year + startMonth.toString().padStart(2, "0")
          })
          if (startMonth == 11) {
            startMonth = -1;
            _Year++;
          }
        }
      }
    });
    //console.log('monthArray', monthArray);
    //}, 3000);
    return monthArray;
  }
  UpdateOrSave(row) {

    //debugger;

    this.loading = true;
    let checkFilterString = "LeaveNameId eq " + row.LeaveNameId +
      " and LeaveOpenAdjustCloseId eq " + row.LeaveOpenAdjustCloseId

    if (row.LeavePolicyId > 0)
      checkFilterString += " and LeavePolicyId ne " + row.LeavePolicyId;
    checkFilterString += " and " + this.StandardFilter;

    let list: List = new List();
    list.fields = ["LeavePolicyId"];
    list.PageName = this.LeavePolicyListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {

          this.LeavePolicyData.LeavePolicyId = row.LeavePolicyId;
          this.LeavePolicyData.LeaveNameId = row.LeaveNameId;
          this.LeavePolicyData.LeaveOpenAdjustCloseId = row.LeaveOpenAdjustCloseId;
          this.LeavePolicyData.FormulaOrDays = row.FormulaOrDays;
          this.LeavePolicyData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.LeavePolicyData.BatchId = this.SelectedBatchId;
          this.LeavePolicyData.Active = row.Active;

          console.log('data', this.LeavePolicyData);
          if (this.LeavePolicyData.LeavePolicyId == 0) {
            this.LeavePolicyData["CreatedDate"] = new Date();
            this.LeavePolicyData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.LeavePolicyData["UpdatedDate"] = new Date();
            delete this.LeavePolicyData["UpdatedBy"];
            //console.log('exam slot', this.ExamStudentSubjectResultData)
            this.insert(row);
          }
          else {
            delete this.LeavePolicyData["CreatedDate"];
            delete this.LeavePolicyData["CreatedBy"];
            this.LeavePolicyData["UpdatedDate"] = new Date();
            this.LeavePolicyData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.LeavePolicyListName, this.LeavePolicyData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.LeavePolicyId = data.LeavePolicyId;
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
    //console.log("this.EmpComponentData", this.EmpComponentData);
    this.dataservice.postPatch(this.LeavePolicyListName, this.LeavePolicyData, this.LeavePolicyData.LeavePolicyId, 'patch')
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
  onBlur(element) {
    element.Action =true;
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

    var orgIdSearchstr = 'and (ParentId eq 0  or OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ')';

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "Description", "ParentId", "Sequence"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        this.allMasterData = [...data.value];
        this.OpenAdjustCloseLeaves = this.getDropDownData(globalconstants.MasterDefinitions.leave.OPENADJUSTCLOSE);
        this.OpenAdjustCloseLeaves.sort((a, b) => a.Sequence - b.Sequence);
        this.Leaves = this.getDropDownData(globalconstants.MasterDefinitions.leave.LEAVE);
        this.Leaves.sort((a, b) => a.Sequence - b.Sequence);

        //this.GetEmployees();
        this.GetLeavePolicy();
      });
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
        //console.log("employeeid", this.searchForm.get("searchEmployee").value.EmployeeId)
        //this.GetGradeComponents();
      })

  }
  GetLeavePolicy() {

    var orgIdSearchstr = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);// 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    //var _employeeId = 0;
    //var EmployeeFilter = '';
    // if (this.searchForm.get("searchEmployee").value.length > 0) {
    //   _employeeId = this.searchForm.get("searchEmployee").value.EmployeeId;
    //   EmployeeFilter = " and EmployeeId eq " + _employeeId;
    // }
    let list: List = new List();

    list.fields = [
      "LeavePolicyId",
      "LeaveNameId",
      "LeaveOpenAdjustCloseId",
      "FormulaOrDays",
      "Active"
    ];

    list.PageName = this.LeavePolicyListName;
    list.filter = [orgIdSearchstr];
    //list.orderBy = "ParentId";
    this.LeavePolicyList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.OpenAdjustCloseLeaves.forEach(o => {
          this.Leaves.forEach(l => {
            var existing = data.value.filter(d => d.LeaveOpenAdjustCloseId == o.MasterDataId && d.LeaveNameId == l.MasterDataId);
            if (existing.length > 0) {
              existing[0].Action = false;
              existing[0].Leave = l.MasterDataName;
              existing[0].LeaveType = o.MasterDataName;

              this.LeavePolicyList.push(existing[0]);
            }
            else
              this.LeavePolicyList.push({
                "LeavePolicyId": 0,
                "LeaveNameId": l.MasterDataId,
                "Leave":l.MasterDataName,
                "LeaveOpenAdjustCloseId": o.MasterDataId, 
                "LeaveType":o.MasterDataName,               
                "FormulaOrDays": '',
                "Active": 0,
                "Action": false
              })
          })
        })
        console.log('LeavePolicyList',this.LeavePolicyList);

        this.loading=false;
        this.dataSource = new MatTableDataSource<ILeavePolicy>(this.LeavePolicyList);
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
export interface ILeavePolicy {
  LeavePolicyId: number;
  LeaveNameId: number;
  LeaveOpenAdjustCloseId: number;
  FormulaOrDays: number;
  Active: number;
  Action: boolean;
}
