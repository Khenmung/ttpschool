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
  selector: 'app-customerinvoice',
  templateUrl: './customerinvoice.component.html',
  styleUrls: ['./customerinvoice.component.scss']
})
export class CustomerinvoiceComponent implements OnInit {
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
  Organizations =[];
  Currencies = [];
  CustomerInvoiceListName = "CustomerInvoices";
  CustomerInvoiceList = [];
  dataSource: MatTableDataSource<ICustomerInvoice>;
  allMasterData = [];
  PagePermission = '';
  CustomerInvoiceData = {
    CustomerInvoiceId: 0,
    CustomerId: 0,
    StudentClassId: 0,
    DueForMonth: 0,
    InvoiceDate: 0,
    TotalAmount: 0,
    DueDate: new Date(),
    PaymentStatusId: 0,
    OrgId: 0,
    Active: 0
  };
  displayedColumns = [
    "CustomerInvoiceId",
    "CustomerId",
    "StudentClassId",
    "DueForMonth",
    "InvoiceDate",
    "TotalAmount",
    "DueDate",
    "PaymentStatusId"
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
      searchCustomerId: [0]
    });
    this.dataSource = new MatTableDataSource<ICustomerInvoice>([]);
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {

      //this.GetMasterData();
      this.GetOrganizations();
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

    // if (row.CustomerInvoiceId > 0)
    //   checkFilterString += " and CustomerInvoiceId ne " + row.CustomerInvoiceId;

    // let list: List = new List();
    // list.fields = ["CustomerInvoiceId"];
    // list.PageName = this.CustomerInvoiceListName;
    // list.filter = [checkFilterString];

    // this.dataservice.get(list)
    //   .subscribe((data: any) => {
    //     debugger;
    //     if (data.value.length > 0) {
    //       this.loading = false;
    //       this.alert.error("Record already exists!", this.optionsNoAutoClose);
    //     }
    //     else {

    this.CustomerInvoiceData.CustomerInvoiceId = row.CustomerInvoiceId;
    this.CustomerInvoiceData.CustomerId = row.CustomerId;
    this.CustomerInvoiceData.DueDate = row.DueDate;
    this.CustomerInvoiceData.DueForMonth = row.DueForMonth;
    this.CustomerInvoiceData.InvoiceDate = row.InvoiceDate;
    this.CustomerInvoiceData.PaymentStatusId = row.PaymentStatusId;
    this.CustomerInvoiceData.TotalAmount = row.TotalAmount;
    this.CustomerInvoiceData.Active = row.Active;
    this.CustomerInvoiceData.OrgId = this.LoginUserDetail[0]["orgId"];

    console.log('data', this.CustomerInvoiceData);
    if (this.CustomerInvoiceData.CustomerInvoiceId == 0) {
      this.CustomerInvoiceData["CreatedDate"] = new Date();
      this.CustomerInvoiceData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
      this.CustomerInvoiceData["UpdatedDate"] = new Date();
      delete this.CustomerInvoiceData["UpdatedBy"];
      //console.log('exam slot', this.SchoolClassPeriodListData)
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

    debugger;
    this.dataservice.postPatch(this.CustomerInvoiceListName, this.CustomerInvoiceData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.CustomerInvoiceId = data.CustomerInvoiceId;
          row.Action = false;
          this.loading = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.CustomerInvoiceListName, this.CustomerInvoiceData, this.CustomerInvoiceData.CustomerInvoiceId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
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
      })
  }
  GetCustomerInvoice() {

    this.CustomerInvoiceList = [];
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];// + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 ';
    if (this.searchForm.get("searchCustomerId").value == 0) {
      this.alert.info("Please select Customer", this.optionAutoClose);
      return;
    }

    this.loading = true;
    var _searchCustomerId = this.searchForm.get("searchCustomerId").value;

    if (_searchCustomerId > 0)
      filterstr += " and CustomerId eq " + _searchCustomerId;

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
    
    list.filter = [filterstr + orgIdSearchstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        this.CustomerInvoiceList = [...data.value];
        
        this.dataSource = new MatTableDataSource<any>(this.CustomerInvoiceList);
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
        //this.Currencies = this.getDropDownData(globalconstants.MasterDefinitions.admin.CURRENCY);
        this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.bang);

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
export interface ICustomerInvoice {
  CustomerInvoiceId: number;
  CustomerId: number;
  StudentClassId: number;
  DueForMonth: number;
  InvoiceDate: number;
  TotalAmount: number;
  DueDate: Date;
  PaymentStatusId: number;
  OrgId: number;
  Active: number;
}







