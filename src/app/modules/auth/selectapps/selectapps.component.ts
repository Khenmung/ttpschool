import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { evaluate } from 'mathjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-selectapps',
  templateUrl: './selectapps.component.html',
  styleUrls: ['./selectapps.component.scss']
})
export class SelectappsComponent implements OnInit {
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
  ToUpdateCount = -1;
  TotalAmount = 0;
  Organizations = [];
  Currencies = [];
  CustomerAppsListName = "CustomerApps";
  CustomerAppsList = [];
  ApplicationPricing = [];
  dataSource: MatTableDataSource<ICustomerApps>;
  allMasterData = [];
  PagePermission = '';
  CustomerAppsData = {
    CustomerAppsId: 0,
    ApplicationPriceId: 0,
    LoginUserCount: 0,
    PersonOrItemCount: 0,
    Formula: '',
    AmountPerMonth: 0,
    OrgId: 0,
    Active: 0,
  };

  displayedColumns = [
    "ApplicationName",
    "PCPM",
    "MinCount",
    "MinPrice",
    //"LoginUserCount",
    "PersonOrItemCount",
    //"Formula",
    "AmountPerMonth",
    "Currency",
    "Active"
  ];
  searchForm: FormGroup;
  constructor(
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private nav: Router,
    private fb: FormBuilder
  ) {

  }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchCustomerId: [0]
    });
    this.dataSource = new MatTableDataSource<ICustomerApps>([]);
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.GetCustomerApps();

    }
  }

  updateActive(row, value) {

    row.Action = true;
    row.Active = value.checked ? 1 : 0;
    this.onBlur(row);

  }
  SaveAll() {
    var selectedapps = this.CustomerAppsList.filter(a => a.Active);
    if (selectedapps.length == 0) {
      this.alert.info("Please select application", this.optionAutoClose);
      return;
    }
    this.loading = true;
    this.ToUpdateCount = selectedapps.length;

    selectedapps.forEach(app => {
      this.ToUpdateCount--;
      this.UpdateOrSave(app);
    });
  }
  UpdateOrSave(row) {

    this.CustomerAppsData.CustomerAppsId = row.CustomerAppsId;
    this.CustomerAppsData.ApplicationPriceId = row.ApplicationPriceId;
    this.CustomerAppsData.AmountPerMonth = row.AmountPerMonth;
    this.CustomerAppsData.Formula = row.Formula;
    this.CustomerAppsData.LoginUserCount = 0;
    this.CustomerAppsData.PersonOrItemCount = row.PersonOrItemCount;
    this.CustomerAppsData.Active = row.Active;
    this.CustomerAppsData.OrgId = this.LoginUserDetail[0]["orgId"];

    console.log('data', this.CustomerAppsData);
    if (this.CustomerAppsData.CustomerAppsId == 0) {
      this.CustomerAppsData["CreatedDate"] = new Date();
      this.CustomerAppsData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
      this.CustomerAppsData["UpdatedDate"] = new Date();
      delete this.CustomerAppsData["UpdatedBy"];
      this.insert(row);
    }
    else {
      delete this.CustomerAppsData["CreatedDate"];
      delete this.CustomerAppsData["CreatedBy"];
      this.CustomerAppsData["UpdatedDate"] = new Date();
      this.CustomerAppsData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
      this.update(row);
    }
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.CustomerAppsListName, this.CustomerAppsData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.CustomerAppsId = data.CustomerAppsId;
          //row.Action = false;
          if (this.ToUpdateCount == 0) {
            this.ToUpdateCount = -1;
            this.loading = false;
            this.alert.success("Data saved successfully.", this.optionAutoClose);
            this.nav.navigate(["/dashboard"]);
          }
        });
  }
  update(row) {

    this.dataservice.postPatch(this.CustomerAppsListName, this.CustomerAppsData, this.CustomerAppsData.CustomerAppsId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          if (this.ToUpdateCount == 0) {
            this.ToUpdateCount = -1;
            this.alert.success("Data updated successfully.", this.optionAutoClose);
          }
        });
  }
  GetOrganizations() {

    let list: List = new List();
    list.fields = [
      "OrganizationId",
      "OrganizationName"
    ];
    list.PageName = "Organizations";
    list.filter = ["Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Organizations = [...data.value];
      })
  }
  GetApplicationPricing() {

    let list: List = new List();
    list.fields = [
      "ApplicationPriceId",
      "MinCount",
      "MinPrice",
      "PCPM",
      "ApplicationId",
      "Description",
      "CurrencyId",
      "Active"

    ];
    list.PageName = "ApplicationPrices";
    list.filter = ["Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var customerapp: ICustomerApps = {};
        this.ApplicationPricing = data.value.map(p => {
          customerapp = {};
          customerapp.AmountPerMonth = 0;
          customerapp.CurrencyId = p.CurrencyId;
          customerapp.CustomerAppsId = 0;
          customerapp.ApplicationPriceId = p.ApplicationPriceId;
          customerapp.Formula = '';
          customerapp.LoginUserCount = 0;
          customerapp.PersonOrItemCount = 0;
          customerapp.MinCount = p.MinCount;
          customerapp.MinPrice = p.MinPrice;
          customerapp.PCPM = p.PCPM;
          customerapp.Description = p.Description;
          customerapp.ApplicationName = this.Applications.filter(a => a.MasterDataId == p.ApplicationId)[0].Description;
          customerapp.Currency = this.Currencies.filter(a => a.MasterDataId == p.CurrencyId)[0].MasterDataName;
          customerapp.Active = 0;
          this.CustomerAppsList.push(customerapp)
        })

        this.dataSource = new MatTableDataSource(this.CustomerAppsList);
      })
  }
  GetCustomerApps() {

    this.CustomerAppsList = [];
    var filterstr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    this.loading = true;

    let list: List = new List();
    list.fields = [
      "CustomerAppsId"
    ];
    list.PageName = this.CustomerAppsListName;
    list.filter = [filterstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.loading = false;
        
        //checking if this page has been visited by user of this org.
        if (data.value.length > 0)
          this.nav.navigate(["/dashboard"]);
        else
          this.GetMasterData();
      })
  }


  onBlur(element) {
    element.Action = true;
    var formula = element.Description;
    Object.keys(element).forEach(prop => {
      if (formula.includes('[' + prop + ']') && prop != 'Description')
        formula = formula.replaceAll('[' + prop + ']', element[prop]);
    })
    element["AmountPerMonth"] = evaluate(formula);
    this.TotalAmount = this.CustomerAppsList.reduce((accum, curr) => accum + curr.AmountPerMonth, 0);
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
        this.allMasterData = [...data.value];
        this.Currencies = this.getDropDownData(globalconstants.MasterDefinitions.admin.CURRENCY);
        this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.bang);
        this.GetApplicationPricing();
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
export interface ICustomerApps {
  CustomerAppsId?: number;
  ApplicationPriceId?: number;
  LoginUserCount?: number;
  PersonOrItemCount?: number;
  Formula?: string;
  AmountPerMonth?: number;
  PCPM?: number,
  MinCount?: number,
  MinPrice?: number,
  CurrencyId?: number,
  ApplicationName?: string;
  Description?: string;
  Currency?: string;
  OrgId?: number;
  Active?: number;
}








