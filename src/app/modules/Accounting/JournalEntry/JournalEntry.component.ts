import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { IGeneralLedger } from '../ledgeraccount/ledgeraccount.component';
import { SwUpdate } from '@angular/service-worker';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-JournalEntry',
  templateUrl: './JournalEntry.component.html',
  styleUrls: ['./JournalEntry.component.scss']
})
export class JournalEntryComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  PageLoading = true;
  @ViewChild("table") mattable;
  GeneralLedgers = [];
  AccountingVoucherListName = 'AccountingVouchers';
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  DummyMasterItemId = 4579;
  AccountingPeriod = {
    StartDate: new Date(),
    EndDate: new Date()
  }
  ParentId = 0;
  Permission = '';
  StandardFilterWithBatchId = '';
  SelectedApplicationId = 0;
  loading = false;
  GLAccounts = [];
  CurrentBatchId = 0;
  SelectedBatchId = 0;
  AccountingVoucherList: IAccountingVoucher[] = [];
  dataSource: MatTableDataSource<IAccountingVoucher>;
  allMasterData = [];
  searchForm: UntypedFormGroup;
  AccountingVoucherData = {
    AccountingVoucherId: 0,
    DocDate: new Date(),
    PostingDate: new Date(),
    Reference: '',
    FeeReceiptId: 0,
    ParentId: 0,
    ClassFeeId: 0,
    LedgerId: 0,
    GeneralLedgerAccountId: 0,
    Debit: 0,
    BaseAmount: 0,
    Amount: 0,
    ShortText: '',
    OrgId: 0,
    Active: 0,
  };

  displayedColumns = [
    //"DocDate",
    "PostingDate",
    "GeneralLedgerAccountId",
    "ShortText",
    "Reference",
    "BaseAmount",
    "Debit",
    "Active",
    "Action",
  ];
  filteredOptions: Observable<IGeneralLedger[]>;
  //Students: any;

  constructor(private servicework: SwUpdate,
    private datepipe: DatePipe,
    private fb: UntypedFormBuilder,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,

    private nav: Router,
    private contentservice: ContentService,
  ) { }

  ngOnInit(): void {
    this.servicework.activateUpdate().then(() => {
      this.servicework.checkForUpdate().then((value) => {
        if (value) {
          location.reload();
        }
      })
    })
    this.searchForm = this.fb.group({
      searchGeneralLedgerId: [0],
      //searchReferenceId: [''],
      searchShortText: [''],
      //searchPostingDate:[new Date()]
    });
    this.PageLoad();
    //        this.GetTeachers();
  }

  PageLoad() {

    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();

    this.filteredOptions = this.searchForm.get("searchGeneralLedgerId").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.GeneralLedgerName),
        map(GeneralLedgerName => GeneralLedgerName ? this._filter(GeneralLedgerName) : this.GeneralLedgers.slice())
      );

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.accounting.JOURNALENTRY);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;

      this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
      this.GetGeneralLedgerAutoComplete();
    }
  }
  private _filter(name: string): IAccountingVoucher[] {

    const filterValue = name.toLowerCase();
    return this.GeneralLedgers.filter(option => option.GeneralLedgerName.toLowerCase().includes(filterValue));

  }
  displayFn(ledger: IGeneralLedger): string {
    return ledger && ledger.GeneralLedgerName ? ledger.GeneralLedgerName : '';
  }
  addnew(debit) {
    //var debitcredit = debit == 'debit' ? 0 : 1
    var newdata = {
      AccountingVoucherId: 0,
      DocDate: new Date(),
      PostingDate: new Date(),
      Reference: '',
      FeeReceiptId: 0,
      ParentId: 0,
      ClassFeeId: 0,
      LedgerId: 0,
      GeneralLedgerAccountId: this.searchForm.get("searchGeneralLedgerId").value.GeneralLedgerId,
      Debit: false,
      BaseAmount: 0,
      Amount: 0,
      ShortText: this.searchForm.get("searchShortText").value,
      Active: 0,
      Action: true
    }
    this.AccountingVoucherList = [];
    this.AccountingVoucherList.push(newdata);
    this.dataSource = new MatTableDataSource<IAccountingVoucher>(this.AccountingVoucherList);
  }

  GetAccountingVoucher() {
    let filterStr = 'LedgerId eq 0 and Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    debugger;
    this.loading = true;
    var FinancialStartEnd = JSON.parse(this.tokenstorage.getSelectedBatchStartEnd());
    filterStr += " and PostingDate ge " + this.datepipe.transform(FinancialStartEnd.StartDate, 'yyyy-MM-dd') + //T00:00:00.000Z
      " and  PostingDate le " + this.datepipe.transform(FinancialStartEnd.EndDate, 'yyyy-MM-dd');//T00:00:00.000Z

    var AccountId = this.searchForm.get("searchGeneralLedgerId").value.GeneralLedgerId == undefined ? 0 : this.searchForm.get("searchGeneralLedgerId").value.GeneralLedgerId;
    if (AccountId != 0) {
      filterStr += " and GeneralLedgerAccountId eq " + AccountId
    }
    // var referenceId = this.searchForm.get("searchReferenceId").value;
    // if (referenceId != null && referenceId != "") {
    //   filterStr += " and Reference eq '" + referenceId + "'"
    // }
    var shorttext = this.searchForm.get("searchShortText").value;
    if (shorttext != "") {
      filterStr += " and ShortText eq '" + shorttext + "'"
    }

    let list: List = new List();
    list.fields = [
      "AccountingVoucherId",
      "DocDate",
      "PostingDate",
      "GeneralLedgerAccountId",
      "Reference",
      "FeeReceiptId",
      "ParentId",
      "ClassFeeId",
      "LedgerId",
      "Debit",
      "BaseAmount",
      "Amount",
      "ShortText",
      "Active",
    ];

    list.PageName = this.AccountingVoucherListName;
    //list.limitTo = 50;
    //list.orderBy = "ShortText";
    //list.lookupFields = ["AccountingLedgerTrialBalance"];
    list.filter = ["GeneralLedgerAccountId ne null and " + filterStr];
    this.AccountingVoucherList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AccountingVoucherList = [...data.value];
        if (this.AccountingVoucherList.length == 0) {
          this.addnew('debit');
        }
        else {
          //var shorttext = this.searchForm.get("searchShortText").value;
          if (shorttext == '')
            this.searchForm.patchValue({
              searchShortText: this.AccountingVoucherList[0].ShortText
            });
          // if (referenceId == '')
          //   this.searchForm.patchValue({
          //     searchReferenceId: this.AccountingVoucherList[0].Reference
          //   });
          this.dataSource = new MatTableDataSource<IAccountingVoucher>(this.AccountingVoucherList);
          this.dataSource.paginator = this.paginator;
        }

        this.loading = false; this.PageLoading = false;
      });
  }
  onBlur(row) {
    row.Action = true;
  }
  updateActive(row, value) {

    row.Active = value.checked ? 1 : 0;
    row.Action = true;
  }
  UpdateDebit(row, event) {
    if (event.checked)
      row.Debit = true;
    else
      row.Debit = false;
    this.onBlur(row);
  }
  // delete(element) {
  //   let toupdate = {
  //     Active: element.Active == 1 ? 0 : 1
  //   }
  //   this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
  //     .subscribe(
  //       (data: any) => {
  //         // this.GetApplicationRoles();
  //         this.contentservice.openSnackBar(globalconstants.DeletedMessage,globalconstants.ActionText,globalconstants.BlueBackground);

  //       });
  // }
  ClearShorttext() {
    this.searchForm.patchValue({ "searchShortText": "" });
  }
  UpdateOrSave(row) {

    //debugger;
    var errorMessage = '';
    var reference = '';
    if (row.GeneralLedgerAccountId == 0)
      errorMessage += 'Please select one of the accounts<br>';
    if (row.Reference == '') {
      this.contentservice.openSnackBar("Please enter reference.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else
      reference = row.Reference;

    if (row.ShortText.length == 0) {
      this.contentservice.openSnackBar(errorMessage, globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.Amount > 1000000 || row.Amount < -1000000)
      errorMessage += "Amount should be less than 10,00,000 or greater than -10,00,000<br>";

    if (errorMessage.length > 0) {
      this.loading = false; this.PageLoading = false;
      //this.contentservice.openSnackBar(errorMessage,globalconstants.ActionText,globalconstants.RedBackground);
      this.contentservice.openSnackBar(errorMessage, globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let checkFilterString = "GeneralLedgerAccountId eq " + row.GeneralLedgerAccountId +
      " and Reference eq '" + reference + "'";


    if (row.AccountingVoucherId > 0)
      checkFilterString += " and AccountingVoucherId ne " + row.AccountingVoucherId;
    checkFilterString += " and " + globalconstants.getStandardFilter(this.LoginUserDetail);
    let list: List = new List();
    list.fields = ["AccountingVoucherId"];
    list.PageName = this.AccountingVoucherListName;
    list.filter = [checkFilterString];
    this.loading = true;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.AccountingVoucherData.Active = row.Active;
          this.AccountingVoucherData.AccountingVoucherId = row.AccountingVoucherId;
          this.AccountingVoucherData.BaseAmount = +row.BaseAmount;
          this.AccountingVoucherData.Amount = +row.Amount;
          this.AccountingVoucherData.DocDate = row.DocDate;
          this.AccountingVoucherData.Debit = row.Debit;
          this.AccountingVoucherData.PostingDate = row.PostingDate;
          this.AccountingVoucherData.Reference = reference;
          this.AccountingVoucherData.LedgerId = row.LedgerId;
          this.AccountingVoucherData.GeneralLedgerAccountId = row.GeneralLedgerAccountId;
          this.AccountingVoucherData.ClassFeeId = 0;
          this.AccountingVoucherData.FeeReceiptId = 0;
          this.AccountingVoucherData.ParentId = this.ParentId;
          this.AccountingVoucherData.ShortText = row.ShortText;
          this.AccountingVoucherData.OrgId = this.LoginUserDetail[0]["orgId"];

          if (row.AccountingVoucherId == 0) {
            this.AccountingVoucherData["CreatedDate"] = new Date();
            this.AccountingVoucherData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.AccountingVoucherData["UpdatedDate"];
            delete this.AccountingVoucherData["UpdatedBy"];
            console.log('to insert', this.AccountingVoucherData)
            this.insert(row);
          }
          else {
            delete this.AccountingVoucherData["CreatedDate"];
            delete this.AccountingVoucherData["CreatedBy"];
            this.AccountingVoucherData["UpdatedDate"] = new Date();
            this.AccountingVoucherData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            console.log('to update', this.AccountingVoucherData)
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.AccountingVoucherListName, this.AccountingVoucherData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          row.AccountingVoucherId = data.AccountingVoucherId;
          this.ParentId = data.ParentId;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.AccountingVoucherListName, this.AccountingVoucherData, this.AccountingVoucherData.AccountingVoucherId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;


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

    this.allMasterData = this.tokenstorage.getMasterData();
    this.loading = false; this.PageLoading = false;
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
export interface IAccountingVoucher {
  AccountingVoucherId: number;
  DocDate: Date;
  PostingDate: Date;
  Reference: string;
  LedgerId: number;
  GeneralLedgerAccountId: number;
  ParentId: number;
  Debit: boolean;
  Amount: number;
  BaseAmount: number;
  ShortText: string;
  Active: number;
  Action: boolean
}


