import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-roleuseradd',
  templateUrl: './roleuseradd.component.html',
  styleUrls: ['./roleuseradd.component.scss']
})
export class roleuseraddComponent implements OnInit {
  @Output() OutRoleUserId = new EventEmitter();
  @Input("RoleUserId") RoleUserId: number;
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
  //Applications = [];
  Users = [];
  RoleUserData = {
    UserId: 0,
    RoleId: 0,
    RoleUserId: 0,
    OrgId: 0,
    Active: 1
  };
  UserDetail = [];
  constructor(
    private shareddata: SharedataService,
    private dataservice: NaomitsuService,
    private route: Router,
    private alert: AlertService,
    private fb: FormBuilder,
    private tokenstorage: TokenStorageService
  ) {

  }

  AppRoleUserForm = this.fb.group({
    RoleUserId: [0],
    UserId: [0, Validators.required],
    RoleId: [0, Validators.required],
    Active: [1, Validators.required],
  })

  ngOnInit(): void {
    
  }
  PageLoad(){
    this.UserDetail = this.tokenstorage.getUserDetail();
    if (this.UserDetail == null) {
      this.route.navigate(['auth/login']);
      return;
    }
    this.shareddata.CurrentRoles.subscribe(r => this.Roles = r);
    this.GetAppUsers();
  }
  back() {
      this.OutRoleUserId.emit(0);
  }
  get f() {
    return this.AppRoleUserForm.controls;
  }

  GetAppUsers() {
    var OrgIdSearchstr = '';
    if (this.UserDetail.length > 0) {
      OrgIdSearchstr = " and OrgId eq " + this.UserDetail[0]["orgId"];
    }
    else
      return;

    let list: List = new List();

    list.fields = ["ApplicationUserId", "UserName"];
    list.PageName = "AppUsers";
    list.filter = ["Active eq 1 " + OrgIdSearchstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Users = [...data.value];
        this.GetRoleUser();
      });
  }
  GetRoleUser() {

    let list: List = new List();
    list.fields = ["RoleUserId", "UserId", "RoleId","Active"];
    list.PageName = "RoleUsers";
    list.filter = ["Active eq 1 and RoleUserId eq " + this.RoleUserId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        console.log('roleuser', data);
        data.value.forEach(element => {
          this.AppRoleUserForm.patchValue({
            RoleUserId: element.RoleUserId,
            UserId: element.UserId,
            RoleId: element.RoleId,
            Active: element.Active
          })
        });          
        });
  }

  UpdateOrSave() {

    let checkFilterString = "Active eq 1 " +
      " and RoleId eq " + this.AppRoleUserForm.get("RoleId").value +
      " and UserId eq " + this.AppRoleUserForm.get("UserId").value;

    if (this.RoleUserData.RoleUserId > 0)
      checkFilterString += " and RoleUserId ne " + this.RoleUserData.RoleUserId;

    let list: List = new List();
    list.fields = ["RoleUserId"];
    list.PageName = "RoleUsers";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {
          this.RoleUserData.Active = this.AppRoleUserForm.get("Active").value==true?1:0;
          this.RoleUserData.RoleUserId = this.AppRoleUserForm.get("RoleUserId").value;
          this.RoleUserData.RoleId = this.AppRoleUserForm.get("RoleId").value;
          this.RoleUserData.UserId = this.AppRoleUserForm.get("UserId").value;
          this.RoleUserData.OrgId = this.UserDetail[0]["orgId"];
          if (this.RoleUserData.RoleUserId == 0) {
            this.insert();
          }
          else {
            this.update();
          }

        }
        this.OutRoleUserId.emit(0);
      });
  }

  insert() {

    debugger;
    this.dataservice.postPatch('RoleUsers', this.RoleUserData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update() {

    this.dataservice.postPatch('RoleUsers', this.RoleUserData, this.RoleUserData.RoleUserId, 'patch')
      .subscribe(
        (data: any) => {
          this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }
}
