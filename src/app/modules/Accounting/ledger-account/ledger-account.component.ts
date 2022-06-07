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
export class GeneralLedgerComponent implements OnInit { PageLoading=true;
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
  SelectedApplicationId = 0;
  StudentClassId = 0;
  Permission = '';
  StandardFilter = '';
  loading = false;
  GeneralLedgerList: IGeneralLedger[] = [];
  SelectedBatchId = 0;
  AccountNatures = [];
  AccountGroups = [];
  GeneralLedgerAutoComplete = [];
  // Classes = [];
  // Batches = [];
  // Sections = [];
  // Students: IStudent[] = [];
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
    ParentId: 0,
    AccountNatureId: 0,
    AccountGroupId: 0,
    OrgId: 0,
    Active: 0
  };
  GeneralLedgerForUpdate = [];
  displayedColumns = [
    'GeneralLedgerId',
    'GeneralLedgerName',
    'ParentId',
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
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.GeneralLedgerAutoComplete.slice())
      );
    //this.StudentClassId = this.tokenstorage.getStudentClassId();
    this.PageLoad();
  }
  private _filter(name: string): IGeneralLedger[] {

    const filterValue = name.toLowerCase();
    return this.GeneralLedgerList.filter(option => option.GeneralLedgerName.toLowerCase().includes(filterValue));

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
      if (this.Permission != 'deny') {
        this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
        this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
        this.GetMasterData();

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
          
          this.contentservice.openSnackBar(globalconstants.DeletedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
        });
  }
  AddNew() {
    var newItem = {
      GeneralLedgerId: 0,
      GeneralLedgerName: '',
      ParentId: 0,
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
    if (row.AccountNatureId == 0) {
      this.loading = false; this.PageLoading=false;
      //this.contentservice.openSnackBar("Please select account nature.", globalconstants.ActionText,globalconstants.RedBackground);
      this.contentservice.openSnackBar("Please select account nature.",globalconstants.ActionText,globalconstants.RedBackground);
      
      return;
    }
    if (row.AccountGroupId == 0) {
      this.loading = false; this.PageLoading=false;
      this.contentservice.openSnackBar("Please select account group.", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    if (row.GeneralLedgerName.length == 0) {
      this.loading = false; this.PageLoading=false;
      this.contentservice.openSnackBar("Please enter account name.", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    let checkFilterString = "GeneralLedgerName eq '" + row.GeneralLedgerName + "'";


    if (row.GeneralLedgerId > 0)
      checkFilterString += " and GeneralLedgerId ne " + row.GeneralLedgerId;
    checkFilterString += " and " + this.StandardFilter;
    let list: List = new List();
    list.fields = ["GeneralLedgerId"];
    list.PageName = "GeneralLedgers";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading=false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          //this.shareddata.CurrentSelectedBatchId.subscribe(c => this.SelectedBatchId = c);
          this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
          this.GeneralLedgerForUpdate = [];;
          ////console.log("inserting-1",this.GeneralLedgerForUpdate);
          this.GeneralLedgerData.GeneralLedgerId = row.GeneralLedgerId;
          this.GeneralLedgerData.AccountGroupId = row.AccountGroupId;
          this.GeneralLedgerData.AccountNatureId = row.AccountNatureId;
          this.GeneralLedgerData.GeneralLedgerName = row.GeneralLedgerName;
          this.GeneralLedgerData.ContactNo=row.ContactNo,
          this.GeneralLedgerData.ContactName=row.ContactName,
          this.GeneralLedgerData.Email=row.Email,
          this.GeneralLedgerData.Address=row.Address,
          this.GeneralLedgerData.ParentId = row.ParentId;
          this.GeneralLedgerData.Active = row.Active;
          this.GeneralLedgerData.OrgId = this.LoginUserDetail[0]["orgId"];


          if (this.GeneralLedgerData.GeneralLedgerId == 0) {
            this.GeneralLedgerData["CreatedDate"] = new Date();
            this.GeneralLedgerData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.GeneralLedgerData["UpdatedDate"] = new Date();
            delete this.GeneralLedgerData["UpdatedBy"];
            ////console.log("inserting1",this.GeneralLedgerForUpdate);
            this.insert(row);
          }
          else {
            this.GeneralLedgerData["CreatedDate"] = new Date(row.CreatedDate);
            this.GeneralLedgerData["CreatedBy"] = row.CreatedBy;
            this.GeneralLedgerData["UpdatedDate"] = new Date();
            delete this.GeneralLedgerData["UpdatedBy"];
            this.insert(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading=false;
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
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
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
      'ParentId',
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
          this.GeneralLedgerAutoComplete = data.value.map(item => {
            item.Action = false;
            return item;
          });
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
    var LedgerAccountId = this.searchForm.get("searchAccountGroupId").value.LedgerAccountId;

    if (AccountNatureId == 0 && AccountGroupId == 0 && LedgerAccountId == 0) {
      this.loading = false; this.PageLoading=false;
      this.contentservice.openSnackBar("Please select search criteria", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    if (AccountNatureId > 0) {
      filterStr += ' and AccountNatureId eq ' + AccountNatureId;
    }
    if (AccountGroupId > 0) {
      filterStr += ' and AccountGroupId eq ' + AccountGroupId;
    }
    if (LedgerAccountId > 0) {
      filterStr += ' and ParentId eq ' + LedgerAccountId;
    }
    let list: List = new List();
    list.fields = [
      'GeneralLedgerId',
      'GeneralLedgerName',
      'ParentId',
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
            acgroup = this.allMasterData.filter(f => f.ParentId == item.AccountNatureId);
            item.AccountGroups = acgroup;
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
        this.AccountNatures = this.getDropDownData(globalconstants.MasterDefinitions.accounting.ACCOUNTNATURE);
        this.GetGeneralLedgerAutoComplete();
      });
  }
  onBlur(row) {
    row.Action = true;
  }
  AccountNatureChanged(row) {
    debugger;
    row.Action = true;
    var acgroup = this.allMasterData.filter(f => f.ParentId == row.AccountNatureId);
    row.AccountGroups = acgroup;
    this.dataSource = new MatTableDataSource(this.GeneralLedgerList);
  }
  SearchAccountNatureChanged() {
    debugger;
    var natureId = this.searchForm.get("searchAccountNatureId").value;
    if (natureId > 0)
      this.AccountGroups = this.allMasterData.filter(f => f.ParentId == natureId);
  }
  UpdateActive(row, event) {
    row.Active = event.checked ? 1 : 0;
    row.Action = true;
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
export interface IGeneralLedger {
  GeneralLedgerId: number;
  GeneralLedgerName: string;
  ParentId: number;
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

