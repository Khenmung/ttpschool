import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
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
  selector: 'app-JournalEntry',
  templateUrl: './JournalEntry.component.html',
  styleUrls: ['./JournalEntry.component.scss']
})
export class JournalEntryComponent implements OnInit {


  @ViewChild("table") mattable;
  GeneralLedgers = [];
  AccountingVoucherListName = 'AccountingVouchers';
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  DummyMasterItemId = 4579;
  AccountingPeriod = {
    StartDate: new Date(),
    EndDate: new Date()
  }
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
  searchForm: FormGroup;
  AccountingVoucherData = {
    AccountingVoucherId: 0,
    DocDate: new Date(),
    PostingDate: new Date(),
    Reference: '',
    FeeReceiptId: 0,
    ClassFeeId: 0,
    LedgerId: 0,
    GeneralLedgerAccountId: 0,
    DebitCreditId: 0,
    Amount: 0,
    ShortText: '',
    OrgId: 0,
    Active: 0,
  };

  displayedColumns = [
    "DocDate",
    "PostingDate",
    "GeneralLedgerAccountId",
    "Amount",
    "DebitCreditId",
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
      searchGeneralLedgerId: [0],
      searchReferenceId: [''],
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
        map(value => typeof value === 'string' ? value : value.TeacherName),
        map(TeacherName => TeacherName ? this._filter(TeacherName) : this.GeneralLedgers.slice())
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
    var debitcredit = debit == 'debit' ? 0 : 1
    var newdata = {
      AccountingVoucherId: 0,
      DocDate: new Date(),
      PostingDate: new Date(),
      Reference: this.searchForm.get("searchReferenceId").value,
      FeeReceiptId: 0,
      ClassFeeId: 0,
      LedgerId: 0,
      GeneralLedgerAccountId: this.searchForm.get("searchGeneralLedgerId").value.GeneralLedgerId,
      DebitCreditId: debitcredit,
      Amount: 0,
      ShortText: this.searchForm.get("searchShortText").value,
      Active: 0,
      Action: true
    }
    this.AccountingVoucherList.push(newdata);
    this.dataSource = new MatTableDataSource<IAccountingVoucher>(this.AccountingVoucherList);
  }
  updateDebitCredit(element, val) { }
  GetAccountingVoucher() {
    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    ////debugger;
    this.loading = true;
    var FinancialStartEnd = JSON.parse(this.tokenstorage.getSelectedBatchStartEnd());
    filterStr += " and PostingDate ge " + this.datepipe.transform(FinancialStartEnd.StartDate, 'yyyy-MM-dd') + //T00:00:00.000Z
      " and  PostingDate le " + this.datepipe.transform(FinancialStartEnd.EndDate, 'yyyy-MM-dd');//T00:00:00.000Z

    var AccountId = this.searchForm.get("searchGeneralLedgerId").value.GeneralLedgerId == undefined ? 0 : this.searchForm.get("searchGeneralLedgerId").value.GeneralLedgerId;
    if (AccountId != 0) {
      filterStr += " and GeneralLedgerAccountId eq " + AccountId
    }
    var referenceId = this.searchForm.get("searchReferenceId").value;
    if (referenceId != "") {
      filterStr += " and Reference eq '" + referenceId + "'"
    }
    var shorttext = this.searchForm.get("searchShortText").value;
    if (shorttext != "") {
      filterStr += " and ShortText eq '" + shorttext + "'"
    }
    // if(this.searchForm.get("searchPostingDate").value!="")
    // {
    //   filterStr += " and PostingDate eq " + this.datepipe.transform(this.searchForm.get("searchPostingDate").value,'dd/MM/yyyy');
    // }

    let list: List = new List();
    list.fields = [
      "AccountingVoucherId",
      "DocDate",
      "PostingDate",
      "GeneralLedgerAccountId",
      "Reference",
      "FeeReceiptId",
      "ClassFeeId",
      "LedgerId",
      "DebitCreditId",
      "Amount",
      "ShortText",
      "Active",
    ];

    list.PageName = this.AccountingVoucherListName;
    list.limitTo = 50;
    list.orderBy ="Reference";
    //list.lookupFields = ["AccountingLedgerTrialBalance"];
    list.filter = [filterStr];
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
          if (referenceId == '')
            this.searchForm.patchValue({
              searchReferenceId: this.AccountingVoucherList[0].Reference
            });
          this.dataSource = new MatTableDataSource<IAccountingVoucher>(this.AccountingVoucherList);

        }

