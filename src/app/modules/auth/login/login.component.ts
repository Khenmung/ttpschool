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
      //console.log("authlogin",this.deviceXs);
    });
    debugger;
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.route.navigate(['/dashboard']);
    }
    this.GetApplicationFeatures();
    // this.shareddata.GetApplication().subscribe((data: any) => {
    //   this.Applications = [...data.value];
    // });
  }

  // onSubmit(): void {

  //   const { username, password } = this.form;

  //   this.authService.login(username, password).subscribe(

  //     data => {
  //       debugger;
  //       //console.log("login data",data);
  //       //this.tokenStorage.saveToken(data.Token);
  //       //this.tokenStorage.saveRefreshToken(data.RefreshToken);
  //       this.tokenStorage.saveUser(username);
  //       this.GetApplicationRoleUser();
  //       //this.GetMasterData();        
  //     },
  //     err => {
  //       this.errorMessage = err.error.message;
  //       this.isLoginFailed = true;
  //     }
  //   );
  // }
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
        //  localStorage.setItem('expiration', decodedUser.exp);
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

    //this.userInfo = JSON.parse(localStorage.getItem('userInfo')); 

    console.log('userinfo after login', this.userInfo)
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
        debugger;
        console.log("data", data)
        if (data.value.length > 0) {
          if (data.value[0].Org.Active == 1)
            this.GetMasterData(data.value);
          else {
            this.alert.info("User's Organization not active!, Please contact your administrator!", this.optionsNoAutoClose);
          }
        }
      })
  }

  GetMasterData(UserRole) {
    debugger;
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "Description", "ParentId"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 and (ParentId eq 0 or OrgId eq " + UserRole[0].OrgId + ")"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //console.log(data.value);
        this.shareddata.ChangeMasterData(data.value);
        this.allMasterData = [...data.value];

        // this.Organizations = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.ORGANIZATION);
        // this.shareddata.ChangeOrganization(this.Organizations);

        this.Departments = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.DEPARTMENT);
        this.shareddata.ChangeDepartment(this.Departments);

        this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.bang);

        this.Locations = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.LOCATION);
        this.shareddata.ChangeLocation(this.Locations);

        this.Roles = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.ROLE);
        this.shareddata.ChangeRoles(this.Roles);

        this.RoleFilter = ' and (RoleId eq 0';
        //var _location = '';
        // if (this.Locations.length > 0 && UserRole.LocationId != null)
        //   _location = this.Locations.filter(l => l.MasterDataId == UserRole.LocationId)[0].MasterDataName;
        // var _department = '';
        // if (this.Departments.length > 0 && UserRole.DepartmentId != null)
        //   _department = this.Departments.filter(l => l.MasterDataId == UserRole.DepartmentId)[0].MasterDataName;
        var __organization = '';
        if (UserRole[0].OrgId != null)
          __organization = UserRole[0].Org.OrganizationName;

        this.UserDetail = [{
          userId: this.userInfo["Id"],
          userName: this.userInfo["email"],
          email: this.userInfo["email"],
          orgId: UserRole[0].OrgId,
          org: __organization,
          //validfrom: UserRole.ValidFrom,
          //validto: UserRole.ValidTo,
          //managerId: UserRole.ManagerId,
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
        this.GetApplicationRolesPermission();


      }, error => {
        this.tokenStorage.signOut();
      });
  }

  GetApplicationRolesPermission() {

    let list: List = new List();
    list.fields = [
      'ApplicationFeatureId',
      'RoleId',
      'PermissionId'
    ];

    list.PageName = "ApplicationFeatureRolesPerms";
    //list.lookupFields=["ApplicationFeature"]
    list.filter = ["Active eq 1 " + this.RoleFilter];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          var _applicationFeature = '';
          var _applicationName = '';
          var _appShortName = '';

          this.UserDetail[0]["applicationRolePermission"] = data.value.map(item => {
            _applicationFeature = '';
            _applicationName = '';
            _appShortName = '';
            if (this.ApplicationFeatures.length > 0 && item.ApplicationFeatureId != null) {
              var appsfeatures = this.ApplicationFeatures.filter(a => a.ApplicationFeatureId == item.ApplicationFeatureId);
              _applicationFeature = appsfeatures[0].FeatureName;
              _applicationName = this.Applications.filter(f => f.MasterDataId == appsfeatures[0].ApplicationId)[0].Description;
              _appShortName = this.Applications.filter(f => f.MasterDataId == appsfeatures[0].ApplicationId)[0].MasterDataName
            }
            var _permission = '';
            if (item.PermissionId != null)
              _permission = globalconstants.PERMISSIONTYPES.filter(a => a.val == item.PermissionId)[0].type

            return {
              'applicationFeatureId': item.ApplicationFeatureId,
              'applicationFeature': _applicationFeature,
              'roleId': item.RoleId,
              'permissionId': item.PermissionId,
              'permission': _permission,
              'applicationName': _applicationName,
              'applicationId': appsfeatures[0].ApplicationId,
              'appShortName': _appShortName
            }
          })

          this.tokenStorage.saveUserdetail(this.UserDetail);
          //this.tokenStorage.
          //console.log('userdetail', this.tokenStorage.getUserDetail());
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
      'ApplicationFeatureId',
      'FeatureName',
      'ApplicationId'
    ];

    list.PageName = "ApplicationFeatures";
    list.filter = ["Active eq 1"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
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