import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-approleuseradd',
  templateUrl: './approleuseradd.component.html',
  styleUrls: ['./approleuseradd.component.scss']
})
export class ApproleuseraddComponent implements OnInit {
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  allMasterData = [];
  AppUsers = [];
  Roles = [];
  Applications = [];
  Users = [];
  ApplicationRoleUserData = {
    UserId: 0,
    ApplicationId: 0,
    ApplicationRoleUserId: 0,
    RoleId: 0,
    ValidFrom: new Date(),
    ValidTo: new Date(),
    CreatedDate: new Date(),
    UpdatedDate: new Date(),
    CreatedBy: '',
    UpdatedBy: '',
    Active: 1
  };
  UserDetail = [];
  constructor(
    private dataservice: NaomitsuService,
    private route: Router,
    private alert: AlertService,
    private fb: FormBuilder,
    private tokenstorage: TokenStorageService
  ) {

  }

  AppRoleUserForm = this.fb.group({
    UserId: [0, Validators.required],
    RoleId: [0, Validators.required],
    ApplicationId: [0, Validators.required],
    ValidFrom: [new Date(), Validators.required],
    ValidTo: [new Date(), Validators.required],
    Active: [1, Validators.required]
  })

  ngOnInit(): void {
    this.UserDetail = this.tokenstorage.getUserDetail();
    if (this.UserDetail == null) {
      this.route.navigate(['auth/login']);
      return;
    }
    this.GetAppUsers();
    this.GetMasterData();
  }
  back() {

  }
  get f() {
    return this.AppRoleUserForm.controls;
  }
  GetAppUsers() {

    let list: List = new List();
    list.fields = ["ApplicationUserId","UserName"];
    list.PageName = "AppUsers";
    list.filter = ["Active eq 1 and OrgId eq " + this.UserDetail["OrgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.Users = [...data.value];
        }
        else
          this.alert.error("Problem fetching app users", this.optionsNoAutoClose);
      });

  }
  GetMasterData() {
    var applicationIdSearchstr = '';
    let userdetail = this.tokenstorage.getUserDetail();
    if (userdetail.length > 0) {
      userdetail.ApplicationsRoleUsers.forEach(element => {
        if (applicationIdSearchstr.length > 0)
          applicationIdSearchstr += ' or ApplicationId eq ' + element.ApplicationId
        else
          applicationIdSearchstr += ' ApplicationId eq ' + element.ApplicationId
      });

      if (applicationIdSearchstr.length > 0) {
        applicationIdSearchstr = " and (" + applicationIdSearchstr + ')';
      }

    }

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1 " + applicationIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Roles = this.getDropDownData(globalconstants.MasterDefinitions.ROLES);
        this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.APPLICATIONS);
      });
  }
  getDropDownData(dropdowntype) {
    let Id = this.allMasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    })[0].MasterDataId;
    return this.allMasterData.filter((item, index) => {
      return item.ParentId == Id
    });
  }

  UpdateOrSave() {

    // let re = /^[.0-9]*$/
    // //console.log('pay', row.Pay)
    // let valid = re.test(row.Pay);
    // if (!valid) {
    //   this.alert.error("Invalid amount! Please enter numeric value", this.optionsNoAutoClose);
    //   return;
    // }

    let checkFilterString = "Active eq 1 " +
      " and ApplicationId eq " + this.AppRoleUserForm.get("ApplicationId").value +
      " and RoleId eq " + this.AppRoleUserForm.get("RoleId").value +
      " and UserId eq " + this.AppRoleUserForm.get("RoleId").value +
      " and Active eq 1";

    if (this.ApplicationRoleUserData.ApplicationRoleUserId > 0)
      checkFilterString += " and ApplicationRoleUserId ne " + this.ApplicationRoleUserData.ApplicationRoleUserId;

    let list: List = new List();
    list.fields = ["ApplicationRoleUserId"];
    list.PageName = "ApplicationRoleUsers";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {
          this.ApplicationRoleUserData.Active = 1;
          this.ApplicationRoleUserData.ApplicationId = this.AppRoleUserForm.get("ApplicationId").value;
          this.ApplicationRoleUserData.RoleId = this.AppRoleUserForm.get("RoleId").value;
          this.ApplicationRoleUserData.UserId = this.AppRoleUserForm.get("UserId").value;
          this.ApplicationRoleUserData.ValidFrom = this.AppRoleUserForm.get("ValidFrom").value;
          this.ApplicationRoleUserData.ValidTo = this.AppRoleUserForm.get("ValidTo").value;

          if (this.ApplicationRoleUserData.ApplicationRoleUserId == 0) {
            this.ApplicationRoleUserData.CreatedDate = new Date();
            this.ApplicationRoleUserData.CreatedBy = this.tokenstorage.getUser();
            this.insert();
          }
          else {
            this.ApplicationRoleUserData.UpdatedDate = new Date();
            this.ApplicationRoleUserData.UpdatedBy = this.tokenstorage.getUser();
            this.update();
          }
        }
      });
  }

  insert() {

    debugger;
    this.dataservice.postPatch('ApplicationRoleUsers', this.ApplicationRoleUserData, 0, 'post')
      .subscribe(
        (data: any) => {

        });
  }
  update() {

    this.dataservice.postPatch('ApplicationRoleUsers', this.ApplicationRoleUserData, this.ApplicationRoleUserData.ApplicationRoleUserId, 'patch')
      .subscribe(
        (data: any) => {
          this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }
}
