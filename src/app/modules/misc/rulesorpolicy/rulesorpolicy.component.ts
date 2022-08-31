import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import {SwUpdate} from '@angular/service-worker';

@Component({
  selector: 'app-rulesorpolicy',
  templateUrl: './rulesorpolicy.component.html',
  styleUrls: ['./rulesorpolicy.component.scss']
})
export class RulesorpolicyComponent implements OnInit {
  @ViewChild(MatPaginator) paging: MatPaginator;
  RulesOrPolicyTypes = [];
  PageLoading = false;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  RulesOrPolicyListName = 'RulesOrPolicies';
  RulesOrPolicyDisplayTypes =[];
  Applications = [];
  //Categories=[];
  loading = false;
  SelectedBatchId = 0;
  RulesOrPolicyList: IRulesOrPolicy[] = [];
  filteredOptions: Observable<IRulesOrPolicy[]>;
  dataSource: MatTableDataSource<IRulesOrPolicy>;
  allMasterData = [];
  RulesOrPolicyCategory = [];
  RulesOrPolicySubCategory = [];
  Permission = 'deny';
  RulesOrPolicyData = {
    RulesOrPolicyId: 0,
    RulesOrPolicyCategoryId: 0,
    RuleOrPolicyTypeId: 0,
    Deleted:false,
    Sequence:0,
    Description: '',
    OrgId: 0,
    Active: 0
  };
  displayedColumns = [
    "RulesOrPolicyId",
    "Description",
    "RulesOrPolicyCategoryId",
    "RuleOrPolicyTypeId",
    "Sequence",
    "Active",
    "Action"
  ];
  SelectedApplicationId = 0;
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private nav: Router,
    private datepipe: DatePipe,
    private fb: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.servicework.activateUpdate().then(() => {
      this.servicework.checkForUpdate().then((value) => {
        if (value) {
          location.reload();
        }
      })
    })
    //debugger;
    this.searchForm = this.fb.group({
      searchCategoryId: [0]
      // searchSubCategoryId: [0]
    });
    this.PageLoad();
  }

  PageLoad() {

    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    //this.EmployeeId = +this.tokenstorage.getEmployeeId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.common.misc.RULESORPOLICY);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {
        //this.nav.navigate(['/edu'])
      }
      else {

        this.GetMasterData();
      }
    }
  }

  AddNew() {

    var newdata = {
      RulesOrPolicyId: 0,
      RulesOrPolicyCategoryId: 0,
      RuleOrPolicyTypeId: 0,
      Description: '',
      Sequence:0,
      OrgId: 0,
      Active: 0,
      Action: false
    };
    this.RulesOrPolicyList = [];
    this.RulesOrPolicyList.push(newdata);
    this.dataSource = new MatTableDataSource<IRulesOrPolicy>(this.RulesOrPolicyList);
    this.dataSource.paginator = this.paging;
  }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = value.checked;
  }
  delete(element) {
    let toupdate = {
      Active: element.Active
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {

          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  UpdateOrSave(row) {

    debugger;
    this.loading = true;
    let checkFilterString = "Description eq '" + globalconstants.encodeSpecialChars(row.Description) + 
    "' and OrgId eq " + this.LoginUserDetail[0]["orgId"];
    if(row.Description.length==0)
    {
      this.loading=false;
      this.contentservice.openSnackBar("Please enter description.",globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    else if(row.Description.length>290)
    {
      this.loading=false;
      this.contentservice.openSnackBar("Description exceed 290 characters.",globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    if(row.RulesOrPolicyCategoryId==0)
    {
      this.loading=false;
      this.contentservice.openSnackBar("Please select category.",globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    if(row.RuleOrPolicyTypeId==0)
    {
      this.loading=false;
      this.contentservice.openSnackBar("Please select display type.",globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    if (row.RulesOrPolicyId > 0)
      checkFilterString += " and RulesOrPolicyId ne " + row.RulesOrPolicyId;
    let list: List = new List();
    list.fields = ["RulesOrPolicyId"];
    list.PageName = this.RulesOrPolicyListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.RulesOrPolicyData.RulesOrPolicyId = row.RulesOrPolicyId;
          this.RulesOrPolicyData.Active = row.Active;
          this.RulesOrPolicyData.RulesOrPolicyCategoryId = row.RulesOrPolicyCategoryId;
          this.RulesOrPolicyData.Description = globalconstants.encodeSpecialChars(row.Description);
          this.RulesOrPolicyData.RuleOrPolicyTypeId = row.RuleOrPolicyTypeId;
          this.RulesOrPolicyData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.RulesOrPolicyData.Sequence = +row.Sequence;
          this.RulesOrPolicyData.Deleted = false;

          if (this.RulesOrPolicyData.RulesOrPolicyId == 0) {
            this.RulesOrPolicyData["CreatedDate"] = new Date();
            this.RulesOrPolicyData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.RulesOrPolicyData["UpdatedDate"] = new Date();
            delete this.RulesOrPolicyData["UpdatedBy"];
            console.log("rules",this.RulesOrPolicyData)
            this.insert(row);
          }
          else {
            delete this.RulesOrPolicyData["CreatedDate"];
            delete this.RulesOrPolicyData["CreatedBy"];
            this.RulesOrPolicyData["UpdatedDate"] = new Date();
            this.RulesOrPolicyData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.RulesOrPolicyListName, this.RulesOrPolicyData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.RulesOrPolicyId = data.RulesOrPolicyId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.RulesOrPolicyListName, this.RulesOrPolicyData, this.RulesOrPolicyData.RulesOrPolicyId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetRulesOrPolicy() {
    debugger;
    let filterStr = 'Active eq true and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    var _searchCategoryId = this.searchForm.get("searchCategoryId").value;
    //var _searchSubCategoryId = this.searchForm.get("searchSubCategoryId").value;

    if (_searchCategoryId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select category.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else
      filterStr += ' and RulesOrPolicyCategoryId eq ' + _searchCategoryId;

    // if (_searchSubCategoryId > 0) {
    //   filterStr += ' and RuleOrPolicyTypeId eq ' + _searchSubCategoryId;
    // }

    this.loading = true;
    let list: List = new List();
    list.fields = ["*"];

    list.PageName = this.RulesOrPolicyListName;
    list.filter = [filterStr];
    this.RulesOrPolicyList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.RulesOrPolicyList = data.value.map(map=>{
            map.Description = globalconstants.decodeSpecialChars(map.Description);
            return map;
          })
        }
        this.dataSource = new MatTableDataSource<IRulesOrPolicy>(this.RulesOrPolicyList);
        this.dataSource.paginator = this.paging;
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.RulesOrPolicyCategory = this.getDropDownData(globalconstants.MasterDefinitions.common.RULEORPOLICYCATEGORY)
        this.RulesOrPolicyDisplayTypes = this.getDropDownData(globalconstants.MasterDefinitions.common.RULEORPOLICYCATEGORYDISPLAYTYPE)
       
        //this.GetRulesOrPolicy();
        this.loading = false; this.PageLoading = false;
      });
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
export interface IRulesOrPolicy {
  RulesOrPolicyId: number;
  RulesOrPolicyCategoryId: number;
  RuleOrPolicyTypeId: number;
  Sequence:number;
  Description: string;
  Action: boolean;
}


