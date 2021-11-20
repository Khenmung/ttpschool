import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-workhistory',
  templateUrl: './workhistory.component.html',
  styleUrls: ['./workhistory.component.scss']
})
export class WorkhistoryComponent implements OnInit {

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
  EmployeeWorkHistoryListName = 'EmpWorkHistories';
  Applications = [];
  loading = false;
  SelectedBatchId = 0;
  EmployeeWorkHistoryList: IWorkHistory[] = [];
  filteredOptions: Observable<IWorkHistory[]>;
  dataSource: MatTableDataSource<IWorkHistory>;
  allMasterData = [];
  EmployeeWorkHistory = [];
  Permission = 'deny';
  EmployeeId = 0;
  EmployeeWorkHistoryData = {
    EmpWorkHistoryId: 0,
    OrganizationName: '',
    Designation: '',
    Responsibility: '',
    EmployeeId:0,
    FromDate: new Date(),
    ToDate: new Date(),
    Active: 1,
    OrgId: 0,
  };
  displayedColumns = [
    "EmpWorkHistoryId",
    "OrganizationName",
    "Designation",
    "Responsibility",
    "FromDate",
    "ToDate",
    "Active",
    "Action"
  ];
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
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
      searchClassName: [0]
    });
    this.PageLoad();
  }

  PageLoad() {

    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    this.EmployeeId = +this.tokenstorage.getEmployeeId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.emp.employee.WORKHISTORY)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {

        //this.nav.navigate(['/edu'])
      }
      else {

        this.GetEmployeeWorkHistory();
      }
    }
  }

  AddNew() {

    var newdata = {
      EmpWorkHistoryId: 0,
      OrganizationName: '',
      Designation: '',
      Responsibility: '',
      FromDate: new Date(),
      ToDate: new Date(),
      Active: 0,
      Action: false
    };
    this.EmployeeWorkHistoryList = [];
    this.EmployeeWorkHistoryList.push(newdata);
    this.dataSource = new MatTableDataSource<IWorkHistory>(this.EmployeeWorkHistoryList);
  }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {
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

          this.alert.success("Data deleted successfully.", this.optionAutoClose);

        });
  }
  UpdateOrSave(row) {

    //debugger;
    this.loading = true;
    let checkFilterString = "OrganizationName eq '" + row.OrganizationName + "' and EmployeeId eq " + this.EmployeeId

    if (row.EmpWorkHistoryId > 0)
      checkFilterString += " and EmpWorkHistoryId ne " + row.EmpWorkHistoryId;
    let list: List = new List();
    list.fields = ["EmpWorkHistoryId"];
    list.PageName = this.EmployeeWorkHistoryListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {

          this.EmployeeWorkHistoryData.EmpWorkHistoryId = row.EmpWorkHistoryId;
          this.EmployeeWorkHistoryData.Active = row.Active;
          this.EmployeeWorkHistoryData.OrganizationName = row.OrganizationName;
          this.EmployeeWorkHistoryData.EmployeeId = this.EmployeeId;
          this.EmployeeWorkHistoryData.Designation = row.Designation;
          this.EmployeeWorkHistoryData.Responsibility = row.Responsibility;
          this.EmployeeWorkHistoryData.FromDate = row.FromDate;
          this.EmployeeWorkHistoryData.ToDate = row.ToDate;
          this.EmployeeWorkHistoryData.OrgId = this.LoginUserDetail[0]["orgId"];

          if (this.EmployeeWorkHistoryData.EmpWorkHistoryId == 0) {
            this.EmployeeWorkHistoryData["CreatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            this.EmployeeWorkHistoryData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EmployeeWorkHistoryData["UpdatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            delete this.EmployeeWorkHistoryData["UpdatedBy"];
            console.log('this.EmployeeWorkHistoryData', this.EmployeeWorkHistoryData)
            this.insert(row);
          }
          else {
            delete this.EmployeeWorkHistoryData["CreatedDate"];
            delete this.EmployeeWorkHistoryData["CreatedBy"];
            this.EmployeeWorkHistoryData["UpdatedDate"] = new Date();
            this.EmployeeWorkHistoryData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false;
  }
  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.EmployeeWorkHistoryListName, this.EmployeeWorkHistoryData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EmpWorkHistoryId = data.EmpWorkHistoryId;
          row.Action = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.EmployeeWorkHistoryListName, this.EmployeeWorkHistoryData, this.EmployeeWorkHistoryData.EmpWorkHistoryId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
          this.loadingFalse();
        });
  }
  GetEmployeeWorkHistory() {
    debugger;

    this.loading = true;
    let filterStr = 'EmployeeId eq ' + this.EmployeeId

    let list: List = new List();
    list.fields = ["*"];

    list.PageName = this.EmployeeWorkHistoryListName;
    list.filter = [filterStr];
    this.EmployeeWorkHistoryList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.EmployeeWorkHistoryList = [...data.value];
        }
        this.dataSource = new MatTableDataSource<IWorkHistory>(this.EmployeeWorkHistoryList);
        this.loadingFalse();
      });

  }

  GetMasterData() {

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId", "Description"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 and (ParentId eq 0 or OrgId eq " + this.LoginUserDetail[0]["orgId"] + ")"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        //this.FamilyRelationship = this.getDropDownData(globalconstants.MasterDefinitions.employee.FAMILYRELATIONSHIP);
        this.EmployeeWorkHistory = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEESKILL);
        this.GetEmployeeWorkHistory();
        this.loading = false;
      });
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
export interface IWorkHistory {
  EmpWorkHistoryId: number;
  OrganizationName: string;
  Designation: string;
  Responsibility: string;
  FromDate: Date;
  ToDate: Date;
  Active: number;
  Action: boolean;
}

