import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-ledger-account',
  templateUrl: './ledger-account.component.html',
  styleUrls: ['./ledger-account.component.scss']
})
export class GeneralLedgerComponent implements OnInit {
  PageLoading = true;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  SelectedApplicationId = 0;
  StudentClassId = 0;
  Permission = '';
  StandardFilter = '';
  loading = false;
  GeneralLedgerList: IGeneralLedger[] = [];
  SelectedBatchId = 0;
  TopAccountNatures=[];
  AccountNatures = [];
  AccountGroups = [];
  GeneralLedgerAutoComplete = [];
  AccountNatureList=[];
  filteredOptions: Observable<IGeneralLedger[]>;
  dataSource: MatTableDataSource<IGeneralLedger>;
  allMasterData = [];

  ExamId = 0;
  GeneralLedgerData = {
    GeneralLedgerId: 0,
    GeneralLedgerName: '',
    ContactNo: '',
    ContactName: '',
    Email: '',
    Address: '',
    AccountNatureId: 0,
    AccountGroupId: 0,
    OrgId: 0,
    Active: 0
  };
  GeneralLedgerForUpdate = [];
  displayedColumns = [
    'GeneralLedgerId',
    'GeneralLedgerName',
    'AccountNatureId',
    'AccountGroupId',
    'ContactNo',
    'ContactName',
    'Email',
    'Address',
    'Active',
    'Action'
  ];
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,

