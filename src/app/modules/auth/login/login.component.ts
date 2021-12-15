import { Component, Input, OnInit } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
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
  allMasterData = [];
  Organizations = [];
  Departments = [];
  Applications = [];
  Locations = [];
  Roles = [];
  ApplicationFeatures = [];
  form: any = {
    username: null,
    password: null
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  UserDetail = [];
  RoleFilter = '';
  username: string = '';
  mediaSub: Subscription;
  deviceXs: boolean;
  common: globalconstants;
  constructor(private authService: AuthService,
    private alert: AlertService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private route: Router,
    private shareddata: SharedataService,
    private mediaObserver: MediaObserver,
  ) { }

  ngOnInit(): void {
    this.mediaSub = this.mediaObserver.media$.subscribe((result: MediaChange) => {
      this.deviceXs = result.mqAlias === "xs" ? true : false;
      ////console.log("authlogin",this.deviceXs);
    });
    //debugger;
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.route.navigate(['/dashboard']);
    }
    //this.GetApplicationFeatures();
    // this.shareddata.GetApplication().subscribe((data: any) => {
    //   this.Applications = [...data.value];
    // });
  }
  onSubmit(): void {
    const { username, password } = this.form;

    this.authService.login(username, password).subscribe(
      data => {
        debugger;
        this.tokenStorage.saveToken(data.token);
        this.tokenStorage.saveRefreshToken(data.refreshToken);
        this.tokenStorage.saveUser(data);

        const decodedUser = this.jwtHelper.decodeToken(data.token);
        this.userInfo = JSON.parse(JSON.stringify(decodedUser));

        localStorage.setItem('orgId', decodedUser.sid);
        localStorage.setItem('userId', decodedUser.Id);
        localStorage.setItem('planId', decodedUser.iss);
        console.log("decodedUser.iss",decodedUser.iss)
        //  localStorage.setItem('userInfo',decodedUser);
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        //this.roles = this.tokenStorage.getUser().roles;
        this.GetApplicationRoleUser();
        //this.reloadPage();

      },
      err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      }
    );
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
          this.route.navigate(["/auth/apps"]);
        }
      })
  }

  GetMasterData(UserRole) {
    debugger;
    let list: List = new List();
    list.fields = ["MasterDataId","MasterDataName","Description","ParentId"];
    list.PageName = "MasterItems";
    list.lookupFields = ["PlanAndMasterItems($filter=PlanId eq "+ localStorage.getItem('planId') + ";$select=MasterDataId,PlanAndMasterDataId,PlanId,ApplicationId)"];
    list.filter = ["(ParentId eq 0 or OrgId eq "+ localStorage.getItem('orgId')+") and Active eq 1"];
    
    this.dataservice.get(list)
      .subscribe((data: any) => {
        ////console.log(data.value);
        this.shareddata.ChangeMasterData(data.value);
        this.allMasterData = [...data.value];//.filter(f=>f.);

        this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.bang);

        this.Roles = this.getDropDownData(globalconstants.MasterDefinitions.school.ROLE);
        this.shareddata.ChangeRoles(this.Roles);

        this.RoleFilter = ' and (RoleId eq 0';
        var __organization = '';
        if (UserRole[0].OrgId != null)
          __organization = UserRole[0].Org.OrganizationName;

        this.UserDetail = [{
          employeeId:this.userInfo["nameid"],
          userId: this.userInfo["Id"],
          userName: this.userInfo["email"],
          email: this.userInfo["email"],
          orgId: UserRole[0].OrgId,
          org: __organization,
          planId:localStorage.getItem("planId"),
          RoleUsers: UserRole.map(roleuser => {
            if (roleuser.Active == 1 && roleuser.RoleId != null) {
              this.RoleFilter += ' or RoleId eq ' + roleuser.RoleId
              var _role = '';
              if (this.Roles.length > 0 && roleuser.RoleId != null)
                _role = this.Roles.filter(a => a.MasterDataId == roleuser.RoleId)[0].MasterDataName;
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


      }, error => {
        this.tokenStorage.signOut();
      });
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

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          var _applicationName = '';
          var _appShortName = '';
          this.UserDetail[0]["applicationRolePermission"] = [];
          data.value.forEach(item => {
            _applicationName = '';
            _appShortName = '';
            _applicationName = this.Applications.filter(f => f.MasterDataId == item.PlanFeature.Page.ApplicationId)[0].Description;
            _appShortName = this.Applications.filter(f => f.MasterDataId == item.PlanFeature.Page.ApplicationId)[0].MasterDataName

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

          });
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
          this.route.navigate(['control/settings']);
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
  getDropDownData(dropdowntype) {
    let Ids = this.allMasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    })
    if (Ids.length > 0) {
      let Id = Ids[0].MasterDataId;
      return this.allMasterData.filter((item, index) => {
        return item.ParentId == Id
      });
    }
    else
      return [];
  }
  gotohome() {
    this.route.navigate(['/dashboard']);
  }

}