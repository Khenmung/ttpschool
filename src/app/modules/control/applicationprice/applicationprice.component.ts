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
  selector: 'app-applicationprice',
  templateUrl: './applicationprice.component.html',
  styleUrls: ['./applicationprice.component.scss']
})
export class ApplicationpriceComponent implements OnInit {
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
  Currencies = [];
  ApplicationPriceListName = "ApplicationPrices";
  ApplicationPriceList = [];
  dataSource: MatTableDataSource<IApplicationPrice>;
  allMasterData = [];
  PagePermission = '';
  ApplicationPriceData = {
    ApplicationPriceId: 0,
    ApplicationId: 0,
    PCPM: 0,
    MinCount: 0,
    MinPrice: 0,
    CurrencyId: 0,
    Description: '',
    OrgId: 0,
    Active: 0
  };
  displayedColumns = [
    "ApplicationName",
    "PCPM",
    "MinCount",
    "MinPrice",
    "CurrencyId",
    "Description",
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
    this.dataSource = new MatTableDataSource<IApplicationPrice>([]);
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

  UpdateOrSave(row) {

    // debugger;

    // this.loading = true;
    // let checkFilterString = "ReportName eq '" + row.ReportName + "'" +
    //   " and ApplicationId eq " + row.ApplicationId;

    // if (row.ApplicationPriceId > 0)
    //   checkFilterString += " and ApplicationPriceId ne " + row.ApplicationPriceId;

    // let list: List = new List();
    // list.fields = ["ApplicationPriceId"];
    // list.PageName = this.ApplicationPriceListName;
    // list.filter = [checkFilterString];

    // this.dataservice.get(list)
    //   .subscribe((data: any) => {
    //     debugger;
    //     if (data.value.length > 0) {
    //       this.loading = false;
    //       this.alert.error("Record already exists!", this.optionsNoAutoClose);
    //     }
    //     else {

    this.ApplicationPriceData.ApplicationPriceId = row.ApplicationPriceId;
    this.ApplicationPriceData.ApplicationId = row.ApplicationId;
    this.ApplicationPriceData.MinCount = row.MinCount;
    this.ApplicationPriceData.MinPrice = row.MinPrice;
    this.ApplicationPriceData.CurrencyId = row.CurrencyId;
    this.ApplicationPriceData.Description = row.Description;
    this.ApplicationPriceData.PCPM = row.PCPM;
    this.ApplicationPriceData.Active = row.Active;
    this.ApplicationPriceData.OrgId = row.OrgId;

    console.log('data', this.ApplicationPriceData);
    if (this.ApplicationPriceData.ApplicationPriceId == 0) {
      this.ApplicationPriceData["CreatedDate"] = new Date();
      this.ApplicationPriceData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
      this.ApplicationPriceData["UpdatedDate"] = new Date();
      delete this.ApplicationPriceData["UpdatedBy"];
      //console.log('exam slot', this.SchoolClassPeriodListData)
      this.insert(row);
    }
    else {
      delete this.ApplicationPriceData["CreatedDate"];
      delete this.ApplicationPriceData["CreatedBy"];
      this.ApplicationPriceData["UpdatedDate"] = new Date();
      this.ApplicationPriceData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
      this.update(row);
    }
    //}
    //});
  }

  insert(row) {

    debugger;
    this.dataservice.postPatch(this.ApplicationPriceListName, this.ApplicationPriceData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ApplicationPriceId = data.ApplicationPriceId;
          row.Action = false;
          this.loading = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.ApplicationPriceListName, this.ApplicationPriceData, this.ApplicationPriceData.ApplicationPriceId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }

  GetApplicationPrice() {

    this.ApplicationPriceList = [];
    //var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 ';
    // if (this.searchForm.get("searchApplicationId").value == 0) {
    //   this.alert.info("Please select application", this.optionAutoClose);
    //   return;
    // }

    this.loading = true;
    if (this.searchForm.get("searchApplicationId").value > 0)
      filterstr = "ApplicationId eq " + this.searchForm.get("searchApplicationId").value

    let list: List = new List();
    list.fields = [
      "ApplicationPriceId",
      "ApplicationId",
      "PCPM",
      "MinCount",
      "MinPrice",
      "CurrencyId",
      "Description",
      "OrgId",
      "Active"
    ];
    list.PageName = this.ApplicationPriceListName;
    list.filter = [filterstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //this.ApplicationPriceList = [...data.value];
        this.Applications.forEach(a => {
          var existing = data.value.filter(f => f.ApplicationId == a.MasterDataId);
          if (existing.length > 0) {
            existing[0].Action = false;
            this.ApplicationPriceList.push(existing[0]);
          }
          else {
            this.ApplicationPriceList.push({
              "ApplicationPriceId": 0,
              "ApplicationId": a.ApplicationId,
              "PCPM": 0,
              "MinCount": 0,
              "MinPrice": 0,
              "CurrencyId": 0,
              "Description": '',
              "Active": 0,
              "Action": false
            })
          }
        })

        this.dataSource = new MatTableDataSource<any>(this.ApplicationPriceList);
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
        this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.TTPAPP);
        this.Currencies = this.getDropDownData(globalconstants.MasterDefinitions.admin.CURRENCY);
        
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
export interface IApplicationPrice {
  ApplicationPriceId: number;
  ApplicationId: number;
  PCPM: number;
  MinCount: number;
  MinPrice: number;
  CurrencyId: number;
  Description: string;
  OrgId: number;
  Active: number;

}






