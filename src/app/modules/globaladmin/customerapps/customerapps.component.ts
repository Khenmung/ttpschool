import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { evaluate } from 'mathjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-customerapps',
  templateUrl: './customerapps.component.html',
  styleUrls: ['./customerapps.component.scss']
})
export class CustomerappsComponent implements OnInit {
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
  CustomerAppsListName = "CustomerApps";
  CustomerAppsList = [];
  ApplicationPricing =[];
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
    "LoginUserCount",
    "PersonOrItemCount",    
    "Formula",
    "AmountPerMonth",
    "Currency",
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
      searchCustomerId: [0]
    });
    this.dataSource = new MatTableDataSource<ICustomerApps>([]);
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {

      this.GetMasterData();
      this.GetOrganizations();
      this.GetApplicationPricing();
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

    // if (row.CustomerAppsId > 0)
    //   checkFilterString += " and CustomerAppsId ne " + row.CustomerAppsId;

    // let list: List = new List();
    // list.fields = ["CustomerAppsId"];
    // list.PageName = this.CustomerAppsListName;
    // list.filter = [checkFilterString];

    // this.dataservice.get(list)
    //   .subscribe((data: any) => {
    //     debugger;
    //     if (data.value.length > 0) {
    //       this.loading = false;
    //       this.alert.error("Record already exists!", this.optionsNoAutoClose);
    //     }
    //     else {
    // //Object.keys(row).forEach(prop => {
    //   this.CustomerAppsData[prop] = prop=='AmountPerMonth'? row[prop].toString():row[prop];
    // });
    this.CustomerAppsData.CustomerAppsId = row.CustomerAppsId;
    this.CustomerAppsData.ApplicationPriceId = row.ApplicationPriceId;
    this.CustomerAppsData.AmountPerMonth = row.AmountPerMonth.toString();
    this.CustomerAppsData.Formula = row.Formula;
    this.CustomerAppsData.LoginUserCount = row.LoginUserCount;
    this.CustomerAppsData.PersonOrItemCount = row.PersonOrItemCount;
    this.CustomerAppsData.Active = row.Active;    
    this.CustomerAppsData.OrgId = this.LoginUserDetail[0]["orgId"];

    console.log('data', this.CustomerAppsData);
    if (this.CustomerAppsData.CustomerAppsId == 0) {
      this.CustomerAppsData["CreatedDate"] = new Date();
      this.CustomerAppsData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
      this.CustomerAppsData["UpdatedDate"] = new Date();
      delete this.CustomerAppsData["UpdatedBy"];
      //console.log('exam slot', this.SchoolClassPeriodListData)
      this.insert(row);
    }
    else {
      delete this.CustomerAppsData["CreatedDate"];
      delete this.CustomerAppsData["CreatedBy"];
      this.CustomerAppsData["UpdatedDate"] = new Date();
      this.CustomerAppsData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
      this.update(row);
    }
    //}
    //});
  }

  insert(row) {

    debugger;
    this.dataservice.postPatch(this.CustomerAppsListName, this.CustomerAppsData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.CustomerAppsId = data.CustomerAppsId;
          row.Action = false;
          this.loading = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.CustomerAppsListName, this.CustomerAppsData, this.CustomerAppsData.CustomerAppsId, 'patch')
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
  GetApplicationPricing(){
    
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
          this.ApplicationPricing =[...data.value];
        })
  }
  GetCustomerApps() {

    this.CustomerAppsList = [];
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];// + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 ';
    if (this.searchForm.get("searchCustomerId").value == 0) {
      this.alert.info("Please select organization", this.optionAutoClose);
      return;
    }

    this.loading = true;
    
    var _searchCustomerId = this.searchForm.get("searchCustomerId").value;

    if (_searchCustomerId > 0)
      filterstr += " and CustomerId eq " + _searchCustomerId;
    
    let list: List = new List();
    list.fields = [
      "CustomerAppsId",
      "ApplicationPriceId",
      "LoginUserCount",
      "PersonOrItemCount",
      "Formula",
      "AmountPerMonth",
      "Active",
      
    ];
    list.PageName = this.CustomerAppsListName;
    //list.lookupFields = [];
    list.filter = [filterstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var customerapp: ICustomerApps;

        this.ApplicationPricing.forEach(p=>{
          customerapp = {};  
          var d =  data.value.filter(db=>db.ApplicationPriceId == p.ApplicationPriceId);
            if(d.length>0)
            {
              
              customerapp.AmountPerMonth = d[0].AmountPerMonth;
              customerapp.CurrencyId = p.CurrencyId;
              customerapp.CustomerAppsId = d[0].CustomerAppsId;
              customerapp.ApplicationPriceId = d[0].ApplicationPriceId;
              customerapp.Formula = d[0].Formula;
              customerapp.LoginUserCount = d[0].LoginUserCount;
              customerapp.PersonOrItemCount = d[0].PersonOrItemCount;
              customerapp.MinCount = p.MinCount;
              customerapp.MinPrice = p.MinPrice;
              customerapp.PCPM = p.PCPM;
              customerapp.Description = p.Description;
              customerapp.ApplicationName = this.Applications.filter(a => a.MasterDataId == p.ApplicationId)[0].Description;
              customerapp.Currency = this.Currencies.filter(a => a.MasterDataId == p.CurrencyId)[0].MasterDataName;
    
            }
            else
            {
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
    
            }
            this.CustomerAppsList.push(customerapp)
    
          })
        console.log('this.CustomerAppsList',this.CustomerAppsList);
        this.dataSource = new MatTableDataSource<any>(this.CustomerAppsList);
        this.loading = false;
      })
  }


  onBlur(element) {
    element.Action = true;
    var formula = element.Description;
    Object.keys(element).forEach(prop=>{
        if(formula.includes('['+ prop + ']') && prop !='Description')
        formula = formula.replaceAll('['+ prop + ']',element[prop]);
    })
    element["AmountPerMonth"] = evaluate(formula);
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
  Description?:string;
  Currency?: string;
  OrgId?: number;
  Active?: number;
}