        this.loading = false;
      });
  }
  onBlur(row) {
    row.Action = true;
  }
  updateActive(row, value) {

    row.Active = value.checked ? 1 : 0;
    row.Action = true;
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

  UpdateOrSave(row) {

    //debugger;
    this.loading = true;
    var errorMessage = '';
    var reference = '';
    if (row.GeneralLedgerAccountId == 0)
      errorMessage += 'Please select one of the accounts<br>';
    if (row.Reference == '')
      errorMessage += "Please enter reference.<br>";
    else
      reference = this.searchForm.get("searchReferenceId").value;

    if (row.Amount > 1000000 || row.Amount < -1000000)
      errorMessage += "Amount should be less than 10,00,000 or greater than -10,00,000<br>";

    if (errorMessage.length > 0) {
      this.loading = false;
      //this.contentservice.openSnackBar(errorMessage,globalconstants.ActionText,globalconstants.RedBackground);
      this.contentservice.openSnackBar(errorMessage,globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }

    let checkFilterString = "GeneralLedgerAccountId eq " + row.GeneralLedgerAccountId +
      " and Reference eq '" + reference + "'";


    if (row.AccountingVoucherId > 0)
      checkFilterString += " and AccountingVoucherId ne " + row.AccountingVoucherId;
    checkFilterString += " and " + globalconstants.getStandardFilter;
    let list: List = new List();
    list.fields = ["AccountingVoucherId"];
    list.PageName = this.AccountingVoucherListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;        
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage,globalconstants.ActionText,globalconstants.RedBackground);
        }
        else {

          this.AccountingVoucherData.Active = row.Active;
          this.AccountingVoucherData.AccountingVoucherId = row.AccountingVoucherId;
          this.AccountingVoucherData.Amount = +row.Amount;
          this.AccountingVoucherData.DocDate = row.DocDate;
          this.AccountingVoucherData.DebitCreditId = row.DebitCreditId;
          this.AccountingVoucherData.PostingDate = row.PostingDate;
          this.AccountingVoucherData.Reference = reference;
          this.AccountingVoucherData.LedgerId = row.LedgerId;
          this.AccountingVoucherData.GeneralLedgerAccountId = row.GeneralLedgerAccountId;
          this.AccountingVoucherData.ClassFeeId = 0;
          this.AccountingVoucherData.FeeReceiptId = 0;
          this.AccountingVoucherData.ShortText = this.searchForm.get("searchShortText").value;
          this.AccountingVoucherData.OrgId = this.LoginUserDetail[0]["orgId"];
          if (row.AccountingVoucherId == 0) {
            this.AccountingVoucherData["CreatedDate"] = new Date();
            this.AccountingVoucherData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.AccountingVoucherData["UpdatedDate"];
            delete this.AccountingVoucherData["UpdatedBy"];
            //console.log('to insert', this.AccountingVoucherData)
            this.insert(row);
          }
          else {
            delete this.AccountingVoucherData["CreatedDate"];
            delete this.AccountingVoucherData["CreatedBy"];
            this.AccountingVoucherData["UpdatedDate"] = new Date();
            this.AccountingVoucherData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            //console.log('to update', this.AccountingVoucherData)
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
          this.loading = false;
          row.AccountingVoucherId = data.AccountingVoucherId;
          
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.AccountingVoucherListName, this.AccountingVoucherData, this.AccountingVoucherData.AccountingVoucherId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;

          
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
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
        this.loading = false;
      })
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
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
export interface IAccountingVoucher {
  AccountingVoucherId: number;
  DocDate: Date;
  PostingDate: Date;
  Reference: string;
  LedgerId: number;
  GeneralLedgerAccountId: number;
  DebitCreditId: number;
  Amount: number;
  ShortText: string;
  Active: number;
  Action: boolean
}


