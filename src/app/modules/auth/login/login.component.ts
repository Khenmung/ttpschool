import { Component, Input, OnInit } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { AuthService } from '../../../_services/auth.service';
import { TokenStorageService } from '../../../_services/token-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  jwtHelper = new JwtHelperService();
  userInfo = [];
  loading = false;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionsAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  //allMasterData = [];
  Organizations = [];
  Departments = [];
  Applications = [];
  Locations = [];
  Roles = [];
  ApplicationFeatures = [];
  loginForm: FormGroup;
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  UserDetail = [];
  RoleFilter = '';
  username: string = '';
  mediaSub: Subscription;
  deviceXs: boolean;
  //common: globalconstants;
  IsSubmitted = false;
  constructor(private authService: AuthService,
    private alert: AlertService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private route: Router,   
    private mediaObserver: MediaObserver,
    private fb: FormBuilder,
    private contentservice: ContentService
  ) { }

  ngOnInit(): void {
    this.mediaSub = this.mediaObserver.media$.subscribe((result: MediaChange) => {
      this.deviceXs = result.mqAlias === "xs" ? true : false;
      ////console.log("authlogin",this.deviceXs);
    });
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    })

    debugger;
    var loginUserDetail = this.tokenStorage.getUserDetail();
    //if (this.tokenStorage.getToken()) {
    if (loginUserDetail.length > 0) {
      this.isLoggedIn = true;
      this.route.navigate(['/dashboard']);
    }

  }
  onSubmit(): void {
    this.IsSubmitted = true;
    this.username = this.loginForm.get("username").value;
    var password = this.loginForm.get("password").value;
    debugger;
    this.loading = true;
    this.authService.login(this.username, password).subscribe(
      data => {

        this.tokenStorage.saveToken(data.token);
        this.tokenStorage.saveRefreshToken(data.refreshToken);
        this.tokenStorage.saveUser(data);

        const decodedUser = this.jwtHelper.decodeToken(data.token);
        this.userInfo = JSON.parse(JSON.stringify(decodedUser));

        localStorage.setItem('orgId', decodedUser.sid);
        localStorage.setItem('userId', decodedUser.Id);
        localStorage.setItem('planId', decodedUser.iss);
        localStorage.setItem('username', decodedUser.email);
        localStorage.setItem('employeeId', decodedUser.nameid);

        //console.log("decodedUser.iss",decodedUser.iss)
        //if PlanId is zero, redirect to select plan.
        if (+decodedUser.iss == 0)
          this.route.navigate(['/auth/selectplan']);
        else {
          //  localStorage.setItem('userInfo',decodedUser);
          this.isLoginFailed = false;
          this.isLoggedIn = true;
          //this.roles = this.tokenStorage.getUser().roles;
          this.GetApplicationRoleUser();
          //this.reloadPage();
        }
      },
      err => {
        this.loading = false;
        this.errorMessage = '';
        err.error.errors.forEach(x => this.errorMessage += x);
        this.isLoginFailed = true;
      }
    );
    this.IsSubmitted = false;
  }

  reloadPage(): void {
    window.location.reload();
  }
  GetApplicationRoleUser() {

    debugger;
    let list: List = new List();
    list.fields = [
      'UserId',
      'RoleId',
      'OrgId',
      'Active'
    ];

    list.PageName = "RoleUsers";
    list.lookupFields = ["Org($select=OrganizationId,OrganizationName,LogoPath,Active)"];

    list.filter = ["Active eq 1 and UserId eq '" + this.userInfo["Id"] + "'"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        ////console.log("data", data)
        if (data.value.length > 0) {
          if (data.value[0].Org.Active == 1)
            this.GetMasterData(data.value);
          else {
            this.alert.info("User's Organization not active!, Please contact your administrator!", this.optionsNoAutoClose);
          }
        }
        else {
          //if no roleuser data present redirect to select apps.
          this.route.navigate(["/auth/selectplan"]);
        }
      })
  }

  GetMasterData(UserRole) {
    debugger;
    //this.Applications = this.tokenStorage.getPermittedApplications();

    this.contentservice.GetParentZeroMasters().subscribe((data: any) => {
      var TopMasters = [...data.value];
      var countryparentId = TopMasters.filter(f => f.MasterDataName.toLowerCase() == 'application')[0].MasterDataId;
      var appId = TopMasters.filter(f => f.MasterDataName.toLowerCase() == 'application')[0].ApplicationId;
      this.contentservice.GetDropDownDataFromDB(countryparentId, 0, 0)
        .subscribe((data: any) => {
          this.Applications = [...data.value];
          var commonappId = this.Applications.filter(f => f.MasterDataName.toLowerCase() == 'common')[0].MasterDataId;
          var roleparentId = TopMasters.filter(f => f.MasterDataName.toLowerCase() == 'role')[0].MasterDataId;
          this.contentservice.GetDropDownDataFromDB(roleparentId, localStorage.getItem('orgId'), commonappId)
            .subscribe((data: any) => {
              this.Roles = [...data.value];


              this.RoleFilter = ' and (RoleId eq 0';
              var __organization = '';
              if (UserRole[0].OrgId != null)
                __organization = UserRole[0].Org.OrganizationName;

              this.UserDetail = [{
                employeeId: this.userInfo["nameid"],
                userId: this.userInfo["Id"],
                userName: this.userInfo["email"],
                email: this.userInfo["email"],
                orgId: UserRole[0].OrgId,
                org: __organization,
                planId: localStorage.getItem("planId"),
                logoPath: UserRole[0].Org.LogoPath,
                RoleUsers: UserRole.map(roleuser => {
                  if (roleuser.Active == 1 && roleuser.RoleId != null) {
                    this.RoleFilter += ' or RoleId eq ' + roleuser.RoleId
                    var _role = '';
                    if (this.Roles.length > 0 && roleuser.RoleId != null)
                      var _roleobj = this.Roles.filter(a => a.MasterDataId == roleuser.RoleId)
                    if (_roleobj.length > 0) {
                      _role = _roleobj[0].MasterDataName;
                    }
                    else {
                      this.alert.error("No matching role found.", this.optionsNoAutoClose);
                    }
                    return {
                      roleId: roleuser.RoleId,
                      role: _role,

                    }
                  }
                  else
                    return false;
                })
              }]

              //login detail is save even though roles are not defined.
              //so that user can continue their settings.
              this.tokenStorage.saveUserdetail(this.UserDetail);
              if (this.RoleFilter.length > 0)
                this.RoleFilter += ')';
              this.tokenStorage.saveCheckEqualBatchId
              this.GetApplicationRolesPermission();
            })
        })
    })
  }
  get f() {
    return this.loginForm.controls;
  }
  GetApplicationRolesPermission() {

    let list: List = new List();
    list.fields = [
      'PlanFeatureId',
      'RoleId',
      'PermissionId'
    ];

    list.PageName = "ApplicationFeatureRolesPerms";
    list.lookupFields = ["PlanFeature($filter=Active eq 1;$select=PageId;$expand=Page($select=PageTitle,label,link,faIcon,ApplicationId,ParentId))"]
    list.filter = ["Active eq 1 " + this.RoleFilter];
    debugger;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          var _applicationName = '';
          var _appShortName = '';
          this.UserDetail[0]["applicationRolePermission"] = [];
          data.value.forEach(item => {
            var appObj = this.Applications.filter(f => f.MasterDataId == item.PlanFeature.Page.ApplicationId);
            _applicationName = '';
            _appShortName = '';
            //only active application's features will be available. 
            if (appObj.length > 0) {
              _applicationName = appObj[0].Description;
              _appShortName = appObj[0].MasterDataName;

              var _permission = '';
              if (item.PermissionId != null)
                _permission = globalconstants.PERMISSIONTYPES.filter(a => a.val == item.PermissionId)[0].type
              this.UserDetail[0]["applicationRolePermission"].push({
                'pageId': item.PlanFeature.PageId,
                'applicationFeature': item.PlanFeature.Page.PageTitle,//_applicationFeature,
                'roleId': item.RoleId,
                'permissionId': item.PermissionId,
                'permission': _permission,
                'applicationName': _applicationName,
                'applicationId': item.PlanFeature.Page.ApplicationId,
                'appShortName': _appShortName,
                'faIcon': item.PlanFeature.Page.faIcon,
                'label': item.PlanFeature.Page.label,
                'link': item.PlanFeature.Page.link
              });
            }
          });
          this.loading = false;
          this.tokenStorage.saveUserdetail(this.UserDetail);
          this.isLoginFailed = false;
          this.isLoggedIn = true;
          this.username = this.tokenStorage.getUser();
          var gotoUrl = this.tokenStorage.getRedirectUrl();
          if (gotoUrl.length == 0)
            gotoUrl = '/dashboard';
          this.route.navigate([gotoUrl]);
        }
        else {
          this.alert.info("Initial minimal settings must be done.", this.optionsNoAutoClose);
          this.route.navigate(['edu/setting']);
        }
      })
  }
  GetApplicationFeatures() {

    let list: List = new List();
    list.fields = [
      'PageId',
      'PageTitle',
      'label',
      'ApplicationId'
    ];

    list.PageName = "Pages";
    list.filter = ["Active eq 1"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.ApplicationFeatures = [...data.value];

        }
      })
  }
  // getDropDownData(dropdowntype) {
  //   let Ids = this.allMasterData.filter((item, indx) => {
  //     return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
  //   })
  //   if (Ids.length > 0) {
  //     let Id = Ids[0].MasterDataId;
  //     return this.allMasterData.filter((item, index) => {
  //       return item.ParentId == Id
  //     });
  //   }
  //   else
  //     return [];
  // }
  gotohome() {
    this.route.navigate(['/dashboard']);
  }

}