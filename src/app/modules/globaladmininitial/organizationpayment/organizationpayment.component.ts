import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-organizationpayment',
  templateUrl: './organizationpayment.component.html',
  styleUrls: ['./organizationpayment.component.scss']
})
export class OrganizationpaymentComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
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
  Organizations = [];
  Currencies = [];
  PaymentModes = [];
  OrganizationPaymentListName = "OrganizationPayments";
  OrganizationPaymentList = [];
  Plans = [];
  CustomerPlans = [];
  dataSource: MatTableDataSource<IOrganizationPayment>;
  allMasterData = [];
  PagePermission = '';
  OrganizationPaymentData = {
    OrganizationPaymentId: 0,
    OrgId: 0,
    OrganizationPlanId: 0,
    PaidMonths: 0,
    PaymentDate: new Date(),
    Amount: 0,
    PaymentMode: 0,
    Active: 1
  };
  OrgId = 0;
  UserId = '';
  displayedColumns = [
    "OrganizationPaymentId",
    "PlanName",
    "AmountPerMonth",
    "PaidMonths",
    "PaymentMode",
    "Amount",
    "PaymentDate",
    "Active",
    "Action"
  ];
  SelectedApplicationId = 0;
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
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
    this.dataSource = new MatTableDataSource<IOrganizationPayment>([]);
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
    this.GetPaymentModes();
    this.GetOrganizations();
    this.GetCustomerPlan();
  }
  updateActive(row, value) {

    row.Action = true;
    row.Active = value.checked ? 1 : 0;

  }
  login() {
    this.nav.navigate(['auth/login']);
  }
  AddNew() {
    var orgId = this.searchForm.get("searchCustomerId").value
    if (orgId == 0) {
      this.loading = false;
      this.alert.info("Please select customer.", this.optionsNoAutoClose);
      return;
    }
    var customDetail = this.CustomerPlans.filter(f => f.CustomerPlanId == orgId);
    var AmountPerMonth = 0;
    var PlanId = 0;
    var PlanName = '';
    if (customDetail.length > 0) {
      PlanName = customDetail[0].PlanName;
      PlanId = customDetail[0].CustomerPlanId;
      AmountPerMonth = customDetail[0].AmountPerMonth;
    }
    var newdata = {
      "OrganizationPaymentId": 0,
      "OrganizationPlanId": PlanId,
      "PlanName": PlanName,
      "AmountPerMonth": AmountPerMonth,
      "PaidMonths": 0,
      "Amount": 0,
      "PaymentDate": new Date(),
      "Active": 0,
      "Action": false,
      "OrgId": 0,
      "PaymentStatus": '',
      "PaymentMode": 0
    }
    this.OrganizationPaymentList.push(newdata);
    this.dataSource = new MatTableDataSource<IOrganizationPayment>(this.OrganizationPaymentList);
    this.dataSource.paginator = this.paginator;
  }
  UpdateOrSave(row) {

    if (row.PaidMonths == 0) {
      this.alert.error("Please payment for enter no. of months.", this.optionsNoAutoClose);
      this.loading = false;
      row.Action = false;
      return;
    }
    if (row.PaymentMode == 0) {
      this.alert.error("Please select payment mode.", this.optionsNoAutoClose);
      this.loading = false;
      row.Action = false;
      return;
    }

    this.OrganizationPaymentData.OrganizationPaymentId = row.OrganizationPaymentId;
    this.OrganizationPaymentData.OrganizationPlanId = row.OrganizationPlanId;
    this.OrganizationPaymentData.PaidMonths = row.PaidMonths;
    this.OrganizationPaymentData.Amount = row.Amount;
    this.OrganizationPaymentData.PaymentMode = row.PaymentMode;
    this.OrganizationPaymentData.Active = row.Active;
    this.OrganizationPaymentData.OrgId = this.OrgId;//this.LoginUserDetail[0]["orgId"];
    this.OrganizationPaymentData.PaymentDate = row.PaymentDate
    if (this.OrganizationPaymentData.OrganizationPaymentId == 0) {
      this.OrganizationPaymentData["CreatedDate"] = new Date();
      this.OrganizationPaymentData["CreatedBy"] = this.UserId;
      this.OrganizationPaymentData["UpdatedDate"] = new Date();
      delete this.OrganizationPaymentData["UpdatedBy"];
      this.insert(row);
    }
    else {
      delete this.OrganizationPaymentData["CreatedDate"];
      delete this.OrganizationPaymentData["CreatedBy"];
      this.OrganizationPaymentData["UpdatedDate"] = new Date();
      this.OrganizationPaymentData["UpdatedBy"] = this.UserId;
      this.update(row);
    }
  }
  insert(row) {

    debugger;
    this.dataservice.postPatch(this.OrganizationPaymentListName, this.OrganizationPaymentData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.OrganizationPaymentId = data.OrganizationPaymentId;
          row.Action = false;
          this.loading = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        }, error => {
          this.alert.error("error occured. Please contact administrator.", this.optionAutoClose);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.OrganizationPaymentListName, this.OrganizationPaymentData, this.OrganizationPaymentData.OrganizationPaymentId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.Action = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }
  GetPaymentModes() {
    this.contentservice.GetParentZeroMasters()
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Applications = this.tokenstorage.getPermittedApplications();
        var globalAdminId = this.Applications.filter(f => f.appShortName.toLowerCase() == 'globaladmin')[0].applicationId;
        var PaymentModeParentId = this.allMasterData.filter(f => f.MasterDataName.toLowerCase() == globalconstants.MasterDefinitions.ttpapps.PAYMENTSTATUS)[0].MasterDataId;

        this.contentservice.GetDropDownDataFromDB(PaymentModeParentId, this.LoginUserDetail[0]["orgId"], globalAdminId,1)
          .subscribe((data: any) => {
            this.PaymentModes = [...data.value];
            this.loading = false;
          });
      })
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

        if (this.LoginUserDetail[0]["org"] != 'TTP') {
          this.searchForm.patchValue({ "searchCustomerId": this.OrgId });
          this.searchForm.controls["searchCustomerId"].disable();
          this.GetOrganizationPayment();
        }
      })
  }
  GetCustomerPlan() {
    let list: List = new List();
    list.fields = [
      "CustomerPlanId",
      "PlanId",
      "LoginUserCount",
      "PersonOrItemCount",
      "Formula",
      "AmountPerMonth",
      "OrgId",
      "Active"
    ];
    list.PageName = "CustomerPlans";
    list.lookupFields = ["Plan($select=PlanId,Title)"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.CustomerPlans = data.value.map(m => {
          m.PlanName = m.Plan.Title;
          return m;
        });
        this.loading = false;
        //      this.GetOrganizationPayment();
      })
  }
  GetOrganizationPayment() {
    debugger;
    this.OrganizationPaymentList = [];
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
      "OrganizationPaymentId",
      "OrgId",
      "OrganizationPlanId",
      "PaidMonths",
      "PaymentDate",
      "Amount",
      "PaymentMode",
      "Active"
    ];
    list.PageName = this.OrganizationPaymentListName;
    //list.lookupFields = [];
    list.filter = [filterstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //var customerapp;
        this.OrganizationPaymentList = data.value.map(x => {
          var customerplanobj = this.CustomerPlans.filter(f => f.CustomerPlanId == x.OrganizationPlanId);
          if (customerplanobj.length > 0) {
            x.PlanName = customerplanobj[0].PlanName;
            x.AmountPerMonth = customerplanobj[0].AmountPerMonth;
            x.PaymentStatus = this.PaymentModes.filter(f => f.MasterDataId == x.PaymentMode)[0].MasterDataName;
          }
          return x;
        });

        if (this.OrganizationPaymentList.length == 0)
          this.alert.info("No record found!", this.optionAutoClose);

        this.dataSource = new MatTableDataSource<any>(this.OrganizationPaymentList.sort((a, b) => new Date(b.PaymentDate).getTime() - new Date(a.PaymentDate).getTime()));
        this.dataSource.paginator = this.paginator;
        this.loading = false;
      })
  }
  GetPlan() {
    let list: List = new List();
    list.fields = [
      "PlanId",
      "Title",
      "Description"
    ];
    list.PageName = "Plans";
    list.filter = ["Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Plans = [...data.value];
        this.loading = false;

      })
  }

  onBlur(element) {
    debugger;
    element.Action = true;
    // var formula = element.Formula == '' ? element.Logic : element.Formula;
    // Object.keys(element).forEach(prop => {
    //   if (formula.includes('[' + prop + ']') && prop != 'Description')
    //     formula = formula.replaceAll('[' + prop + ']', element[prop]);
    // })
    element.Amount = element["AmountPerMonth"] * element.PaidMonths;
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
export interface IOrganizationPayment {
  OrganizationPaymentId: number;
  OrgId: number;
  OrganizationPlanId: number;
  PaidMonths: number;
  PaymentDate: Date;
  Amount: number;
  PaymentMode: number;
  Active: number;

}