    private nav: Router,
    private shareddata: SharedataService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchLedgerName: [0],
      searchAccountNatureId: [0],
      searchAccountGroupId: [0]
    });
    this.filteredOptions = this.searchForm.get("searchLedgerName").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.GeneralLedgerName),
        map(GeneralLedgerName => GeneralLedgerName ? this._filter(GeneralLedgerName) : this.GeneralLedgerAutoComplete.slice())
      );
    //this.StudentClassId = this.tokenstorage.getStudentClassId();
    this.PageLoad();
  }
  private _filter(name: string): IGeneralLedger[] {

    const filterValue = name.toLowerCase();
    return this.GeneralLedgerAutoComplete.filter(option => option.GeneralLedgerName.toLowerCase().includes(filterValue));

  }
  displayFn(ledger: IGeneralLedger): string {
    return ledger && ledger.GeneralLedgerName ? ledger.GeneralLedgerName : '';
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.STUDENT.STUDENTAPROFILE)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      debugger;
      if (this.Permission != 'deny') {
        this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
        this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
        this.GetMasterData();
        this.GetAccountNature();
        this.GetGeneralLedgerAutoComplete();
      }
    }
  }

  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {
          // this.GetApplicationRoles();

          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  AddNew() {
    var newItem = {
      GeneralLedgerId: 0,
      GeneralLedgerName: '',
      AccountSubGroupId: 0,
      AccountNatureId: this.searchForm.get("searchAccountNatureId").value,
      AccountGroupId: this.searchForm.get("searchAccountGroupId").value,
      AccountGroups: this.AccountGroups,
      ContactNo: '',
      ContactName: '',
      Email: '',
      Address: '',
      OrgId: 0,
      Active: 0,
      Action: false
    }
    this.GeneralLedgerList = [];
    this.GeneralLedgerList.push(newItem);
    this.dataSource = new MatTableDataSource(this.GeneralLedgerList);
  }
  UpdateOrSave(row) {

    //debugger;
    this.loading = true;
    let checkFilterString = this.StandardFilter;
    if (row.AccountNatureId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select account nature.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      checkFilterString += ' and AccountNatureId eq ' + row.AccountNatureId;
    }
    if (row.AccountGroupId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select account group.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      checkFilterString += ' and AccountGroupId eq ' + row.AccountGroupId;
    }
    if (row.GeneralLedgerName.length == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please enter account name.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      checkFilterString += " and GeneralLedgerName eq '" + row.GeneralLedgerName + "'";
    }
    if (row.AccountSubGroupId > 0) {
      checkFilterString += " and AccountSubGroupId eq " + row.AccountSubGroupId;
    }

    if (row.GeneralLedgerId > 0)
      checkFilterString += " and GeneralLedgerId ne " + row.GeneralLedgerId;

    let list: List = new List();
    list.fields = ["GeneralLedgerId"];
    list.PageName = "GeneralLedgers";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
          this.GeneralLedgerForUpdate = [];;
          this.GeneralLedgerData.GeneralLedgerId = row.GeneralLedgerId;
          this.GeneralLedgerData.AccountNatureId = row.AccountNatureId;
          this.GeneralLedgerData.AccountGroupId = row.AccountGroupId;
          // this.GeneralLedgerData.AccountSubGroupId = row.AccountSubGroupId==null?0:row.AccountSubGroupId;          
          this.GeneralLedgerData.GeneralLedgerName = row.GeneralLedgerName;
          this.GeneralLedgerData.ContactNo = row.ContactNo;
          this.GeneralLedgerData.ContactName = row.ContactName;
          this.GeneralLedgerData.Email = row.Email;
          this.GeneralLedgerData.Address = row.Address;
          
          this.GeneralLedgerData.Active = row.Active;
          this.GeneralLedgerData.OrgId = this.LoginUserDetail[0]["orgId"];


          if (this.GeneralLedgerData.GeneralLedgerId == 0) {
            this.GeneralLedgerData["CreatedDate"] = new Date();
            this.GeneralLedgerData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.GeneralLedgerData["UpdatedDate"] = new Date();
            delete this.GeneralLedgerData["UpdatedBy"];
            console.log("inserting1",this.GeneralLedgerData);
            this.insert(row);
          }
          else {
            this.GeneralLedgerData["CreatedDate"] = new Date();
            this.GeneralLedgerData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.GeneralLedgerData["UpdatedDate"] = new Date();
            delete this.GeneralLedgerData["UpdatedBy"];
            console.log("inserting2",this.GeneralLedgerData);
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {
    //console.log("inserting",this.GeneralLedgerForUpdate);
    //debugger;
    this.dataservice.postPatch("GeneralLedgers", this.GeneralLedgerData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.GeneralLedgerId = data.GeneralLedgerId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {
    //console.log("updating",this.GeneralLedgerForUpdate);
    this.dataservice.postPatch("GeneralLedgers", this.GeneralLedgerData, this.GeneralLedgerData.GeneralLedgerId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetAccountNature() {
    //debugger;
    this.loading = true;
    let filterStr = 'Active eq true and (OrgId eq 0 or OrgId eq ' + this.LoginUserDetail[0]["orgId"] +")";

    let list: List = new List();
    list.fields = [
      'AccountNatureId',
      'AccountName',
      'ParentId',
      'DebitType',
      'Active'
    ];

    list.PageName = "AccountNatures";
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.AccountNatures = [...data.value];
          this.TopAccountNatures = this.AccountNatures.filter(f=>f.ParentId==0);
        }
        this.loadingFalse();
      });

  }
  GetGeneralLedgerAutoComplete() {
    //debugger;
    this.loading = true;
    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();
    list.fields = [
      'GeneralLedgerId',
      'GeneralLedgerName',
      'AccountSubGroupId',
      'AccountNatureId',
      'AccountGroupId',
      'Active',
    ];

    list.PageName = "GeneralLedgers";
    list.filter = [filterStr];
    this.GeneralLedgerList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.GeneralLedgerAutoComplete = [...data.value];
        }
        this.loadingFalse();
      });

  }
  GetGeneralLedger() {
    //debugger;
    this.loading = true;

    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    var AccountNatureId = this.searchForm.get("searchAccountNatureId").value
    var AccountGroupId = this.searchForm.get("searchAccountGroupId").value
    var GeneralLedgerId = this.searchForm.get("searchLedgerName").value.GeneralLedgerId;

    if (AccountNatureId == 0 && AccountGroupId == 0 && GeneralLedgerId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select search criteria", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (AccountNatureId > 0) {
      filterStr += ' and AccountNatureId eq ' + AccountNatureId;
    }
    if (AccountGroupId > 0) {
      filterStr += ' and AccountGroupId eq ' + AccountGroupId;
    }
    if (GeneralLedgerId > 0) {
      filterStr += ' and GeneralLedgerId eq ' + GeneralLedgerId;
    }
    let list: List = new List();
    list.fields = [
      'GeneralLedgerId',
      'GeneralLedgerName',
      'AccountSubGroupId',
      'AccountNatureId',
      'AccountGroupId',
      'ContactNo',
      'ContactName',
      'Email',
      'Address',
      'Active',
    ];

    list.PageName = "GeneralLedgers";
    list.filter = [filterStr];
    this.GeneralLedgerList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          var acgroup = [];
          this.GeneralLedgerList = data.value.map(item => {
            //acgroup = this.allMasterData.filter(f => f.ParentId == item.AccountNatureId);
            item.AccountGroups = this.AccountNatures.filter(f=>f.ParentId == item.AccountNatureId);
            item.AccountSubGroups = this.AccountNatures.filter(f => f.ParentId == item.AccountGroupId);
            item.Action = false;
            return item;
          });
        }
        this.dataSource = new MatTableDataSource<IGeneralLedger>(this.GeneralLedgerList);
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        //this.AccountGroups = this.getDropDownData(globalconstants.MasterDefinitions.accounting.ACCOUNTGROUP);

      });
  }
  onBlur(row) {
    row.Action = true;
  }
  AccountNatureChanged(row) {
    debugger;
    row.Action = true;
    var acgroup = this.AccountNatures.filter(f => f.ParentId == row.AccountNatureId);
    row.AccountGroups = acgroup;
    this.dataSource = new MatTableDataSource(this.GeneralLedgerList);
  }
  SearchAccountNatureChanged() {
    debugger;
    var natureId = this.searchForm.get("searchAccountNatureId").value;
    if (natureId > 0)
      this.AccountGroups = this.AccountNatures.filter(f => f.ParentId == natureId);
  }
  UpdateActive(row, event) {
    row.Active = event.checked ? 1 : 0;
    row.Action = true;
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
export interface IGeneralLedger {
  GeneralLedgerId: number;
  GeneralLedgerName: string;
  AccountSubGroupId: number;
  ContactNo: string;
  ContactName: string;
  Email: string;
  Address: string;
  AccountNatureId: number;
  AccountGroupId: number;
  AccountGroups: any[];
  OrgId: number;
  Active: number;
  Action: boolean;
}
export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}

