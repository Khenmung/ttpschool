import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { IGeneralLedger } from '../ledger-account/ledger-account.component';

@Component({
  selector: 'app-accountnature',
  templateUrl: './accountnature.component.html',
  styleUrls: ['./accountnature.component.scss']
})
export class AccountNatureComponent implements OnInit {
  PageLoading = true;
  @ViewChild("table") mattable;
  @ViewChild(MatPaginator) paginator:MatPaginator;
  @ViewChild(MatSort) sort:MatSort;
  GeneralLedgers = [];
  AccountNatureListName = 'AccountNatures';
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  DummyMasterItemId = 4579;
  AccountingPeriod = {
    StartDate: new Date(),
    EndDate: new Date()
  }
  AccountNatures = [];
  Permission = '';
  StandardFilterWithBatchId = '';
  SelectedApplicationId = 0;
  loading = false;
  GLAccounts = [];
  CurrentBatchId = 0;
  SelectedBatchId = 0;
  AccountNatureList: IAccountNature[] = [];
  dataSource: MatTableDataSource<IAccountNature>;
  allMasterData = [];
  searchForm: FormGroup;
  AccountNatureData = {
    AccountNatureId: 0,
    AccountName: '',
    ParentId: 0,
    DebitType: false,
    OrgId: 0,
    Active: 0,
  };

  displayedColumns = [
    "AccountNatureId",
    "AccountName",
    "ParentId",
    "DebitType",
    "Active",
    "Action",
  ];
  filteredOptions: Observable<IGeneralLedger[]>;
  //Students: any;

  constructor(
    private datepipe: DatePipe,
    private fb: FormBuilder,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,

    private nav: Router,
    private contentservice: ContentService,
  ) { }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      searchDebitOrCredit: [false],
    });
    this.PageLoad();
  }

  PageLoad() {

    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();

    // this.filteredOptions = this.searchForm.get("searchGeneralLedgerId").valueChanges
    //   .pipe(
    //     startWith(''),
    //     map(value => typeof value === 'string' ? value : value.TeacherName),
    //     map(TeacherName => TeacherName ? this._filter(TeacherName) : this.GeneralLedgers.slice())
    //   );

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.accounting.ACCOUNTNATURE);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.GetTopAccountNature();

        this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
        this.GetGeneralLedgerAutoComplete();
      }
    }

  }
  private _filter(name: string): IAccountNature[] {

    const filterValue = name.toLowerCase();
    return this.GeneralLedgers.filter(option => option.GeneralLedgerName.toLowerCase().includes(filterValue));

  }
  displayFn(ledger: IGeneralLedger): string {
    return ledger && ledger.GeneralLedgerName ? ledger.GeneralLedgerName : '';
  }
  addnew() {
    //var debitcredit = debit == 'debit' ? 0 : 1
    var newdata = {
      AccountNatureId: 0,
      AccountName: '',
      DebitType: false,
      ParentId: 0,
      Active: 0,
      Action: true
    }
    this.AccountNatureList.push(newdata);
    this.dataSource = new MatTableDataSource<IAccountNature>(this.AccountNatureList);
  }

  GetAccountNature() {
    let filterStr = 'Active eq true and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    ////debugger;
    this.loading = true;

    var searchDebitOrCredit = this.searchForm.get("searchDebitOrCredit").value;

    if (searchDebitOrCredit != "") {
      filterStr += " and DebitType eq " + searchDebitOrCredit
    }

    let list: List = new List();
    list.fields = [
      "AccountNatureId",
      "AccountName",
      "ParentId",
      "DebitType",
      "Active",
    ];

    list.PageName = this.AccountNatureListName;
    list.filter = [filterStr];
    this.AccountNatureList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AccountNatureList = [...data.value];
        if (this.AccountNatureList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }
        this.dataSource = new MatTableDataSource<IAccountNature>(this.AccountNatureList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        
        this.loading = false;
        this.PageLoading = false;
      });
  }
  GetTopAccountNature() {
    let filterStr = 'ParentId eq 0 and Active eq true and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    this.loading = true;

    let list: List = new List();
    list.fields = [
      "AccountNatureId",
      "AccountName",
      "ParentId",
      "DebitType",
      "Active",
    ];

    list.PageName = this.AccountNatureListName;
    list.filter = [filterStr];
    //this.AccountNatures = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AccountNatures = [...data.value];

        this.loading = false;
        this.PageLoading = false;
      });
  }

  onBlur(row) {
    row.Action = true;
  }
  updateActive(row, value) {

    row.Active = value.checked;
    row.Action = true;
  }
  UpdateDebit(row, event) {
    if (event.checked)
      row.DebitType = true;
    else
      row.DebitType = false;
    this.onBlur(row);
  }

  UpdateOrSave(row) {

    //debugger;
    this.loading = true;
    let checkFilterString = "OrgId eq " + this.LoginUserDetail[0]["orgId"];
    if (row.AccountName.length == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter account name.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      checkFilterString += " and AccountName eq '" + row.AccountName + "'";

    }
    if (row.DebitType != undefined)
      " or DebitType eq " + row.DebitType


    if (row.AccountNatureId > 0)
      checkFilterString += " and AccountNatureId ne " + row.AccountNatureId;
    checkFilterString += " and " + globalconstants.getStandardFilter(this.LoginUserDetail);
    let list: List = new List();
    list.fields = ["AccountNatureId"];
    list.PageName = this.AccountNatureListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.AccountNatureData.Active = row.Active;
          this.AccountNatureData.AccountNatureId = row.AccountNatureId;
          this.AccountNatureData.AccountName = row.AccountName;
          this.AccountNatureData.ParentId = row.ParentId;
          this.AccountNatureData.DebitType = row.DebitType;
          this.AccountNatureData.OrgId = this.LoginUserDetail[0]["orgId"];

          if (row.AccountNatureId == 0) {
            this.AccountNatureData["CreatedDate"] = new Date();
            this.AccountNatureData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.AccountNatureData["UpdatedDate"];
            delete this.AccountNatureData["UpdatedBy"];
            console.log('to insert', this.AccountNatureData)
            this.insert(row);
          }
          else {
            delete this.AccountNatureData["CreatedDate"];
            delete this.AccountNatureData["CreatedBy"];
            this.AccountNatureData["UpdatedDate"] = new Date();
            this.AccountNatureData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            console.log('to update', this.AccountNatureData)
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.AccountNatureListName, this.AccountNatureData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false;
          this.PageLoading = false;
          row.Action = false;
          row.AccountNatureId = data.AccountNatureId;

          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.AccountNatureListName, this.AccountNatureData, this.AccountNatureData.AccountNatureId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          row.Action = false;

          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }



  GetGeneralLedgerAutoComplete() {

    let list: List = new List();
    list.fields = [
      "GeneralLedgerId",
      "GeneralLedgerName",
      "AccountNatureId",
      "AccountGroupId"
    ];

    list.PageName = "GeneralLedgers";
    list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    this.GLAccounts = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.GeneralLedgers = [...data.value];
        this.loading = false; this.PageLoading = false;
      })
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.loading = false; this.PageLoading = false;
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
export interface IAccountNature {
  AccountNatureId: number;
  AccountName: string;
  ParentId: number;
  DebitType: boolean
  Active: number;
  Action: boolean
}


