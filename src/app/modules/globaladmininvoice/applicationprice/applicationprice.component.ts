import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
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
  //ReportNames = [];
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
  SelectedApplicationId=0;
  searchForm: FormGroup;
  constructor(
    private contentservice:ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    
    private nav: Router,
    private fb: FormBuilder
  ) {

  }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchApplicationId: [0]
    });
    this.dataSource = new MatTableDataSource<IApplicationPrice>([]);
    this.PageLoad();
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      this.GetMasterData();

    }
  }
  updateActive(row, value) {

    row.Action = true;
    row.Active = value.checked ? 1 : 0;

  }

  UpdateOrSave(row) {
    
    if(row.PCPM<1)
    {
      this.contentservice.openSnackBar("Please enter PCPM.",globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }

    this.loading=true;
    this.ApplicationPriceData.ApplicationPriceId = row.ApplicationPriceId;
    this.ApplicationPriceData.ApplicationId = row.ApplicationId;
    this.ApplicationPriceData.MinCount = row.MinCount;
    this.ApplicationPriceData.MinPrice = row.MinPrice;
    this.ApplicationPriceData.CurrencyId = row.CurrencyId;
    this.ApplicationPriceData.Description = row.Description;
    this.ApplicationPriceData.PCPM = row.PCPM;
    this.ApplicationPriceData.Active = row.Active;
    this.ApplicationPriceData.OrgId = this.LoginUserDetail[0]["orgId"];

    //console.log('data', this.ApplicationPriceData);
    if (this.ApplicationPriceData.ApplicationPriceId == 0) {
      this.ApplicationPriceData["CreatedDate"] = new Date();
      this.ApplicationPriceData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
      this.ApplicationPriceData["UpdatedDate"] = new Date();
      delete this.ApplicationPriceData["UpdatedBy"];
      ////console.log('exam slot', this.SchoolClassPeriodListData)
      this.insert(row);
    }
    else {
      delete this.ApplicationPriceData["CreatedDate"];
      delete this.ApplicationPriceData["CreatedBy"];
      this.ApplicationPriceData["UpdatedDate"] = new Date();
      this.ApplicationPriceData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
      this.update(row);
    }
  }

  insert(row) {

    this.dataservice.postPatch(this.ApplicationPriceListName, this.ApplicationPriceData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ApplicationPriceId = data.ApplicationPriceId;
          row.Action = false;
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.ApplicationPriceListName, this.ApplicationPriceData, this.ApplicationPriceData.ApplicationPriceId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
        });
  }

  GetApplicationPrice() {

    this.ApplicationPriceList = [];
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];// + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 ';
   

    this.loading = true;
    var _searchAppId = this.searchForm.get("searchApplicationId").value;

    if (_searchAppId > 0)
      filterstr += " and ApplicationId eq " + _searchAppId;

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
    list.filter = [filterstr + orgIdSearchstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        if (_searchAppId > 0)
          this.ApplicationPriceList = data.value.map(e=>{
            e.ApplicationName = this.Applications.filter(a=>a.MasterDataId==e.ApplicationId)[0].Description;
            return e;
          });
        else {
          this.Applications.forEach(a => {
            var existing = data.value.filter(f => f.ApplicationId == a.MasterDataId);
            if (existing.length > 0) {
              existing[0].Action = false;
              existing[0].ApplicationName = a.Description;
              this.ApplicationPriceList.push(existing[0]);
            }
            else {
              this.ApplicationPriceList.push({
                "ApplicationPriceId": 0,
                "ApplicationId": a.MasterDataId,
                "ApplicationName": a.Description,
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
        }
        //console.log('app',this.ApplicationPriceList)
        this.dataSource = new MatTableDataSource<any>(this.ApplicationPriceList);
        this.loading = false;
      })
  }


  onBlur(element) {
    element.Action = true;
  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"],this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Currencies = this.getDropDownData(globalconstants.MasterDefinitions.common.CURRENCY);
        this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.bang);

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






