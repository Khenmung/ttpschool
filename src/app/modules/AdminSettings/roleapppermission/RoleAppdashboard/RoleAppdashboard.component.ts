import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { DialogService } from 'src/app/shared/dialog.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-RoleAppdashboard',
  templateUrl: './RoleAppdashboard.component.html',
  styleUrls: ['./RoleAppdashboard.component.scss']
})
export class RoleAppdashboardComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  topMaster = 0;
  MasterData = [];
  Roles = [];
  Permissions = [];
  // FeeNames = [];
  // Classes = [];
  // Batches = [];
  // Locations = [];
  ApplicationRoleList = [];
  TopMasters = [];
  DefinedMaster = [];
  SelectedMaster = [];
  oldvalue = '';
  selectedData = '';
  datasource: MatTableDataSource<IApplicationRolePermission>;
  AppRoleData = {
    ApplicationRoleId: 0,
    ApplicationId: 0,
    RoleId: 0,
    PermissionId: 0,
    OrgId: 0,
    Active: 0
  };

  ApplicationDataStatus = [];
  SchoolDataStatus = [];
  DisplayColumns = [
    "Id",
    "ApplicationName",
    "Role",
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
    private dialog: DialogService) { }

  ngOnInit(): void {
    // this.UserDetails = this.tokenStorage.getUserDetail();
    // if(this.UserDetails==null)
    // {
    //   this.alert.error('Please login to be able to add masters!',this.optionAutoClose);
    //   this.route.navigate(['auth/login']);
    // }
    // this.GetTopMasters();
  }

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

  searchForm = this.fb.group(
    {
      ParentId: [0],
      RoleId: [0],
      //PermissionId: [0]
    })
  PageLoad() {
    debugger;
    this.loading = true;
    this.UserDetails = this.tokenStorage.getUserDetail();
    if (this.UserDetails == null) {
      this.alert.error('Please login to be able to add masters!', this.optionAutoClose);
      this.route.navigate(['auth/login']);
    }
    this.Permissions = globalconstants.PERMISSIONTYPES;
    this.GetTopMasters();
  }

  GetTopMasters() {
    let list: List = new List();
    list.fields = ["MasterDataId", "ParentId", "MasterDataName", "Description", "Active", "OrgId"];
    list.PageName = "MasterDatas";
    list.filter = ["(ParentId eq 0 or OrgId eq " + this.UserDetails[0]["orgId"] + ") and Active eq 1"];//this.searchForm.get("ParentId").value];
    debugger;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.MasterData = [...data.value];
          this.TopMasters = data.value.filter(m => {
            return m.ParentId == 0
          });
          console.log("top", this.TopMasters);
          this.DefinedMaster = data.value.filter(m => m.OrgId == this.UserDetails[0]["orgId"]);
          let applicationData = globalconstants.MasterDefinitions[0].application;
          this.ApplicationDataStatus = this.getSettingStatus(applicationData);
          this.Roles = this.getDropDownData(globalconstants.MasterDefinitions[0].application[0].ROLE);
          let schoolData = globalconstants.MasterDefinitions[1].school;
          this.SchoolDataStatus = this.getSettingStatus(schoolData);
          this.loading = false;

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
    debugger;
    if (elment.value > 0)
      this.enableTopEdit = true;
    else
      this.enableTopEdit = false;
  }

  GetApplicationRole() {
    debugger;
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName"];
    list.PageName = "MasterDatas";
    list.filter = ["ParentId eq " + this.searchForm.get("ParentId").value + " and OrgId eq " + this.UserDetails[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.SelectedMaster = data.value.map(item => {
          return {
            "ApplicationId": item.MasterDataId,
            "ApplicationName": item.MasterDataName
          }
        })

        var rolefilter = '';
        if (this.searchForm.get("RoleId").value > 0)
          rolefilter = " and RoleId eq " + this.searchForm.get("RoleId").value;

        let list: List = new List();
        list.fields = [
          "ApplicationRoleId",
          "ApplicationId",
          "RoleId",
          "PermissionId",
          "Active"
        ];
        list.PageName = "ApplicationRoles";
        list.filter = ["OrgId eq " + this.UserDetails[0]["orgId"] + rolefilter];
        this.ApplicationRoleList = [];
        this.dataservice.get(list)
          .subscribe((data: any) => {
            let slno = 0;
            let filteredRole = [];
            if (this.searchForm.get("RoleId").value > 0)
              filteredRole = this.Roles.filter(r => r.MasterDataId == this.searchForm.get("RoleId").value)
            else
              filteredRole = this.Roles;

            this.SelectedMaster.forEach(application => {
              filteredRole.forEach(role => {
                slno += 1
                let existing = data.value.filter(db => db.ApplicationId == application.ApplicationId && db.RoleId == role.MasterDataId)
                if (existing.length > 0) {
                  this.ApplicationRoleList.push({
                    Id: slno,
                    ApplicationRoleId: existing[0].ApplicationRoleId,
                    ApplicationId: application.ApplicationId,
                    ApplicationName: application.ApplicationName,
                    RoleId: existing[0].RoleId,
                    Role: this.Roles.filter(r => r.MasterDataId == existing[0].RoleId)[0].MasterDataName,
                    PermissionId: existing[0].PermissionId,
                    Active: existing[0].Active,
                    Action: false
                  })
                }
                else {
                  this.ApplicationRoleList.push(
                    {
                      Id: slno,
                      ApplicationRoleId: 0,
                      ApplicationId: application.ApplicationId,
                      ApplicationName: application.ApplicationName,
                      RoleId: role.MasterDataId,
                      Role: this.Roles.filter(r => r.MasterDataId == role.MasterDataId)[0].MasterDataName,
                      PermissionId: 0,
                      Active: 0,
                      Action: true
                    }
                  )
                }
              })
            })
            this.datasource = new MatTableDataSource<IApplicationRolePermission>(this.ApplicationRoleList);
            this.datasource.sort = this.sort;
            this.datasource.paginator = this.paginator;
          });
      })
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
  UpdateSaveButton(element){
    debugger;
    element.Action = true;
  }
  UpdateActive(element, event) {
    element.Action = true;
    element.Active = event.checked == true ? 1 : 0;
  }
  UpdateOrSave(row) {

    if (row.PermissionId == 0) {
      this.alert.error("Please select permission", this.optionAutoClose);
      return;
    }

    let checkFilterString = "Active eq 1 " +
      " and RoleId eq " + row.RoleId +
      " and PermissionId eq " + row.PermissionId +
      " and ApplicationId eq " + row.ApplicationId +
      " and OrgId eq " + this.UserDetails[0]["orgId"];

    if (this.AppRoleData.ApplicationRoleId > 0)
      checkFilterString += " and ApplicationRoleId ne " + this.AppRoleData.ApplicationRoleId;

    let list: List = new List();
    list.fields = ["ApplicationRoleId"];
    list.PageName = "ApplicationRoles";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.alert.error("Record already exists!", this.optionAutoClose);
        }
        else {
          //console.log(this.UserDetail);
          this.AppRoleData.Active = row.Active;
          this.AppRoleData.ApplicationRoleId = row.ApplicationRoleId;
          this.AppRoleData.ApplicationId = row.ApplicationId;
          this.AppRoleData.RoleId = row.RoleId;
          this.AppRoleData.PermissionId = row.PermissionId;
          this.AppRoleData.OrgId = this.UserDetails[0]["orgId"];
          this.AppRoleData["DepartmentId"] = 0;
          this.AppRoleData["LocationId"] = 0;

          //console.log('data',this.AppRoleData);
          if (this.AppRoleData.ApplicationRoleId == 0) {
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
            this.update();
          }
          row.Action =false;
        }
      });
  }

  insert(row) {

    debugger;
    this.dataservice.postPatch('ApplicationRoles', this.AppRoleData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ApplicationRoleId = data.ApplicationRoleId;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update() {

    this.dataservice.postPatch('ApplicationRoles', this.AppRoleData, this.AppRoleData.ApplicationRoleId, 'patch')
      .subscribe(
        (data: any) => {
          this.alert.success("Data updated successfully.", this.optionAutoClose);
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
  ApplicationRoleId: number;
  ApplicationId: number;
  ApplicationName: string;
  RoleId: number;
  Role: string;
  PermissionId: number;
  Active: number;
}