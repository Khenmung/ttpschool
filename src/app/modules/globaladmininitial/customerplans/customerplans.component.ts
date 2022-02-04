import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { evaluate } from 'mathjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-customerplans',
  templateUrl: './customerplans.component.html',
  styleUrls: ['./customerplans.component.scss']
})
export class CustomerPlansComponent implements OnInit {
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
  //ReportNames = [];
  Organizations = [];
  Currencies = [];
  CustomerPlansListName = "CustomerPlans";
  CustomerPlansList = [];
  Plans = [];
  dataSource: MatTableDataSource<ICustomerPlans>;
  allMasterData = [];
  PagePermission = '';
  CustomerPlansData = {
    CustomerPlanId: 0,
    PlanId: 0,
    LoginUserCount: 0,
    PersonOrItemCount: 0,
    Formula: '',
    AmountPerMonth: 0,
    OrgId: 0,
    Active: 0,
  };
  OrgId = 0;
  UserId = '';
  displayedColumns = [
    "PlanName",
    "PCPM",
    "MinCount",
    "MinPrice",
    "LoginUserCount",
    "PersonOrItemCount",
    "Formula",
    "AmountPerMonth",
    "Active",
    "Action"
  ];
  SelectedApplicationId = 0;
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
    this.dataSource = new MatTableDataSource<ICustomerPlans>([]);
    this.PageLoad();
  }

  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail.length != 0) {
      this.UserId = this.LoginUserDetail[0]["userId"];
      this.OrgId = this.LoginUserDetail[0]["orgId"];
    }
    else {
      this.UserId = localStorage.getItem("userId");
      this.OrgId = +localStorage.getItem("orgId");
    }
    console.log("orgid",this.OrgId)
    //this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
    //this.GetMasterData();
    this.GetOrganizations();
    this.GetPlan();
  }
  updateActive(row, value) {

    row.Action = true;
    row.Active = value.checked ? 1 : 0;

  }
  login(){
    this.nav.navigate(['auth/login']);
  }
  
  UpdateOrSave(row) {


    this.CustomerPlansData.CustomerPlanId = row.CustomerPlanId;
    this.CustomerPlansData.PlanId = row.PlanId;
    this.CustomerPlansData.AmountPerMonth = row.AmountPerMonth;
    this.CustomerPlansData.Formula = row.Formula;
    this.CustomerPlansData.LoginUserCount = row.LoginUserCount;
    this.CustomerPlansData.PersonOrItemCount = row.PersonOrItemCount;
    this.CustomerPlansData.Active = row.Active;
    this.CustomerPlansData.OrgId = this.OrgId;//this.LoginUserDetail[0]["orgId"];

    //console.log('data', this.CustomerPlansData);
    if (this.CustomerPlansData.CustomerPlanId == 0) {
      this.CustomerPlansData["CreatedDate"] = new Date();
      this.CustomerPlansData["CreatedBy"] = this.UserId;
      this.CustomerPlansData["UpdatedDate"] = new Date();
      delete this.CustomerPlansData["UpdatedBy"];
      this.insert(row);
    }
    else {
      delete this.CustomerPlansData["CreatedDate"];
      delete this.CustomerPlansData["CreatedBy"];
      this.CustomerPlansData["UpdatedDate"] = new Date();
      this.CustomerPlansData["UpdatedBy"] = this.UserId;
      this.update(row);
    }
  }

  insert(row) {

    debugger;
    this.dataservice.postPatch(this.CustomerPlansListName, this.CustomerPlansData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.CustomerPlanId = data.CustomerPlanId;
          row.Action = false;
          this.loading = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        },error=>{        
        this.alert.error("error occured. Please contact administrator.",this.optionAutoClose);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.CustomerPlansListName, this.CustomerPlansData, this.CustomerPlansData.CustomerPlanId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.Action = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
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
        this.searchForm.patchValue({ "searchCustomerId": this.OrgId });
      })
  }
  GetPlan() {
    let list: List = new List();
    list.fields = [
      "PlanId",
      "Title",
      "Description",
      "Logic",
      "PCPM",
      "MinCount",
      "MinPrice",
      "Active"
    ];
    list.PageName = "Plans";
    list.filter = ["Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Plans = [...data.value];
        this.loading = false;
        this.GetCustomerPlans();
      })
  }
  // GetApplicationPricing() {

  //   let list: List = new List();
  //   list.fields = [
  //     "PlanId",
  //     "MinCount",
  //     "MinPrice",
  //     "PCPM",
  //     "ApplicationId",
  //     "Description",
  //     "CurrencyId",
  //     "Active"

  //   ];
  //   list.PageName = "ApplicationPrices";
  //   list.filter = ["Active eq 1"];
  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       this.ApplicationPricing = [...data.value];
  //     })
  // }
  GetCustomerPlans() {

    this.CustomerPlansList = [];
    //var orgIdSearchstr = ' and OrgId eq ' + localStorage.getItem("orgId");// + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 ';
    if (this.searchForm.get("searchCustomerId").value == 0) {
      this.alert.info("Please select organization", this.optionAutoClose);
      return;
    }

    this.loading = true;

    var _searchCustomerId = this.searchForm.get("searchCustomerId").value;

    if (_searchCustomerId > 0)
      filterstr += " and OrgId eq " + _searchCustomerId;

    let list: List = new List();
    list.fields = [
      "CustomerPlanId",
      "PlanId",
      "LoginUserCount",
      "PersonOrItemCount",
      "Formula",
      "AmountPerMonth",
      "Active",

    ];
    list.PageName = this.CustomerPlansListName;
    //list.lookupFields = [];
    list.filter = [filterstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //var customerapp;

        this.Plans.forEach(p => {
          //customerapp = {};  
          var d = data.value.filter(db => db.PlanId == p.PlanId);
          if (d.length > 0) {
            this.CustomerPlansList.push({
              "AmountPerMonth": d[0].AmountPerMonth,
              "CurrencyId": p.CurrencyId,
              "CustomerPlanId": d[0].CustomerPlanId,
              "PlanId": d[0].PlanId,
              "PlanName": p.Title,
              "Logic": p.Logic ==null?'':p.Logic,
              "Formula": d[0].Formula,
              "LoginUserCount": d[0].LoginUserCount,
              "PersonOrItemCount": d[0].PersonOrItemCount,
              "MinCount": p.MinCount,
              "MinPrice": p.MinPrice,
              "PCPM": p.PCPM,
              "Description": p.Description,
              //"Currency": this.Currencies.filter(a => a.MasterDataId == p.CurrencyId)[0].MasterDataName,
              "Active": d[0].Active
            });
          }
          else {
            this.CustomerPlansList.push({
              "AmountPerMonth": 0,
              "CustomerPlanId": 0,
              "PlanId": p.PlanId,
              "PlanName": p.Title,
              "Logic": p.Logic ==null?'':p.Logic,
              "Formula": '',
              "LoginUserCount": 0,
              "PersonOrItemCount": 0,
              "MinCount": p.MinCount,
              "MinPrice": p.MinPrice,
              "PCPM": p.PCPM,
              "Description": p.Description,
              //"Currency": this.Currencies.filter(a => a.MasterDataId == p.CurrencyId)[0].MasterDataName,
              "Active": 0
            });
          }
        })
        this.dataSource = new MatTableDataSource<any>(this.CustomerPlansList);
        this.loading = false;
      })
  }


  onBlur(element) {
    debugger;
    element.Action = true;
    var formula = element.Formula == '' ? element.Logic : element.Formula;
    Object.keys(element).forEach(prop => {
      if (formula.includes('[' + prop + ']') && prop != 'Description')
        formula = formula.replaceAll('[' + prop + ']', element[prop]);
    })
    element["AmountPerMonth"] = evaluate(formula);
  }

  // GetMasterData() {

  //   this.contentservice.GetCommonMasterData(this.OrgId, this.SelectedApplicationId)
  //     .subscribe((data: any) => {
  //       this.allMasterData = [...data.value];
  //       this.Currencies = this.getDropDownData(globalconstants.MasterDefinitions.common.CURRENCY);
  //       this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.bang);
  //       this.loading = false;
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
export interface ICustomerPlans {
  CustomerPlanId?: number;
  PlanId?: number;
  LoginUserCount?: number;
  PersonOrItemCount?: number;
  Formula?: string;
  AmountPerMonth?: number;
  PCPM?: number,
  MinCount?: number,
  MinPrice?: number,
  CurrencyId?: number,
  Description?: string;
  Currency?: string;
  OrgId?: number;
  Active?: number;
}








