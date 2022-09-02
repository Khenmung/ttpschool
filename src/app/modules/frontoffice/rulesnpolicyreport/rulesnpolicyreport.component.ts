import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-rulesnpolicyreport',
  templateUrl: './rulesnpolicyreport.component.html',
  styleUrls: ['./rulesnpolicyreport.component.scss']
})
export class RulesnpolicyreportComponent implements OnInit {
  @ViewChild(MatPaginator) paging: MatPaginator;
  RulesOrPolicyTypes = [];
  PageLoading = false;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  RulesOrPolicyListName = 'RulesOrPolicies';
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
    Sequence: 0,
    Description: '',
    OrgId: 0,
    Active: 0
  };
  Category = '';
  displayedColumns = [
    "Description"
  ];
  SelectedApplicationId = 0;
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private nav: Router,
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
      searchCategoryId: [0],
      //searchSubCategoryId: [0]
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

    //debugger;
    this.loading = true;
    let checkFilterString = "Description eq '" + globalconstants.encodeSpecialChars(row.Description) +
      "' and OrgId eq " + this.LoginUserDetail[0]["orgId"];
    if (row.Description.length == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter description.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.RulesOrPolicyCategoryId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select category.", globalconstants.ActionText, globalconstants.RedBackground);
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
          this.RulesOrPolicyData.Sequence = row.Sequence;
          this.RulesOrPolicyData.OrgId = this.LoginUserDetail[0]["orgId"];

          if (this.RulesOrPolicyData.RulesOrPolicyId == 0) {
            this.RulesOrPolicyData["CreatedDate"] = new Date();
            this.RulesOrPolicyData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.RulesOrPolicyData["UpdatedDate"] = new Date();
            delete this.RulesOrPolicyData["UpdatedBy"];
            console.log("rules", this.RulesOrPolicyData)
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

    this.Category = this.RulesOrPolicyCategory.filter(f => f.MasterDataId == _searchCategoryId)[0].MasterDataName;
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
          this.RulesOrPolicyList = data.value.map((map, indx) => {
            var _obj = this.RulesOrPolicyDisplayTypes.filter(f => f.MasterDataId == map.RuleOrPolicyTypeId);
            var _displaytype = '';
            if (_obj.length > 0)
              _displaytype = _obj[0].MasterDataName;

            map.SrNo = indx + 1;
            map.DisplayType = _displaytype;
            map.Description = globalconstants.decodeSpecialChars(map.Description);
            return map;
          })
        }
        //console.log("display",this.RulesOrPolicyList)
        this.RulesOrPolicyList = this.RulesOrPolicyList.sort((a, b) => a.Sequence - b.Sequence);
        var _displayType = '';
        this.RulesOrPolicyList.forEach(r => {

          if (r["DisplayType"] != 'Text') {
            _displayType = r["DisplayType"]
          }
          else if (_displayType == 'Sub Heading') {
            r.Description = "\t" + r.Description
          }

        })

        this.dataSource = new MatTableDataSource<IRulesOrPolicy>(this.RulesOrPolicyList);
        this.dataSource.paginator = this.paging;
        this.loadingFalse();
      });

  }
  RulesOrPolicyDisplayTypes = [];
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
  }
}
export interface IRulesOrPolicy {
  SrNo: number;
  //RulesOrPolicyId: number;
  RulesOrPolicyCategoryId: number;
  Sequence: number;
  RuleOrPolicyTypeId: number;
  // RuleOrPolicyTypeId: number;
  Description: string;
  // Action: boolean;
}


