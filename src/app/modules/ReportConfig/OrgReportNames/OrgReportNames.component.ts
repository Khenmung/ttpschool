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
  selector: 'app-OrgReportNames',
  templateUrl: './OrgReportNames.component.html',
  styleUrls: ['./OrgReportNames.component.scss']
})
export class OrgReportNamesComponent implements OnInit {
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
  //StandardFilterWithBatchId = '';
  loading = false;
  rowCount = 0;
  DataToSave = 0;
  SelectedBatchId = 0;
  SelectedApplicationId = 0;
  ReportTypes = [];
  OrgReportNamesListName = "ReportOrgReportNames";
  OrgReportNamesList = [];
  dataSource: MatTableDataSource<IOrgReportNames[]>;
  allMasterData = [];
  PagePermission = '';
  OrgReportNamesData = {
    ReportOrgReportNameId: 0,
    ReportConfigDataId: 0,
    UserReportName: '',
    OrgId: 0,
    UserId: 0,
    Active: 0
  };
  displayedColumns: any[] = [];
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
  ) {

  }

  ngOnInit(): void {
    debugger;
    this.searchForm = this.fb.group({
      searchReportTypeId: [0]
    });
    this.dataSource = new MatTableDataSource<any[]>([]);
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    this.shareddata.CurrentApplicationId.subscribe(b => this.SelectedApplicationId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {

      //this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
      //this.GetMasterData();
      this.GetReportTypes();
    }
  }
  updateActive(row, value) {

    row.Action = true;
    row.Active = value.checked ? 1 : 0;

  }
  addnew() {
    var newdata = {
      ReportOrgReportNameId: 0,
      ReportConfigDataId: this.searchForm.get("searchReportTypeId").value,
      UserReportName: '',
      Active: 0,
      Action: false
    }
    this.OrgReportNamesList.push(newdata);
    this.dataSource = new MatTableDataSource<IOrgReportNames[]>(this.OrgReportNamesList);

  }
  UpdateOrSave(row) {

    debugger;
    if(row.UserReportName.trim().length==0)
    {
      this.alert.error("Please enter report name!",this.optionAutoClose);
      return;
    }
    if(row.ReportConfigDataId==0)
    {
      this.alert.error("Please enter report type!",this.optionAutoClose);
      return;
    }
    

    this.loading = true;
    let checkFilterString = "ReportConfigDataId eq " + row.ReportConfigDataId +
      " and UserReportName eq '" + row.UserReportName + "'";

    if (row.ReportOrgReportNameId > 0)
      checkFilterString += " and ReportOrgReportNameId ne " + row.ReportOrgReportNameId;
    checkFilterString += " and OrgId eq " + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();
    list.fields = ["ReportOrgReportNameId"];
    list.PageName = this.OrgReportNamesListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {

          this.OrgReportNamesData.ReportOrgReportNameId = row.ReportOrgReportNameId;
          this.OrgReportNamesData.ReportConfigDataId = row.ReportConfigDataId;
          this.OrgReportNamesData.UserReportName = row.UserReportName;
          this.OrgReportNamesData.Active = row.Active;
          this.OrgReportNamesData.UserId = this.LoginUserDetail[0]["userId"];
          this.OrgReportNamesData.OrgId = this.LoginUserDetail[0]["orgId"];

          console.log('data', this.OrgReportNamesData);
          if (this.OrgReportNamesData.ReportOrgReportNameId == 0) {
            this.OrgReportNamesData["CreatedDate"] = new Date();
            this.OrgReportNamesData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.OrgReportNamesData["UpdatedDate"] = new Date();
            delete this.OrgReportNamesData["UpdatedBy"];
            //console.log('exam slot', this.SchoolClassPeriodListData)
            this.insert(row);
          }
          else {
            delete this.OrgReportNamesData["CreatedDate"];
            delete this.OrgReportNamesData["CreatedBy"];
            this.OrgReportNamesData["UpdatedDate"] = new Date();
            this.OrgReportNamesData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    debugger;
    this.dataservice.postPatch(this.OrgReportNamesListName, this.OrgReportNamesData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ReportOrgReportNameId = data.ReportOrgReportNameId;
          row.Action = false;
          this.loading = false;
          // this.rowCount++;
          // if (this.rowCount == this.DataToSave) {
          //   this.loading = false;
          //   this.alert.success("Data saved successfully", this.optionAutoClose);
          // }
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.OrgReportNamesListName, this.OrgReportNamesData, this.OrgReportNamesData.ReportOrgReportNameId, 'patch')
      .subscribe(
        (data: any) => {
          //this.loading = false;
          row.Action = false;
          // if (this.rowCount == this.DataToSave) {
          this.loading = false;
          //   this.alert.success("Data saved successfully", this.optionAutoClose);
          // }
          this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }

  GetOrgReportNames() {

    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.OrgReportNamesList = [];
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    var filterstr = 'Active eq 1 ';
    var reportTypeId = this.searchForm.get("searchReportTypeId").value;
    if (reportTypeId == 0) {
      this.alert.info("Please select report type.", this.optionAutoClose);
      return;
    }
    this.loading = true;
    filterstr = 'ReportConfigDataId eq ' + reportTypeId;


    let list: List = new List();
    list.fields = [
      "ReportOrgReportNameId",
      "ReportConfigDataId",
      "UserReportName",
      "UserId",
      "Active"
    ];
    list.PageName = this.OrgReportNamesListName;
    //list.lookupFields = ["SchoolClassPeriod"]
    list.filter = [filterstr + orgIdSearchstr];
    this.displayedColumns = [
      'UserReportName',
      'ReportConfigDataId',
      'Active',
      'Action'
    ];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        this.OrgReportNamesList = data.value.map(d => {
          d.Action = false;
          return d;
        })
        if(this.OrgReportNamesList.length==0)
        {
          this.alert.info("No record found!",this.optionAutoClose)
        }
        this.dataSource = new MatTableDataSource<any>(this.OrgReportNamesList);
        this.loading = false;
      })
  }

  onBlur(element) {
    debugger;

    element.Action = true;
  }
  GetReportTypes() {

    var appId = 'ApplicationId eq ' + this.SelectedApplicationId;

    let list: List = new List();

    list.fields = ["ReportConfigDataId", "ReportName"];
    list.PageName = "ReportConfigDatas";
    list.filter = ["Active eq 1 and " + appId];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ReportTypes = [...data.value];
        this.loading=false;
      })
  }

  // GetMasterData() {

  //   var orgIdSearchstr = 'and (ParentId eq 0  or OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ')';

  //   let list: List = new List();

  //   list.fields = ["MasterDataId", "MasterDataName", "ParentId", "Sequence"];
  //   list.PageName = "MasterDatas";
  //   list.filter = ["Active eq 1 " + orgIdSearchstr];
  //   //list.orderBy = "ParentId";

  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       this.allMasterData = [...data.value];

  //       //this.ReportNames = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
  //       this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
  //       this.shareddata.ChangeBatch(this.Batches);
  //       this.loading = false;
  //       // this.GetClassSubject();
  //       // this.GetAllClassPeriods();
  //     });
  // }

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
export interface IOrgReportNames {
  ReportOrgReportNameId: number;
  ReportConfigDataId: number;
  UserReportName: string;
  OrgId: number;
  UserId: number;
  Active: number;
}




