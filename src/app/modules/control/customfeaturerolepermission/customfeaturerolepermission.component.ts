import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-customfeaturerolepermission',
  templateUrl: './customfeaturerolepermission.component.html',
  styleUrls: ['./customfeaturerolepermission.component.scss']
})
export class CustomfeaturerolepermissionComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  TopMenu = [];
  MasterData = [];
  Roles = [];
  Permissions = [];
  Permission = 'deny';
  ApplicationRoleList = [];
  TopPageFeatures = [];
  DefinedMaster = [];
  NoOfRowsToUpdate = -1;
  PageFeatures = [];
  FilteredPageFeatures = [];
  oldvalue = '';
  selectedData = '';
  datasource: MatTableDataSource<ICustomFeatureRolePermission>;
  AppRoleData = {
    CustomFeatureRolePermissionId: 0,
    CustomFeatureId: 0,
    RoleId: 0,
    PermissionId: 0,
    ApplicationId: 0,
    OrgId: 0,
    Active: 0
  };
  CustomFeatures = [];
  SelectedApplicationId = 0;
  ApplicationDataStatus = [];
  SchoolDataStatus = [];
  DisplayColumns = [
    "CustomFeatureRolePermissionId",
    "FeatureName",
    "PermissionId",
    "Active",
    "Action"
  ];
  UserDetails = [];

  constructor(
    private fb: FormBuilder,
    private route: Router,
    private tokenStorage: TokenStorageService,
    private dataservice: NaomitsuService,

    private contentservice: ContentService

  ) { }

  ngOnInit(): void {

    this.PageLoad();
  }

  currentPermission = '';
  enableAddNew = false;
  enableTopEdit = false;
  loading: boolean = false;
  error: string = '';
  searchForm = this.fb.group(
    {
      searchFeatureName: [''],
      searchRoleId: [0],
      //PermissionId: [0]
    })
  PageLoad() {
    //debugger;
    this.loading = true;
    this.UserDetails = this.tokenStorage.getUserDetail();
    if (this.UserDetails == null) {
      //this.alert.error('Please login to be able to add masters!', this.optionAutoClose);
      this.contentservice.openSnackBar('Please login to be able to add masters!', globalconstants.ActionText, globalconstants.RedBackground);
      this.route.navigate(['auth/login']);
    }
    else {

      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.APPLICATIONFEATUREPERMISSION);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
        this.Permissions = globalconstants.PERMISSIONTYPES;
        this.GetCustomFeatures();
        this.GetTopMasters();
        this.GetPageFeatures();
      }
    }
  }
  GetCustomFeatures() {
    let list: List = new List();
    list.fields = [
      "CustomFeatureId",
      "CustomFeatureName",
      "ApplicationId",
      "Active",
      "OrgId"];
    list.PageName = "CustomFeatures";
    list.filter = ["Active eq true and (ApplicationId eq " + globalconstants.CommonPanelID + " or ApplicationId eq " + this.SelectedApplicationId +")"];
    //debugger;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.CustomFeatures = [...data.value];
        }
        //console.log("custom feature",this.CustomFeatures);
      });
  }
  GetTopMasters() {
    let list: List = new List();
    list.fields = [
      "MasterDataId",
      "ParentId",
      "MasterDataName",
      "Description",
      "Active",
      "OrgId"];
    list.PageName = "MasterItems";
    list.filter = ["(ParentId eq 0 or OrgId eq " + this.UserDetails[0]["orgId"] +
      ") and Active eq 1"];
    //debugger;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.MasterData = [...data.value];
          this.Roles = this.getDropDownData(globalconstants.MasterDefinitions.common.ROLE);
        }
      });
  }
  GetTopMenu() {
    this.TopMenu = this.PageFeatures.filter(f => f.ApplicationId == this.SelectedApplicationId
      && f.ParentId == 0)
    this.TopMenu = this.TopMenu.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
  }
  getSettingStatus(data) {
    let defined;

    return Object.keys(data[0]).map(globalcons => {

      defined = this.DefinedMaster.filter(fromdb => {
        return data[0][globalcons].toLowerCase().trim() == fromdb.MasterDataName.toLowerCase().trim();
      });

      if (defined.length > 0) {
        return {
          MasterDataName: data[0][globalcons],
          Done: true
        }
      }
      else {
        return {
          MasterDataName: data[0][globalcons],
          Done: false
        }
      }
    });

  }
  enable(elment) {
    //debugger;
    if (elment.value > 0)
      this.enableTopEdit = true;
    else
      this.enableTopEdit = false;
  }
  GetPageFeatures() {
    //debugger;

    let list: List = new List();
    list.fields = [
      "PlanFeatureId",
      "PlanId",
      "PageId",
      "ApplicationId"
    ];
    list.PageName = "PlanFeatures";
    list.lookupFields = ["Page($select=ParentId,label,PageTitle,DisplayOrder)"]
    list.filter = ["PlanId eq " + this.UserDetails[0]["planId"] +
      " and Active eq 1 and ApplicationId eq " + this.SelectedApplicationId];
    this.PageFeatures = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.PageFeatures = data.value.map(d => {
            d.ParentId = d.Page.ParentId;
            d.label = d.Page.label;
            d.PageTitle = d.Page.PageTitle;
            d.DisplayOrder = d.Page.DisplayOrder;
            return d;
          });
          this.TopPageFeatures = this.PageFeatures.filter(f => f.ParentId == 0);
        }
        else
          this.PageFeatures = [];
        this.loading = false; this.PageLoading = false;
        //console.log("PageFeatures", this.PageFeatures)
      })
  }
  FilterPageFeatures() {
    //debugger;
    this.FilteredPageFeatures = this.PageFeatures.filter(f => f.ApplicationId == this.SelectedApplicationId);

  }
  CustomerFeaturePermissionList = [];
  GetCustomerFeatures() {
    //debugger;

    var rolefilter = "OrgId eq " + this.UserDetails[0]["orgId"] + " and ApplicationId eq " + this.SelectedApplicationId;
    if (this.SelectedApplicationId == 0) {
      this.contentservice.openSnackBar("Please select Application", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _roleId = this.searchForm.get("searchRoleId").value;
    var _featureId = this.searchForm.get("searchFeatureName").value;
    // if(_roleId==0 && )
    // {
    //   this.contentservice.openSnackBar("Please select role.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    if (_roleId > 0) {
      rolefilter += " and RoleId eq " + _roleId;
    }
    if (_featureId > 0) {
      rolefilter += " and CustomFeatureId eq " + _featureId;
    }

    let list: List = new List();
    list.fields = [
      "CustomFeatureRolePermissionId",
      "CustomFeatureId",
      "RoleId",
      "PermissionId",
      "ApplicationId",
      "Active"
    ];
    list.PageName = "CustomFeatureRolePermissions";
    list.filter = [rolefilter];
    this.ApplicationRoleList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.CustomerFeaturePermissionList = [];
        if (_featureId > 0) {
          this.CustomerFeaturePermissionList = data.value.map(m=>{
            m.FeatureName = this.CustomFeatures.filter(f=>f.CustomerFeatureId == m.CustomerFeatureId)[0].CustomFeatureName;
            return m;
          })
        }
        else {
          this.CustomFeatures.forEach(custom => {
            var obj = data.value.filter(e => e.CustomFeatureId == custom.CustomFeatureId);
            if (obj.length > 0) {
              this.CustomerFeaturePermissionList.push({
                PermissionId: obj[0].PermissionId,
                RoleId: obj[0].RoleId,
                CustomFeatureRolePermissionId: obj[0].CustomFeatureRolePermissionId,
                ApplicationId: obj[0].ApplicationId,
                CustomFeatureId: obj[0].CustomFeatureId,
                Active: obj[0].Active,
                FeatureName: custom.CustomFeatureName
              })
            }
            else {
              this.CustomerFeaturePermissionList.push({
                PermissionId: 3,
                RoleId: _roleId,
                CustomFeatureRolePermissionId: 0,
                ApplicationId: this.SelectedApplicationId,
                CustomFeatureId: custom.CustomFeatureId,
                Active: 0,
                FeatureName: custom.CustomFeatureName
              })
            }

          })
        }
        if (this.CustomerFeaturePermissionList.length == 0) {
          this.contentservice.openSnackBar("No feature found!", globalconstants.ActionText, globalconstants.RedBackground);
        }
        //console.log("this.ApplicationRoleList",this.ApplicationRoleList)
        this.datasource = new MatTableDataSource<ICustomFeatureRolePermission>(this.CustomerFeaturePermissionList);
        this.datasource.sort = this.sort;
        this.datasource.paginator = this.paginator;
      });
  }
  checkall(value) {
    this.CustomerFeaturePermissionList.forEach(record => {
      record.Active = value.checked;
      record.Action = true;
    })
  }
  // saveall() {
  //   var ToUpdate = this.ApplicationRoleList.filter(f => f.Action);
  //   this.NoOfRowsToUpdate = ToUpdate.length;
  //   ToUpdate.forEach((record, indx) => {
  //     this.NoOfRowsToUpdate--;
  //     this.UpdateOrSave(record);

  //   })
  // }
  get f() { return this.searchForm.controls }
  UpdateSaveButton(element) {
    element.Action = true;
  }
  updateActive(element, event) {
    element.Action = true;
    element.Active = event.checked;
  }
  AddNew() {
    var _roleId = this.searchForm.get("searchRoleId").value;
    if (_roleId == 0) {
      this.contentservice.openSnackBar("Please select role.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _featureId = this.searchForm.get("searchFeatureName").value;
    if (_featureId == 0) {
      this.contentservice.openSnackBar("Please select feature.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    var _featureName =this.CustomFeatures.filter(f=>f.CustomFeatureId == _featureId)[0].CustomFeatureName;

    var newdata = {
      CustomFeatureRolePermissionId: 0,
      FeatureName: _featureName,
      RoleId: _roleId,
      PermissionId: 0,
      CustomFeatureId:_featureId,
      ApplicationId: this.SelectedApplicationId,
      Active: false,
      Action: true
    }
    this.CustomerFeaturePermissionList.push(newdata);
    this.datasource = new MatTableDataSource<ICustomFeatureRolePermission>(this.CustomerFeaturePermissionList);
  }
  UpdateAll() {
    var toUpdate = this.CustomerFeaturePermissionList.filter(f => f.Action);
    this.NoOfRowsToUpdate = toUpdate.length;
    toUpdate.forEach((a, indx) => {
      this.NoOfRowsToUpdate -= 1;
      this.UpdateOrSave(a);
    })
  }
  Save(row) {
    this.NoOfRowsToUpdate = 0;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row) {

    if (row.FeatureName.length == 0) {
      this.contentservice.openSnackBar("Please enter feature name.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.PermissionId == 0) {
      this.contentservice.openSnackBar("Please select permission", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    let checkFilterString = "RoleId eq " + row.RoleId +
      " and CustomFeatureId eq " + row.CustomFeatureId +
      " and OrgId eq " + this.UserDetails[0]["orgId"];

    if (row.CustomFeatureRolePermissionId > 0)
      checkFilterString += " and CustomFeatureRolePermissionId ne " + row.CustomFeatureRolePermissionId;

    let list: List = new List();
    list.fields = ["CustomFeatureRolePermissionId"];
    list.PageName = "CustomFeatureRolePermissions";
    list.filter = [checkFilterString];
    this.loading = true;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
          this.loading = false; this.PageLoading = false;
        }
        else {

          this.AppRoleData.Active = row.Active;
          this.AppRoleData.CustomFeatureId = row.CustomFeatureId;
          this.AppRoleData.CustomFeatureRolePermissionId = row.CustomFeatureRolePermissionId;
          this.AppRoleData.RoleId = row.RoleId;
          this.AppRoleData.PermissionId = row.PermissionId;
          this.AppRoleData.ApplicationId = row.ApplicationId;
          this.AppRoleData.OrgId = this.UserDetails[0]["orgId"];

          console.log('data', this.AppRoleData);
          if (this.AppRoleData.CustomFeatureRolePermissionId == 0) {
            this.AppRoleData["CreatedDate"] = new Date();
            this.AppRoleData["CreatedBy"] = this.UserDetails[0].userId;
            this.AppRoleData["UpdatedDate"] = new Date();
            this.AppRoleData["UpdatedBy"] = this.UserDetails[0].userId;
            this.insert(row);
          }
          else {
            delete this.AppRoleData["CreatedDate"];
            delete this.AppRoleData["CreatedBy"];
            this.AppRoleData["UpdatedDate"] = new Date();
            this.AppRoleData["UpdatedBy"] = this.UserDetails[0].userId;
            this.update(row);
          }
          row.Action = false;
        }
      });

  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('CustomFeatureRolePermissions', this.AppRoleData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          row.CustomFeatureRolePermissionId = data.CustomFeatureRolePermissionId;
          row.Action = false;
          if (this.NoOfRowsToUpdate == 0) {
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.NoOfRowsToUpdate = -1;
          }
        });
  }
  update(row) {

    this.dataservice.postPatch('CustomFeatureRolePermissions', this.AppRoleData, this.AppRoleData.CustomFeatureRolePermissionId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          row.Action = false;
          if (this.NoOfRowsToUpdate == 0) {
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.NoOfRowsToUpdate = -1;
          }
        });
  }
  Delete(row) {
    // this.contentservice.openDialog()
    //   .subscribe((confirmed: boolean) => {
    //     if (confirmed) {
    //       this.contentservice.SoftDelete('CustomFeatureRolePermission',{}, row.MasterDataId)
    //         .subscribe((data: any) => {
    //           row.Action = false;
    //           this.loading = false; this.PageLoading=false;
    //           var idx = this.ApplicationRoleList.findIndex(x => x.MasterDataId == row.MasterDataId)
    //           this.ApplicationRoleList.splice(idx, 1);
    //           this.datasource = new MatTableDataSource<any>(this.ApplicationRoleList);
    //           this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
    //         },
    //           err => {
    //             this.contentservice.openSnackBar("error in data deletion: " + err, globalconstants.ActionText, globalconstants.RedBackground);
    //           }
    //         )
    //     }

    //   });
  }
  selected(event) {
    this.selectedData = event.target.value;
  }
  getoldvalue(value: string, row) {
    this.oldvalue = row.MasterDataName;
    //  //console.log('old value', this.oldvalue);
  }

  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.MasterData);
    // let Id = this.MasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    // })[0].MasterDataId;
    // return this.MasterData.filter((item, index) => {
    //   return item.ParentId == Id
    // });
  }
}
export interface ICustomFeatureRolePermission {
  CustomFeatureRolePermissionId: number;
  CustomFeatureId: 0;
  RoleId: number;
  PermissionId: number;
  ApplicationId: number;
  Active: number;
}