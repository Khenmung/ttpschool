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
  selector: 'app-reportconfigdata',
  templateUrl: './reportconfigdata.component.html',
  styleUrls: ['./reportconfigdata.component.scss']
})
export class ReportconfigdataComponent implements OnInit {
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
  StandardFilterWithBatchId = '';
  loading = false;
  Applications = [];
  ReportNames = [];
  ReportConfigDataListName = "ReportConfigDatas";
  ReportConfigDataList = [];
  dataSource: MatTableDataSource<IReportConfigData>;
  allMasterData = [];
  PagePermission = '';
  ReportConfigDataData = {
    ReportConfigDataId: 0,
    ReportName: 0,
    AvailableFields: '',
    ApplicationId: 0,
    TableNames: '',
    Active: 0
  };
  displayedColumns = [
    "ReportName",
    "AvailableFields",
    "TableNames",
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
  ) {

  }

  ngOnInit(): void {
    debugger;
    this.searchForm = this.fb.group({
      searchApplicationId: [0],
      searchReportName: ['']
    });
    this.dataSource = new MatTableDataSource<IReportConfigData>([]);
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {

      this.GetMasterData();

    }
  }
  updateActive(row, value) {

    row.Action = true;
    row.Active = value.checked ? 1 : 0;

  }
  addnew() {
    var appId = this.searchForm.get("searchApplicationId").value;
    if(appId==0)
    {
      this.alert.error("Please select application",this.optionAutoClose);
      return;
    }

    var newdata = {
      ReportConfigDataId: 0,
      ReportName: '',
      AvailableFields: '',
      ApplicationId: appId,
      TableNames: '',
      Active: 0,
      Action: false
    }
    this.ReportConfigDataList.push(newdata);
    this.dataSource = new MatTableDataSource<IReportConfigData>(this.ReportConfigDataList);

  }
  UpdateOrSave(row) {

    debugger;

    this.loading = true;
    let checkFilterString = "ReportName eq '" + row.ReportName + "'" +
      " and ApplicationId eq " + row.ApplicationId;

    if (row.ReportConfigDataId > 0)
      checkFilterString += " and ReportConfigDataId ne " + row.ReportConfigDataId;
    
    let list: List = new List();
    list.fields = ["ReportConfigDataId"];
    list.PageName = this.ReportConfigDataListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {

          this.ReportConfigDataData.ReportConfigDataId = row.ReportConfigDataId;
          this.ReportConfigDataData.ApplicationId = row.ApplicationId;
          this.ReportConfigDataData.AvailableFields = row.AvailableFields;
          this.ReportConfigDataData.Active = row.Active;
          this.ReportConfigDataData.ReportName = row.ReportName;
          this.ReportConfigDataData.TableNames = row.TableNames;

          console.log('data', this.ReportConfigDataData);
          if (this.ReportConfigDataData.ReportConfigDataId == 0) {
            this.ReportConfigDataData["CreatedDate"] = new Date();
            this.ReportConfigDataData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ReportConfigDataData["UpdatedDate"] = new Date();
            delete this.ReportConfigDataData["UpdatedBy"];
            //console.log('exam slot', this.SchoolClassPeriodListData)
            this.insert(row);
          }
          else {
            delete this.ReportConfigDataData["CreatedDate"];
            delete this.ReportConfigDataData["CreatedBy"];
            this.ReportConfigDataData["UpdatedDate"] = new Date();
            this.ReportConfigDataData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    debugger;
    this.dataservice.postPatch(this.ReportConfigDataListName, this.ReportConfigDataData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ReportConfigDataId = data.ReportConfigDataId;
          row.Action = false;
          this.loading = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.ReportConfigDataListName, this.ReportConfigDataData, this.ReportConfigDataData.ReportConfigDataId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }

  GetReportConfigData() {

    this.ReportConfigDataList = [];
    //var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 ';
    if (this.searchForm.get("searchApplicationId").value == 0) {
      this.alert.info("Please select application", this.optionAutoClose);
      return;
    }

    this.loading = true;
    filterstr = "ApplicationId eq " + this.searchForm.get("searchApplicationId").value
    if (this.searchForm.get("searchReportName").value.length > 0)
      filterstr += " and substringof('" + this.searchForm.get("searchReportName").value + "',ReportName)";

    let list: List = new List();
    list.fields = [
      "ReportConfigDataId",
      "ReportName",
      "AvailableFields",
      "ApplicationId",
      "TableNames",
      "Active"
    ];
    list.PageName = this.ReportConfigDataListName;
    //list.lookupFields = ["SchoolClassPeriod"]
    list.filter = [filterstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ReportConfigDataList = data.value.map(d => {
          d.Action = false;
          return d;
        })

        this.dataSource = new MatTableDataSource<any>(this.ReportConfigDataList);
        this.loading = false;
      })
  }


  onBlur(element) {
    element.Action = true;
  }

  GetMasterData() {

    var orgIdSearchstr = 'and (ParentId eq 0  or OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ')';

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "Description", "ParentId", "Sequence"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.bang);
        // this.PeriodTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.PERIODTYPE);
        // this.WeekDays = this.getDropDownData(globalconstants.MasterDefinitions.school.WEEKDAYS);

        // this.Classes = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASS);
        // this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
        // this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        // this.shareddata.ChangeBatch(this.Batches);
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
export interface IReportConfigData {
  ReportConfigDataId: number;
  ReportName: string;
  AvailableFields: string;
  ApplicationId: number;
  TableNames: string;
  Active: number;
}





