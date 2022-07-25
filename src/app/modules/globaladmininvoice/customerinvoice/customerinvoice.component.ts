import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { evaluate } from 'mathjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-customerinvoice',
  templateUrl: './customerinvoice.component.html',
  styleUrls: ['./customerinvoice.component.scss']
})
export class CustomerinvoiceComponent implements OnInit { PageLoading=true;
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
  CustomerPlans = [];
  CurrentCustomerPlans = [];
  Applications = [];
  DropDownMonths = [];
  Organizations = [];
  Currencies = [];
  PaymentStatus = [];
  CustomerInvoiceListName = "CustomerInvoices";
  InvoiceComponentListName = "CustomerInvoiceComponents";
  CustomerInvoiceList = [];
  InvoiceComponents = [];
  CustomerInvoiceComponents = [];
  CustomerPlanDataSource: MatTableDataSource<ICustomerPlansDisplay>;
  CustomerInvoiceDataSource: MatTableDataSource<ICustomerInvoice>;
  allMasterData = [];
  PagePermission = '';
  CustomerInvoiceData = {
    CustomerInvoiceId: 0,
    CustomerId: 0,
    StudentClassId: 0,
    DueForMonth: 0,
    InvoiceDate: new Date(),
    TotalAmount: 0,
    DueDate: new Date(),
    PaymentStatusId: 0,
    OrgId: 0,
    Active: 0
  };
  InvoiceDisplayedColumns = [
    "CustomerName",
    "DueForMonth",
    "InvoiceDate",
    "TotalAmount",
    "DueDate",
    "PaymentStatusId",
    "Active",
    "Action"
  ];
  CustomerPlanDisplayedColumns = [
    "ApplicationName",
    "LoginUserCount",
    "PersonOrItemCount",
    "AmountPerMonth",
    "Currency"
  ];
  SelectedApplicationId=0;
  searchForm: FormGroup;
  constructor(
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    
    private contentservice: ContentService,
    private nav: Router,
    private shareddata: SharedataService,
    private datepipe: DatePipe,
    private fb: FormBuilder
  ) {

  }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchOrgId: [0],
      searchYearMonth: [0]
    });
    this.CustomerPlanDataSource = new MatTableDataSource<ICustomerPlansDisplay>([]);
    this.CustomerInvoiceDataSource = new MatTableDataSource<ICustomerInvoice>([]);
    this.PageLoad();
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      this.DropDownMonths = this.GetSessionFormattedMonths();
      this.GetOrganizations();
      this.GetCustomerPlans();
      this.GetMasterData();

    }
  }
  updateActive(row, value) {

    row.Action = true;
    row.Active = value.checked ? 1 : 0;

  }

  UpdateOrSave(row) {

    // //debugger;

    // this.loading = true;
    // let checkFilterString = "ReportName eq '" + row.ReportName + "'" +
    //   " and ApplicationId eq " + row.ApplicationId;

    // if (row.CustomerInvoiceId > 0)
    //   checkFilterString += " and CustomerInvoiceId ne " + row.CustomerInvoiceId;

    // let list: List = new List();
    // list.fields = ["CustomerInvoiceId"];
    // list.PageName = this.CustomerInvoiceListName;
    // list.filter = [checkFilterString];

    // this.dataservice.get(list)
    //   .subscribe((data: any) => {
    //     //debugger;
    //     if (data.value.length > 0) {
    //       this.loading = false; this.PageLoading=false;
    //       this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
    //     }
    //     else {

    this.CustomerInvoiceData.CustomerInvoiceId = row.CustomerInvoiceId;
    this.CustomerInvoiceData.CustomerId = row.CustomerId;
    this.CustomerInvoiceData.DueDate = row.DueDate;
    this.CustomerInvoiceData.DueForMonth = row.DueForMonth;
    this.CustomerInvoiceData.InvoiceDate = row.InvoiceDate;
    this.CustomerInvoiceData.PaymentStatusId = row.PaymentStatusId;
    this.CustomerInvoiceData.TotalAmount = row.TotalAmount.toString();
    this.CustomerInvoiceData.Active = row.Active;
    this.CustomerInvoiceData.OrgId = this.LoginUserDetail[0]["orgId"];

    //console.log('data', this.CustomerInvoiceData);
    if (this.CustomerInvoiceData.CustomerInvoiceId == 0) {
      this.CustomerInvoiceData["CreatedDate"] = new Date();
      this.CustomerInvoiceData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
      this.CustomerInvoiceData["UpdatedDate"] = new Date();
      delete this.CustomerInvoiceData["UpdatedBy"];
      ////console.log('exam slot', this.SchoolClassPeriodListData)
      this.insert(row);
    }
    else {
      delete this.CustomerInvoiceData["CreatedDate"];
      delete this.CustomerInvoiceData["CreatedBy"];
      this.CustomerInvoiceData["UpdatedDate"] = new Date();
      this.CustomerInvoiceData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
      this.update(row);
    }
    //}
    //});
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.CustomerInvoiceListName, this.CustomerInvoiceData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.CustomerInvoiceId = data.CustomerInvoiceId;
          row.Action = false;
          this.loading = false; this.PageLoading=false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.CustomerInvoiceListName, this.CustomerInvoiceData, this.CustomerInvoiceData.CustomerInvoiceId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading=false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
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
  GetCustomerInvoiceComponents() {

    var orgIdSearchstr = " and OrgId eq " + this.LoginUserDetail[0]["orgId"]
    let list: List = new List();
    list.fields = [
      "CustomerInvoiceComponentId",
      "CustomerId",
      "InvoiceComponentId",
      "Formula",
      "Active"
    ];

    list.PageName = this.InvoiceComponentListName;
    //list.lookupFields = ["CustomerInvoice"]
    list.filter = ["Active eq 1" + orgIdSearchstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.CustomerInvoiceComponents = data.value.map(v => {
          var component = this.InvoiceComponents.filter(inv => inv.MasterDataId == v.InvoiceComponentId);
          if (component.length > 0) {
            v.InvoiceComponentName = component[0].MasterDataName;
            v.Description = component[0].Description;
            v.Logic = component[0].Logic;
            v.CustomerId = component[0].CustomerId;
          }
          return v;
        });
        this.loading = false; this.PageLoading=false;
      })
  }
  GetCustomerInvoice() {

    this.CustomerInvoiceList = [];
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];// + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 ';
    if (this.searchForm.get("searchOrgId").value == 0) {
      this.contentservice.openSnackBar("Please select Customer", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    if (this.searchForm.get("searchYearMonth").value == 0) {
      this.contentservice.openSnackBar("Please select year month", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }

    this.loading = true;
    var _searchCustomerId = this.searchForm.get("searchOrgId").value;
    var _searchYearMonth = this.searchForm.get("searchYearMonth").value;

    if (_searchCustomerId > 0)
      filterstr += " and CustomerId eq " + _searchCustomerId;
    if (_searchYearMonth > 0)
      filterstr += " and DueForMonth eq " + _searchYearMonth;

    let list: List = new List();
    list.fields = [
      "CustomerInvoiceId",
      "CustomerId",
      "DueForMonth",
      "InvoiceDate",
      "TotalAmount",
      "DueDate",
      "PaymentStatusId",
      "Active"
    ];

    list.PageName = this.CustomerInvoiceListName;
    //list.lookupFields = ["CustomerInvoiceComponents"];

    list.filter = [filterstr + orgIdSearchstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {

        var _SelectedCustomerPlans = this.CustomerPlans.filter(c => c.CustomerPlanId == _searchCustomerId);
        this.CurrentCustomerPlans = [..._SelectedCustomerPlans];
        if (data.value.length > 0) {
          this.CustomerInvoiceList = data.value.map(db => {
            db.CustomerName = this.Organizations.filter(f => f.OrganizationId == _searchCustomerId)[0].OrganizationName;
            return db;
          });
        }
        else {
          var _TotalAmount = _SelectedCustomerPlans.reduce((acc, current) => acc + (+current.AmountPerMonth), 0);
          var _formula = '';
          var _custinvComp = this.CustomerInvoiceComponents.filter(c => c.CustomerId == _searchCustomerId);
          _custinvComp.forEach(inv => {
            _formula = inv.Formula.length > 0 ? inv.Formula : inv.Logic;
            if (inv.Logic.length > 0) {
              _formula = inv.Logic.replaceAll('[TotalAmount]', _TotalAmount);
              _TotalAmount = evaluate(_formula);
            }

          })
          const _DueDate = new Date();
          _DueDate.setDate(_DueDate.getDate() + 10);

          this.CustomerInvoiceList.push({
            "CustomerInvoiceId": 0,
            "CustomerId": _searchCustomerId,
            "CustomerName": this.Organizations.filter(f => f.OrganizationId == _searchCustomerId)[0].OrganizationName,
            "DueForMonth": +_searchYearMonth,
            "InvoiceDate": new Date(),
            "TotalAmount": _TotalAmount,
            "DueDate": _DueDate,
            "PaymentStatusId": this.PaymentStatus.filter(p => p.MasterDataName.toLowerCase() == 'pending')[0].MasterDataId,
            "Active": 0,
            "Action": false
          })
        }
        //console.log('Organizations', this.Organizations)
        this.CustomerInvoiceDataSource = new MatTableDataSource<any>(this.CustomerInvoiceList);
        this.loading = false; this.PageLoading=false;
      })
  }
  GetCustomerPlans() {

    var filterstr = 'Active eq 1 ';

    let list: List = new List();
    list.fields = [
      "CustomerPlanId",
      "PlanId",
      "LoginUserCount",
      "PersonOrItemCount",
      "AmountPerMonth",
      "Active"
    ];
    list.PageName = "CustomerPlans";
    list.filter = [filterstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.CustomerPlans = [...data.value];
      })
  }
  onBlur(element) {
    element.Action = true;
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
        ////console.log('b',b)
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
    ////console.log('monthArray',monthArray);
    //}, 3000);
    return monthArray;
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"],this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.bang);
        this.InvoiceComponents = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.INVOICECOMPONENT);
        this.PaymentStatus = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.PAYMENTSTATUS);
        this.GetCustomerInvoiceComponents();
      });
  }

  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenstorage, this.allMasterData);
    
    // let Id = 0;
    // let Ids = this.allMasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();//globalconstants.GENDER
    // })
    // if (Ids.length > 0) {
    //   Id = Ids[0].MasterDataId;
    //   return this.allMasterData.filter((item, index) => {
    //     return item.ParentId == Id
    //   })
    // }
    // else
    //   return [];

  }

}
export interface ICustomerInvoice {
  CustomerInvoiceId: number;
  CustomerId: number;
  StudentClassId: number;
  DueForMonth: number;
  InvoiceDate: Date;
  TotalAmount: number;
  DueDate: Date;
  PaymentStatusId: number;
  OrgId: number;
  Active: number;
}
export interface ICustomerPlansDisplay {
  ApplicationName?: string;
  LoginUserCount?: number;
  PersonOrItemCount?: number;
  AmountPerMonth?: number;
  Currency?: string;
}

export interface ICustomerInvoiceComponent {
  CustomerInvoiceComponentId: number;
  CustomerInvoiceId: number;
  InvoiceComponentId: number;
  OrgId: number;
  Active: number;
}





