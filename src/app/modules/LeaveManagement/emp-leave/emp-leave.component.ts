//import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
//import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
//import { IEmpComponent } from '../../EmployeeManagement/employee-salary-component/employee-salary-component.component';

@Component({
  selector: 'app-emp-leave',
  templateUrl: './Emp-leave.component.html',
  styleUrls: ['./Emp-leave.component.scss']
})
export class EmpLeaveComponent implements OnInit {
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
  EmpLeaveListName = 'EmployeeEmpLeaves';
  StandardFilter = '';
  loading = false;
  rowCount = 0;
  EmpLeaveList: IEmpLeave[] = [];
  SelectedBatchId = 0;
  //StoredForUpdate = [];
  //SubjectMarkComponents = [];
  //MarkComponents = [];
  //Emps = [];
  Leaves =[];
  //SalaryComponents = [];
  //ComponentTypes = [];
  //Batches = [];
  dataSource: MatTableDataSource<IEmpLeave>;
  allMasterData = [];

  EmpLeaveData = {
    EmpLeaveId: 0,
    LeaveTypeId: 0,
    NoOfDays: 0,
    OrgId: 0,
    Active: 0
  };
  displayedColumns = [
    "Leave",
    "NoOfDays",
    "Active",
    "Action"
  ];
  searchForm: FormGroup;
  constructor(
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    //private route: ActivatedRoute,
    private nav: Router,
    //private shareddata: SharedataService,
    //private datepipe: DatePipe,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    debugger;
    this.searchForm = this.fb.group({
      searchEmpId: [0],
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
  updateCommonComponent(row, value) {
    debugger;
    row.Action = true;
    row.CommonComponent = value.checked == 1 ? 1 : 0;

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
    let checkFilterString = "LeaveTypeId eq " + row.LeaveTypeId

    if (row.EmpLeaveId > 0)
      checkFilterString += " and EmpLeaveId ne " + row.EmpLeaveId;
    checkFilterString += " and " + this.StandardFilter;

    let list: List = new List();
    list.fields = ["EmpLeaveId"];
    list.PageName = this.EmpLeaveListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {

          this.EmpLeaveData.EmpLeaveId = row.EmpLeaveId;
          this.EmpLeaveData.Active = row.Active;
          this.EmpLeaveData.LeaveTypeId = row.LeaveTypeId;
          this.EmpLeaveData.NoOfDays = row.NoOfDays;
          this.EmpLeaveData.OrgId = this.LoginUserDetail[0]["orgId"];
          console.log('data', this.EmpLeaveData);
          if (this.EmpLeaveData.EmpLeaveId == 0) {
            this.EmpLeaveData["CreatedDate"] = new Date();
            this.EmpLeaveData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EmpLeaveData["UpdatedDate"] = new Date();
            delete this.EmpLeaveData["UpdatedBy"];
            //console.log('exam slot', this.ExamStudentSubjectResultData)
            this.insert(row);
          }
          else {
            delete this.EmpLeaveData["CreatedDate"];
            delete this.EmpLeaveData["CreatedBy"];
            this.EmpLeaveData["UpdatedDate"] = new Date();
            this.EmpLeaveData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    debugger;
    this.dataservice.postPatch(this.EmpLeaveListName, this.EmpLeaveData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EmpLeaveId = data.EmpLeaveId;
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
    this.dataservice.postPatch(this.EmpLeaveListName, this.EmpLeaveData, this.EmpLeaveData.EmpLeaveId, 'patch')
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
  onBlur(element, event) {
    debugger;
    var _colName = event.srcElement.name;
    console.log("event", event);
    //var row = this.StoredForUpdate.filter(s => s.SubjectMarkComponent == _colName && s.StudentClassSubjectId == element.StudentClassSubjectId);
    //row[0][_colName] = element[_colName];
  }

  // UpdateAll() {
  //   this.EmpComponentList.forEach(element => {
  //     this.SaveRow(element);
  //   })
  // }
  SaveRow(element) {
    debugger;
    this.loading = true;
    this.rowCount = 0;

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
        //this.Emps = this.getDropDownData(globalconstants.MasterDefinitions[2].employee[0].Emp);
        this.Leaves = this.getDropDownData(globalconstants.MasterDefinitions[2].employee[0].LEAVE);
        //this.ComponentTypes = this.getDropDownData(globalconstants.MasterDefinitions[2].employee[0].COMPONENTTYPE);
        this.loading = false;
      });
  }
  GetEmpLeave() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();

    list.fields = [
      "EmpLeaveId",
      "EmployeeEmpId",
      "LeaveTypeId",
      "NoOfDays",      
      "Active"
    ];

    list.PageName = this.EmpLeaveListName;
    list.filter = ["LeaveTypeId eq " + this.searchForm.get("searchLeaveId").value + orgIdSearchstr];
    //list.orderBy = "ParentId";
    this.EmpLeaveList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        var existingdata;
        this.Leaves.forEach(s => {
          //var _Emp = this.Emps.filter(g => g.MasterDataId == this.searchForm.get("searchEmpId").value)[0].MasterDataName;
          existingdata = data.value.filter(d => d.LeaveTypeId == s.MasterDataId);
          if (existingdata.length > 0) {
            existingdata[0].Leave = s.MasterDataName;
            this.EmpLeaveList.push(existingdata[0]);
          }
          else {            

            this.EmpLeaveList.push({
              EmpLeaveId: 0,
              EmployeeEmpId:0,
              LeaveTypeId: s.MasterDataId,
              Leave: s.MasterDataName,
              NoOfDays:0,
              Active: 0,
              Action: true
            })

          }
        })

        this.dataSource = new MatTableDataSource<IEmpLeave>(this.EmpLeaveList);
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
export interface IEmpLeave {
  EmpLeaveId: number;
  EmployeeEmpId: number;
  Leave:string;
  LeaveTypeId: number;
  NoOfDays: number;
  Active: number;
  Action: boolean;
}