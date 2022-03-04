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
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit {
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
  OrganizationListName = "Organizations";
  OrganizationList = [];
  Country=[];
  States=[];
  City=[];
  Plans = [];
  CustomerPlans = [];
  dataSource: MatTableDataSource<IOrganization>;
  allMasterData = [];
  PagePermission = '';
  OrganizationData = {
    OrganizationId: 0,
    OrganizationName: '',
    LogoPath: '',
    Address: '',
    City: 0,
    State: 0,
    Country: 0,
    Contact: '',
    Active: 0,
    CreatedDate: new Date()
  };
  OrgId = 0;
  UserId = '';
  displayedColumns = [
    "OrganizationId",
    "OrganizationName",
    "LogoPath",
    "Address",
    "Country",
    "State",
    "City",
    "Contact",
    "ValidTo",
    "CreatedDate",
    "Active",
    "Action"    
  ];
  TopMasters=[];
  SelectedApplicationId = 0;
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    
    private nav: Router,
    private fb: FormBuilder
  ) {

  }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchCustomerId:[0]
    });
    this.dataSource = new MatTableDataSource<IOrganization>([]);
    this.PageLoad();
  }
  get f() {
    return this.searchForm.controls;
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
    this.Applications = this.tokenstorage.getPermittedApplications();
    var commonAppId = this.Applications.filter(f=>f.appShortName=='common')[0].applicationId;
    //var TopMasters=[];
    this.contentservice.GetParentZeroMasters().subscribe((data:any)=>{
      this.TopMasters=[...data.value];
      var countryparentId = this.TopMasters.filter(f=>f.MasterDataName.toLowerCase()=='country')[0].MasterDataId;
      this.contentservice.GetDropDownDataFromDB(countryparentId,this.OrgId,commonAppId)
      .subscribe((data:any)=>{
        this.Country = [...data.value];
      })
    })
    this.GetOrganization();
    
  }
  PopulateState(element){
    var commonAppId = this.Applications.filter(f=>f.appShortName=='common')[0].applicationId;
       this.contentservice.GetDropDownDataFromDB(element.value,this.OrgId,commonAppId)
      .subscribe((data:any)=>{
        this.States =[...data.value];
      })
  }
  PopulateCity(element){
    var commonAppId = this.Applications.filter(f=>f.appShortName=='common')[0].applicationId;
       this.contentservice.GetDropDownDataFromDB(element.value,this.OrgId,commonAppId)
      .subscribe((data:any)=>{
        this.City =[...data.value];
      })
  }
  updateActive(row, value) {

    row.Action = true;
    row.Active = value.checked ? 1 : 0;

  }
  login() {
    this.nav.navigate(['auth/login']);
  }

  UpdateOrSave(row) {

    if (row.OrganizationName == '') {
      this.contentservice.openSnackBar("Please enter organization name.",globalconstants.ActionText,globalconstants.RedBackground);
      this.loading = false;
      row.Action = false;
      return;
    }
    

    this.OrganizationData.OrganizationId = row.OrganizationId;
    this.OrganizationData.OrganizationName = row.OrganizationName;
    this.OrganizationData.Address = row.Address;
    this.OrganizationData.City = row.City;
    this.OrganizationData.State = row.State;
    this.OrganizationData.Active = row.Active;
    this.OrganizationData.Country = row.Country;
    this.OrganizationData.Contact = row.Contact;
    this.OrganizationData.LogoPath = row.LogoPath;
    //this.OrganizationData. = row.LogoPath;

    if (this.OrganizationData.OrganizationId == 0) {
      this.OrganizationData["CreatedDate"] = new Date();
      this.OrganizationData["CreatedBy"] = this.UserId;
      this.OrganizationData["UpdatedDate"] = new Date();
      delete this.OrganizationData["UpdatedBy"];
      this.insert(row);
    }
    else {
      delete this.OrganizationData["CreatedDate"];
      delete this.OrganizationData["CreatedBy"];
      this.OrganizationData["UpdatedDate"] = new Date();
      this.OrganizationData["UpdatedBy"] = this.UserId;
      this.update(row);
    }
  }
  insert(row) {

    debugger;
    this.dataservice.postPatch(this.OrganizationListName, this.OrganizationData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.OrganizationId = data.OrganizationId;
          row.Action = false;
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }, error => {
          this.contentservice.openSnackBar("error occured. Please contact administrator.", globalconstants.ActionText,globalconstants.RedBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.OrganizationListName, this.OrganizationData, this.OrganizationData.OrganizationId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
        });
  }
  GetOrganization() {
    this.loading = true;
    let list: List = new List();
    list.fields = ["OrganizationId", "OrganizationName"];
    list.PageName = "Organizations";
    list.filter = ["Active eq 1"];
    //debugger;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Organizations = [...data.value];
        this.loading = false;
      });
  }
  GetOrganizationDetail() {
    debugger;
    this.OrganizationList = [];
    var filterstr = '';

    this.loading = true;

    var _searchCustomerId = this.searchForm.get("searchCustomerId").value;

    if (_searchCustomerId > 0)
      filterstr += "OrganizationId eq " + _searchCustomerId;

    let list: List = new List();
    list.fields = [
      "OrganizationId",
      "OrganizationName",
      "LogoPath",
      "Address",
      "City",
      "State",
      "Country",
      "Contact",
      "ValidFrom",
      "ValidTo",
      "Active",
      "CreatedDate"
    ];
    list.PageName = this.OrganizationListName;
    //list.lookupFields = [];
    list.filter = [filterstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //var customerapp;
        this.OrganizationList = [...data.value];
        this.dataSource = new MatTableDataSource<any>(this.OrganizationList);
        this.dataSource.paginator = this.paginator;
        this.loading = false;
      })
  }
  
  onBlur(element) {
    //debugger;
    element.Action = true;
    //element.Amount = element["AmountPerMonth"] * element.PaidMonths;
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
export interface IOrganization {
  OrganizationId: number;
  OrganizationName: '';
  LogoPath: '';
  Address: '';
  City: number;
  State: number;
  Country: number;
  Contact: '';
  ValidFrom: Date;
  ValidTo: Date;
  Active: number;
  ParentId: number;
  MainOrgId: number;
  CreatedDate: Date;
}

