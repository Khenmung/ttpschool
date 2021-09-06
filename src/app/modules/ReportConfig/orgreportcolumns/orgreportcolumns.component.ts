import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-orgreportcolumns',
  templateUrl: './orgreportcolumns.component.html',
  styleUrls: ['./orgreportcolumns.component.scss']
})
export class OrgreportcolumnsComponent implements OnInit {
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
  OrgReportColumnsListName = "ReportOrgReportColumns";
  OrgReportColumnsList = [];
  dataSource: MatTableDataSource<IOrgReportColumns[]>;
  allMasterData = [];
  PagePermission = '';
  OrgReportColumnsData = {
    ReportOrgReportColumnId: 0,
    ReportOrgReportNameId: 0,
    ColumnDisplayName: '',
    FormulaOrColumnName: '',
    Sequence: 0,
    OrgId: 0,
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
      ReportOrgReportColumnId: 0,
      ReportOrgReportNameId: this.searchForm.get("searchReportNameId").value,
      ColumnDisplayName: '',
      FormulaOrColumnName: '',
      Sequence: 0,
      Active: 0,
      Action: false
    }
    this.OrgReportColumnsList.push(newdata);
    this.dataSource = new MatTableDataSource<IOrgReportColumns[]>(this.OrgReportColumnsList);

  }
  UpdateOrSave(row) {

    debugger;
    if (row.UserReportName.trim().length == 0) {
      this.alert.error("Please enter report name!", this.optionAutoClose);
      return;
    }
    if (row.ReportConfigDataId == 0) {
      this.alert.error("Please enter report type!", this.optionAutoClose);
      return;
    }


    this.loading = true;
    let checkFilterString = "ReportConfigDataId eq " + row.ReportConfigDataId +
      " and UserReportName eq '" + row.UserReportName + "'";

    if (row.ReportOrgReportColumnId > 0)
      checkFilterString += " and ReportOrgReportColumnId ne " + row.ReportOrgReportColumnId;
    checkFilterString += " and OrgId eq " + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();
    list.fields = ["ReportOrgReportColumnId"];
    list.PageName = this.OrgReportColumnsListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {


          this.OrgReportColumnsData.ReportOrgReportColumnId = row.ReportOrgReportColumnId;
          this.OrgReportColumnsData.ReportOrgReportNameId = row.ReportOrgReportNameId;
          this.OrgReportColumnsData.ColumnDisplayName = row.ColumnDisplayName;
          this.OrgReportColumnsData.FormulaOrColumnName = row.FormulaOrColumnName;
          this.OrgReportColumnsData.Sequence = row.Sequence;
          this.OrgReportColumnsData.Active = row.Active;
          this.OrgReportColumnsData.OrgId = this.LoginUserDetail[0]["orgId"];

          console.log('data', this.OrgReportColumnsData);
          if (this.OrgReportColumnsData.ReportOrgReportColumnId == 0) {
            this.OrgReportColumnsData["CreatedDate"] = new Date();
            this.OrgReportColumnsData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.OrgReportColumnsData["UpdatedDate"] = new Date();
            delete this.OrgReportColumnsData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.OrgReportColumnsData["CreatedDate"];
            delete this.OrgReportColumnsData["CreatedBy"];
            this.OrgReportColumnsData["UpdatedDate"] = new Date();
            this.OrgReportColumnsData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    debugger;
    this.dataservice.postPatch(this.OrgReportColumnsListName, this.OrgReportColumnsData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ReportOrgReportColumnId = data.ReportOrgReportColumnId;
          row.Action = false;
          this.loading = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.OrgReportColumnsListName, this.OrgReportColumnsData, this.OrgReportColumnsData.ReportOrgReportColumnId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.loading = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }

  GetOrgReportColumns() {

    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.OrgReportColumnsList = [];
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    var filterstr = 'Active eq 1 ';
    var reportTypeId = this.searchForm.get("searchReportTypeId").value;
    var reportNameId = this.searchForm.get("searchReportNameId").value;
    if (reportTypeId == 0) {
      this.alert.info("Please select report type.", this.optionAutoClose);
      return;
    }
    if (reportNameId == 0) {
      this.alert.info("Please select report name.", this.optionAutoClose);
      return;
    }

    this.loading = true;
    filterstr = 'ReportConfigDataId eq ' + reportTypeId;


    let list: List = new List();
    list.fields = [
      "ReportOrgReportColumnId",
      "ReportOrgReportNameId",
      "ColumnDisplayName",
      "FormulaOrColumnName",
      "Sequence",
      "Active",
    ];
    list.PageName = this.OrgReportColumnsListName;
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
        this.OrgReportColumnsList = data.value.map(d => {
          d.Action = false;
          return d;
        })
        if (this.OrgReportColumnsList.length == 0) {
          this.alert.info("No record found!", this.optionAutoClose)
        }
        this.dataSource = new MatTableDataSource<any>(this.OrgReportColumnsList);
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
        this.loading = false;
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
export interface IOrgReportColumns {
  ReportOrgReportColumnId: number;
  ReportOrgReportNameId: number;
  ColumnDisplayName: string;
  FormulaOrColumnName: string;
  Sequence: number;
  Active: number;
}


