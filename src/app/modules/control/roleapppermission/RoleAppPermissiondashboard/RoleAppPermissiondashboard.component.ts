import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { DialogService } from 'src/app/shared/dialog.service';
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
  topMaster = 0;
  MasterData = [];
  Roles = [];
  Permissions = [];
  ApplicationRoleList = [];
  TopMasters = [];
  DefinedMaster = [];
  NoOfRowsToUpdate = -1;
  Features = [];
  FilteredFeatures = [];
  oldvalue = '';
  selectedData = '';
  datasource: MatTableDataSource<IApplicationRolePermission>;
  AppRoleData = {
    ApplicationFeatureRoleId: 0,
    ApplicationFeatureId: 0,
    RoleId: 0,
    PermissionId: 0,
    OrgId: 0,
    Active: 0
  };

  ApplicationDataStatus = [];
  SchoolDataStatus = [];
  DisplayColumns = [
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
    private alert: AlertService,
    private contentservice: ContentService,
    private dialog: DialogService) { }

  ngOnInit(): void {
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
  Applications = [];
  CustomerApplications = [];
  searchForm = this.fb.group(
    {
      ApplicationId: [0],
      ApplicationFeatureId: [0],
      RoleId: [0],
      //PermissionId: [0]
    })
  PageLoad() {
    //debugger;
    this.loading = true;
    this.UserDetails = this.tokenStorage.getUserDetail();
    if (this.UserDetails == null) {
      this.alert.error('Please login to be able to add masters!', this.optionAutoClose);
      this.route.navigate(['auth/login']);
    }
    this.currentPermission = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.APPLICATIONFEATUREPERMISSION);
    this.Permissions = globalconstants.PERMISSIONTYPES;
    this.GetTopMasters();
    this.GetFeatures();
  }
  GetCustomerApps() {
    debugger;
    let list: List = new List();
    list.fields = [
      "ApplicationPriceId",
      "CustomerAppsId"];
    list.PageName = "CustomerApps";
    list.lookupFields = ["ApplicationPrice($select=ApplicationId)"]
    list.filter = ["OrgId eq " + this.UserDetails[0]["orgId"] + " and Active eq 1"];//this.searchForm.get("ParentId").value];
    //debugger;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.CustomerApplications = data.value.map(m => {
            return {
              ApplicationId: m.ApplicationPrice.ApplicationId,
              ApplicationName: this.Applications.filter(f => f.MasterDataId == m.ApplicationPrice.ApplicationId)[0].Description
            }
          });

          this.loading = false;

        }
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
    list.filter = ["(ParentId eq 0 or OrgId eq " + this.UserDetails[0]["orgId"] + ") and Active eq 1"];//this.searchForm.get("ParentId").value];
    //debugger;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.MasterData = [...data.value];
          var applicationId = data.value.filter(m => m.MasterDataName.toLowerCase() == "application")[0].MasterDataId;
          this.Applications = data.value.filter(t => t.ParentId == applicationId);
          this.Roles = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.ROLE);
          this.GetCustomerApps();
          
        }
      });
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
  GetFeatures() {
    //debugger;

    let list: List = new List();
    list.fields = [
      "PageId",
      "label",
      "PageTitle",
      "ParentId",
      "ApplicationId"
    ];
    list.PageName = "Pages";
    list.filter = ["Active eq 1"];
    this.Features = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.Features = [...data.value];
        }
        else
          this.Features = [];
        this.loading = false;
        console.log("features", this.Features)
      })
  }
  FilterFeatures() {
    //debugger;
    this.FilteredFeatures = this.Features.filter(f => f.ApplicationId == this.searchForm.get("ApplicationId").value);

  }
  GetApplicationFeatureRole() {
    //debugger;

    var rolefilter = '';
    if (this.searchForm.get("ApplicationId").value == 0) {
      this.alert.error("Please select Application", this.optionAutoClose);
      return;
    }
    else
      rolefilter += " and ApplicationFeature/ApplicationId eq " + this.searchForm.get("ApplicationId").value;

    // if (this.searchForm.get("ApplicationFeatureId").value == 0) {
    //   this.alert.error("Please select Application feature.", this.optionAutoClose);
    //   return;
    // }
    if (this.searchForm.get("ApplicationFeatureId").value > 0) {
      rolefilter += " and ApplicationFeatureId eq " + this.searchForm.get("ApplicationFeatureId").value;
    }

    if (this.searchForm.get("RoleId").value == 0) {
      this.alert.error("Please select role.", this.optionAutoClose);
      return;
    }
    // else
    //   rolefilter += " and RoleId eq " + this.searchForm.get("RoleId").value;

    let list: List = new List();
    list.fields = [
      "ApplicationFeatureRoleId",
      "ApplicationFeatureId",
      "RoleId",
      "PermissionId",
      "Active"
    ];
    list.PageName = "ApplicationFeatureRolesPerms";
    list.lookupFields = ["ApplicationFeature($select=PageTitle,label,ParentId)"];

    list.filter = ["OrgId eq " + this.UserDetails[0]["orgId"] + rolefilter];
    this.ApplicationRoleList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var ResultedPermittedFeatures = [];
        var _roleId = this.searchForm.get("RoleId").value;
        var roleFilteredAssigned = data.value.filter(db => db.RoleId == _roleId);
        var filteredFeature = this.Features.filter(f => f.ApplicationId == this.searchForm.get("ApplicationId").value);

        filteredFeature.forEach(p => {
          var existing = roleFilteredAssigned.filter(r => r.ApplicationFeatureId == p.PageId);
          if (existing.length > 0)
            ResultedPermittedFeatures.push({
              ApplicationFeatureRoleId: existing[0].ApplicationFeatureRoleId,
              ApplicationFeatureId: existing[0].ApplicationFeatureId,
              FeatureName: p.label,// this.Features.filter(t => t.PageId == existing[0].ApplicationFeatureId)[0].Label,
              RoleId: existing[0].RoleId,
              Role: this.Roles.filter(r => r.MasterDataId == existing[0].RoleId)[0].MasterDataName,
              PermissionId: existing[0].PermissionId,
              ParentId: p.ParentId,
              Active: existing[0].Active,
              Action: false
            })
          else
            ResultedPermittedFeatures.push({
              ApplicationFeatureRoleId: 0,
              ApplicationFeatureId: p.PageId,
              FeatureName: p.label,// this.Features.filter(t => t.PageId == p.PageId)[0].Label,
              RoleId: _roleId,
              Role: this.Roles.filter(ir => ir.MasterDataId == _roleId)[0].MasterDataName,
              PermissionId: 0,
              ParentId: p.ParentId,
              Active: 0,
              Action: false
            })
        })
        const parents = ResultedPermittedFeatures.filter(x => !x.ParentId);
        const childs = ResultedPermittedFeatures.filter(x => x.ParentId).sort((a, b) => a.ParentId - b.ParentId);

        parents.forEach(a => {
          this.ApplicationRoleList.push(a);
          var temp = childs.filter(c => c.ParentId == a.ApplicationFeatureId);
          temp.forEach(b => {
            b.FeatureName = "&nbsp;&nbsp;" + b.FeatureName;
            this.ApplicationRoleList.push(b);
          })
        });
    //    console.log('applist', this.ApplicationRoleList)
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
  saveall() {
    this.ApplicationRoleList.forEach((record, indx) => {
      if (record.Action == true) {
        this.UpdateOrSave(record);
      }
      if (indx == this.ApplicationRoleList.length - 1) {
        this.alert.success("All attendance saved sucessfully.", this.optionAutoClose);
        //this.SaveAll = false;
      }
    })
  }
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
      ApplicationFeatureId: this.searchForm.get("ApplicationFeatureId").value,
      FeatureName: this.Features.filter(t => t.PageId == this.searchForm.get("ApplicationFeatureId").value)[0].PageTitle,
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
      this.alert.error("Please select permission", this.optionAutoClose);
      return;
    }
    this.loading = true;
    let checkFilterString = "Active eq 1 " +
      " and RoleId eq " + row.RoleId +
      // " and PermissionId eq " + row.PermissionId +
      " and ApplicationFeatureId eq " + row.ApplicationFeatureId +
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
          this.alert.error("Record already exists!", this.optionAutoClose);
          this.loading = false;
        }
        else {
          //console.log(this.UserDetail);
          this.AppRoleData.Active = row.Active;
          this.AppRoleData.ApplicationFeatureRoleId = row.ApplicationFeatureRoleId;
          this.AppRoleData.ApplicationFeatureId = row.ApplicationFeatureId;
          this.AppRoleData.RoleId = row.RoleId;
          this.AppRoleData.PermissionId = row.PermissionId;
          this.AppRoleData.OrgId = this.UserDetails[0]["orgId"];
          this.AppRoleData["DepartmentId"] = 0;
          this.AppRoleData["LocationId"] = 0;

          console.log('data', this.AppRoleData);
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
          if (this.NoOfRowsToUpdate == 0)
            this.alert.success("Data saved successfully.", this.optionAutoClose);
          this.NoOfRowsToUpdate = -1;
        });
  }
  update(row) {

    this.dataservice.postPatch('ApplicationFeatureRolesPerms', this.AppRoleData, this.AppRoleData.ApplicationFeatureRoleId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.Action = false;
          if (this.NoOfRowsToUpdate == 0)
            this.alert.success("Data updated successfully.", this.optionAutoClose);
          this.NoOfRowsToUpdate = -1;
        });
  }
  selected(event) {
    this.selectedData = event.target.value;
  }
  getoldvalue(value: string, row) {
    this.oldvalue = row.MasterDataName;
    //  console.log('old value', this.oldvalue);
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
  ApplicationFeatureId: number;
  FeatureName: string;
  RoleId: number;
  Role: string;
  PermissionId: number;
  Active: number;
}