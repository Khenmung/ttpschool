import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import alasql from 'alasql';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { IAccountingVoucher } from '../JournalEntry/JournalEntry.component';

@Component({
  selector: 'app-trial-balance',
  templateUrl: './trial-balance.component.html',
  styleUrls: ['./trial-balance.component.scss']
})
export class TrialBalanceComponent implements OnInit {
  PageLoading = true;


  @ViewChild("table") mattable;
  //@ViewChild(ClasssubjectComponent) classSubjectAdd: ClasssubjectComponent;
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
  AccountingPeriod = [];
  SelectedApplicationId = 0;
  Permission = '';
  StandardFilterWithBatchId = '';
  loading = false;
  GLAccounts = [];
  CurrentBatchId = 0;
  SelectedBatchId = 0;
  AccountingVoucherList: IAccountingVoucher[] = [];
  dataSource: MatTableDataSource<IAccountingVoucher>;
  allMasterData = [];
  searchForm: FormGroup;
  //ClassSubjectId = 0;
  AccountingVoucherData = {
    AccountingVoucherId: 0,
    DocDate: new Date(),
    PostingDate: new Date(),
    Reference: '',
    LedgerId: 0,
    Debit: false,
    Amount: '',
    ShortText: '',
    OrgId: 0,
    SubOrgId: 0,
    Active: 0,
  };

  displayedColumns = [
    "DocDate",
    "PostingDate",
    "Reference",
    "LedgerId",
    "Debit",
    "Amount",
    "ShortText",
    "Active",
    "Action",
  ];
  //filteredOptions: Observable<IGLAccounts[]>;
  //Students: any;

  constructor(
    private datepipe: DatePipe,
    private fb: FormBuilder,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,

    private route: ActivatedRoute,
    private nav: Router,
    private contentservice: ContentService,
  ) { }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      searchSubjectTeacherId: [0],
      searchClassId: [0]
    });
    this.PageLoad();
    //        this.GetTeachers();
  }
  // private _filter(name: string): ITeachers[] {

  //   const filterValue = name.toLowerCase();
  //   return this.Teachers.filter(option => option.TeacherName.toLowerCase().includes(filterValue));

  // }
  // displayFn(teacher: ITeachers): string {
  //   return teacher && teacher.TeacherName ? teacher.TeacherName : '';
  // }

  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
      this.AccountingPeriod = JSON.parse(this.tokenstorage.getSelectedBatchStartEnd());

      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.accounting.TRIALBALANCE);
      if (perObj.length > 0) {

        this.Permission = perObj[0].permission;
        if (this.Permission != 'deny') {
          this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
          //this.GetMasterData();
          this.GetGLAccounts();
        }

      }
    }
  }
  updateDebitCredit(row, event) {
    row.Active = event.checked ? 1 : 0;
    row.Action = true;
  }
  addnew() {
    var newdata = {
      AccountingVoucherId: 0,
      DocDate: new Date(),
      PostingDate: new Date(),
      Reference: '',
      LedgerId: 0,
      Debit: false,
      Amount: '',
      ShortText: '',
      Active: 0,
      Action: true
    }
    //this.AccountingVoucherList.push(newdata);
    this.dataSource = new MatTableDataSource<IAccountingVoucher>(this.AccountingVoucherList);
  }

  GetAccountingVoucher() {
    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    debugger;
    this.loading = true;

    //filterStr += " and PostingDate ge datetime'" + this.datepipe.transform(this.AccountingPeriod[0].StartDate, 'yyyy-MM-dd') + //T00:00:00.000Z
    //  "' and  PostingDate le datetime'" + this.datepipe.transform(this.AccountingPeriod[0].EndDate, 'yyyy-MM-dd') + "'";//T00:00:00.000Z
    // if (_ClassId != 0)
    //   filterStr += " and ClassId eq " + _ClassId;

    let list: List = new List();
    list.fields = [
      "AccountingVoucherId",
      //"DocDate",
      //"PostingDate",
      "GeneralLedgerAccountId",
      "Reference",
      "LedgerId",
      "Debit",
      "Amount",
      //"ShortText",
      "Active",
    ];

    list.PageName = this.AccountingVoucherListName;
    //list.lookupFields = ["AccountingTrialBalance"];
    list.filter = [filterStr];
    this.AccountingVoucherList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //this.AccountingVoucherList = 
        console.log("data.value", data.value);
        data.value.forEach(f => {
          var _generalaccount = this.GLAccounts.filter(g => g.GeneralLedgerId == f.GeneralLedgerAccountId);
          if (_generalaccount.length > 0) {
            f.AccountName = _generalaccount[0].GeneralLedgerName;
            f.DebitAccount = _generalaccount[0].DebitAccount;
            f.AccountGroupId = _generalaccount[0].AccountGroupId;
            f.AccountSubGroupId = _generalaccount[0].AccountSubGroupId;
            f.AccountNatureId = _generalaccount[0].AccountNatureId;
            this.AccountingVoucherList.push(f);
          }
        })
        console.log("this.AccountingVoucherList", this.AccountingVoucherList)
        var sum = alasql("select sum(Amount),Debit,GeneralLedgerAccountId from ? GROUP BY GeneralLedgerAccountId,Debit", [this.AccountingVoucherList])
        console.log("sum", sum);
        this.dataSource = new MatTableDataSource<IAccountingVoucher>(this.AccountingVoucherList);
        this.loading = false; this.PageLoading = false;
        //this.changeDetectorRefs.detectChanges();
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


    this.AccountingVoucherData.Active = row.Active;
    this.AccountingVoucherData.AccountingVoucherId = row.AccountingVoucherId;
    this.AccountingVoucherData.Amount = row.Amount;
    this.AccountingVoucherData.DocDate = row.DocDate;
    this.AccountingVoucherData.Debit = row.Debit;
    this.AccountingVoucherData.PostingDate = row.PostingDate;
    this.AccountingVoucherData.Reference = row.Reference;
    this.AccountingVoucherData.LedgerId = row.LedgerId;
    this.AccountingVoucherData.ShortText = row.ShortText;
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
    //        }
    //      });

  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.AccountingVoucherListName, this.AccountingVoucherData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          row.AccountingVoucherId = data.AccountingVoucherId;
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


  GetGLAccounts() {

    let list: List = new List();
    list.fields = [
      "GeneralLedgerId",
      "GeneralLedgerName",
      "AccountNatureId",
      "AccountGroupId",
      "AccountSubGroupId",
      "Active"
    ];

    list.PageName = "GeneralLedgers";
    list.lookupFields = ["AccountNature($select=Active,AccountNatureId,DebitType)"];
    list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    this.GLAccounts = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        data.value.forEach(f => {

          if (f.AccountNature.Active == true) {
            f.DebitAccount = f.AccountNature.DebitType
            this.GLAccounts.push(f)
          }
        });
        this.GetAccountingVoucher();
        //this.loading = false; this.PageLoading = false;
      })
  }
  GetAccountingPeriod() {

    let list: List = new List();
    list.fields = [
      "AccountingPeriodId",
      "StartDate",
      "EndDate"
    ];

    list.PageName = "AccountingPeriods";
    list.filter = ["CurrentPeriod eq 1 and Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    this.GLAccounts = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AccountingPeriod = data.value.map(f => {
          return {
            StartDate: f.StartDate,
            EndDate: f.EndDate
          }
        });

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
export interface ITrialBalance {
  AccountingTrialBalanceId: number;
  GeneralLedger: string;
  AccountGroupId: number;
  AccountNatureId: number;
  DebitCreditId: number;
  Balance: number;
  DepartmentId: number;
  Active: number;
  Action: boolean
}


