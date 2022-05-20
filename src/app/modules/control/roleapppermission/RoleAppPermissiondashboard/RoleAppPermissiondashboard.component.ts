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
  selector: 'app-RoleAppPermissiondashboard',
  templateUrl: './RoleAppPermissiondashboard.component.html',
  styleUrls: ['./RoleAppPermissiondashboard.component.scss']
})
export class RoleAppPermissiondashboardComponent implements OnInit {
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
  datasource: MatTableDataSource<IApplicationRolePermission>;
  AppRoleData = {
    ApplicationFeatureRoleId: 0,
    PlanFeatureId: 0,
    //ParentId: 0,
    RoleId: 0,
    PermissionId: 0,
    OrgId: 0,
    Active: 0
  };
  SelectedApplicationId = 0;
  ApplicationDataStatus = [];
  SchoolDataStatus = [];
  DisplayColumns = [
    "ApplicationFeatureRoleId",
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
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  optionNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
//  Applications = [];
  //CustomerApplications = [];
  searchForm = this.fb.group(
    {
      //ApplicationId: [0],
      PlanFeatureId: [0],
      RoleId: [0],
      //PermissionId: [0]
    })
  PageLoad() {
    //debugger;
    this.loading = true;
    this.UserDetails = this.tokenStorage.getUserDetail();
    if (this.UserDetails == null) {
      //this.alert.error('Please login to be able to add masters!', this.optionAutoClose);
      this.contentservice.openSnackBar('Please login to be able to add masters!',globalconstants.ActionText,globalconstants.RedBackground);
      this.route.navigate(['auth/login']);
    }
    else {

      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.APPLICATIONFEATUREPERMISSION);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
        this.Permissions = globalconstants.PERMISSIONTYPES;
        this.GetTopMasters();
        this.GetPageFeatures();
      }
    }
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
          // var applicationId = data.value.filter(m => m.MasterDataName.toLowerCase() == "application")[0].MasterDataId;
          // this.Applications = data.value.filter(t => t.ParentId == applicationId);
          this.Roles = this.getDropDownData(globalconstants.MasterDefinitions.common.ROLE);
          //this.GetCustomerApps();
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
        this.loading = false;
        console.log("PageFeatures", this.PageFeatures)
      })
  }
  FilterPageFeatures() {
    //debugger;
    this.FilteredPageFeatures = this.PageFeatures.filter(f => f.ApplicationId == this.SelectedApplicationId);

  }
  GetApplicationFeatureRole() {
    //debugger;

    var rolefilter = '';
    if (this.SelectedApplicationId == 0) {
      this.contentservice.openSnackBar("Please select Application", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    // else
    //   rolefilter += " and ApplicationFeature/ApplicationId eq " + this.SelectedApplicationId;
    var _planFeatureId = this.searchForm.get("PlanFeatureId").value;
    var _ParentId = 0;
    if (_planFeatureId > 0) {
      _ParentId = this.PageFeatures.filter(f => f.PlanFeatureId == _planFeatureId)[0].PageId;
    }
    //rolefilter += " and ParentId eq " + _ParentId;

    if (this.searchForm.get("RoleId").value == 0) {
      this.contentservice.openSnackBar("Please select role.", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    else
      rolefilter += " and RoleId eq " + this.searchForm.get("RoleId").value;

    let list: List = new List();
    list.fields = [
      "ApplicationFeatureRoleId",
      "PlanFeatureId",
      //"ParentId",
      "RoleId",
      "PermissionId",
      "Active"
    ];
    list.PageName = "ApplicationFeatureRolesPerms";
    list.lookupFields = ["PlanFeature($filter=Active eq 1 and ApplicationId eq "+ this.SelectedApplicationId +";$select=PlanFeatureId,ApplicationId;$expand=Page($select=ParentId))"];

    list.filter = ["OrgId eq " + this.UserDetails[0]["orgId"] + rolefilter];
    this.ApplicationRoleList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var ResultedPermittedPageFeatures = [];
        var _roleId = this.searchForm.get("RoleId").value;
        var roleFilteredAssigned = data.value.filter(db => db.RoleId == _roleId);
        var filteredFeature = this.PageFeatures.filter(f => f.ApplicationId == this.SelectedApplicationId && f.ParentId == _ParentId);
        debugger;
        filteredFeature.forEach(p => {
          var existing = roleFilteredAssigned.filter(r => r.PlanFeatureId == p.PlanFeatureId);
          if (existing.length > 0)
            ResultedPermittedPageFeatures.push({
              ApplicationFeatureRoleId: existing[0].ApplicationFeatureRoleId,
              PlanFeatureId: existing[0].PlanFeatureId,
              //FeatureId: p.FeatureId,
              FeatureName: p.label,// this.PageFeatures.filter(t => t.PageId == existing[0].PlanFeatureId)[0].Label,
              RoleId: existing[0].RoleId,
              Role: this.Roles.filter(r => r.MasterDataId == existing[0].RoleId)[0].MasterDataName,
              PermissionId: existing[0].PermissionId,
              DisplayOrder: p.DisplayOrder,
              ParentId: p.Page.ParentId,
              Active: existing[0].Active,
              Action: false
            })
          else
            ResultedPermittedPageFeatures.push({
              ApplicationFeatureRoleId: 0,
              PlanFeatureId: p.PlanFeatureId,
              //FeatureId: p.FeatureId,
              FeatureName: p.label,// this.PageFeatures.filter(t => t.PageId == p.PageId)[0].Label,
              RoleId: _roleId,
              DisplayOrder: p.DisplayOrder,
              Role: this.Roles.filter(ir => ir.MasterDataId == _roleId)[0].MasterDataName,
              PermissionId: 0,
              ParentId: p.Page.ParentId,
              Active: 0,
              Action: false
            })
        })
        //const parents = ResultedPermittedPageFeatures.filter(x => !x.ParentId);
        this.ApplicationRoleList = ResultedPermittedPageFeatures.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
        
        if (this.ApplicationRoleList.length == 0) {
          this.contentservice.openSnackBar("No feature found!", globalconstants.ActionText,globalconstants.RedBackground);
        }
        console.log("this.ApplicationRoleList",this.ApplicationRoleList)
        this.datasource = new MatTableDataSource<IApplicationRolePermission>(this.ApplicationRoleList);
        this.datasource.sort = this.sort;
        this.datasource.paginator = this.paginator;
      });
  }
  checkall(value) {
    this.ApplicationRoleList.forEach(record => {
      if (value.checked) {
        record.Active = 1;
      }
      else
        record.Active = 0;
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
    //debugger;
    element.Action = true;
  }
  updateActive(element, event) {
    element.Action = true;
    element.Active = event.checked == true ? 1 : 0;
  }
  addnew() {
    var newdata = {
      ApplicationFeatureRoleId: 0,
      PlanFeatureId: this.searchForm.get("PlanFeatureId").value,
      FeatureName: this.PageFeatures.filter(t => t.PageId == this.searchForm.get("PlanFeatureId").value)[0].PageTitle,
      RoleId: 0,
      Role: '',
      PermissionId: 0,
      Active: 0,
      Action: true
    }
    this.ApplicationRoleList.push(newdata);
    this.datasource = new MatTableDataSource<IApplicationRolePermission>(this.ApplicationRoleList);
  }
  UpdateAll() {
    var toUpdate = this.ApplicationRoleList.filter(f => f.Action);
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

    if (row.PermissionId == 0) {
      this.contentservice.openSnackBar("Please select permission", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    let checkFilterString = "Active eq 1 " +
      " and RoleId eq " + row.RoleId +
      // " and PermissionId eq " + row.PermissionId +
      " and PlanFeatureId eq " + row.PlanFeatureId +
      " and OrgId eq " + this.UserDetails[0]["orgId"];

    if (row.ApplicationFeatureRoleId > 0)
      checkFilterString += " and ApplicationFeatureRoleId ne " + row.ApplicationFeatureRoleId;

    let list: List = new List();
    list.fields = ["ApplicationFeatureRoleId"];
    list.PageName = "ApplicationFeatureRolesPerms";
    list.filter = [checkFilterString];
    this.loading = true;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.contentservice.openSnackBar("Record already exists!", globalconstants.ActionText,globalconstants.RedBackground);
          this.loading = false;
        }
        else {
          //var _ParentId = 0;
          // var _planFeatureId = this.searchForm.get("PlanFeatureId").value;
          // if (_planFeatureId > 0) {
          //   var obj = this.TopPageFeatures.filter(t => t.PlanFeatureId == _planFeatureId);
          //   if (obj.length > 0)
          //     _ParentId = obj[0].PageId;
          // }

          this.AppRoleData.Active = row.Active;
          this.AppRoleData.ApplicationFeatureRoleId = row.ApplicationFeatureRoleId;
          this.AppRoleData.PlanFeatureId = row.PlanFeatureId;
          //this.AppRoleData.ParentId = _ParentId;
          this.AppRoleData.RoleId = row.RoleId;
          this.AppRoleData.PermissionId = row.PermissionId;
          this.AppRoleData.OrgId = this.UserDetails[0]["orgId"];

          //console.log('data', this.AppRoleData);
          if (this.AppRoleData.ApplicationFeatureRoleId == 0) {
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
    this.dataservice.postPatch('ApplicationFeatureRolesPerms', this.AppRoleData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.ApplicationFeatureRoleId = data.ApplicationFeatureRoleId;
          row.Action = false;
          if (this.NoOfRowsToUpdate == 0) {
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.NoOfRowsToUpdate = -1;
          }
        });
  }
  update(row) {

    this.dataservice.postPatch('ApplicationFeatureRolesPerms', this.AppRoleData, this.AppRoleData.ApplicationFeatureRoleId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.Action = false;
          if (this.NoOfRowsToUpdate == 0) {
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
            this.NoOfRowsToUpdate = -1;
          }
        });
  }
  Delete(row) {
    // this.contentservice.openDialog()
    //   .subscribe((confirmed: boolean) => {
    //     if (confirmed) {
    //       this.contentservice.SoftDelete('ApplicationFeatureRolesPerms',{}, row.MasterDataId)
    //         .subscribe((data: any) => {
    //           row.Action = false;
    //           this.loading = false;
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
    let Id = this.MasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    })[0].MasterDataId;
    return this.MasterData.filter((item, index) => {
      return item.ParentId == Id
    });
  }
}
export interface IApplicationRolePermission {
  ApplicationFeatureRoleId: number;
  PlanFeatureId: number;
  FeatureName: string;
  RoleId: number;
  Role: string;
  PermissionId: number;
  Active: number;
}