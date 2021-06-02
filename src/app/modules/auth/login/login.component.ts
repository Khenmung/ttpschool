import { Component, Input, OnInit } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
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
  allMasterData = [];
  Organizations = [];
  Departments = [];
  Applications = [];
  Locations = [];
  Roles = [];
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

  constructor(private authService: AuthService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private route: Router,
    private shareddata: SharedataService,
    private mediaObserver: MediaObserver) { }

  ngOnInit(): void {
    this.mediaSub = this.mediaObserver.media$.subscribe((result: MediaChange) => {
      this.deviceXs = result.mqAlias === "xs" ? true : false;
      //console.log("authlogin",this.deviceXs);
    });
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.route.navigate(['/']);
    }
  }

  onSubmit(): void {

    const { username, password } = this.form;

    this.authService.login(username, password).subscribe(

      data => {
        debugger;
        //console.log("login data",data);
        this.tokenStorage.saveToken(data.access_token);
        this.tokenStorage.saveUser(data.userName);
        this.GetApplicationRoleUser();
        //this.GetMasterData();        
      },
      err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      }
    );
  }
  GetApplicationRoleUser() {

    let list: List = new List();
    list.fields = [
      'ApplicationUserId',
      'UserName',
      'EmailAddress',
      'OrgId',
      'ManagerId',
      'LocationId',
      'DepartmentId',
      'ValidFrom',
      'ValidTo',
      'RoleUsers/RoleId',
      'RoleUsers/Active',
      'Active'];

    list.PageName = "AppUsers";
    list.lookupFields = ["RoleUsers"];

    list.filter = ["Active eq 1 and EmailAddress eq '" + this.tokenStorage.getUser() + "'"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.GetMasterData(data.value);

        }
      })
  }
  GetMasterData(UserApp) {
    debugger;
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1 and (ParentId eq 0 or OrgId eq " + UserApp[0].OrgId + ")"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //console.log(data.value);
        this.shareddata.ChangeMasterData(data.value);
        this.allMasterData = [...data.value];

        this.Organizations = this.getDropDownData(globalconstants.MasterDefinitions[0].application[0].ORGANIZATION);
        this.shareddata.ChangeOrganization(this.Organizations);

        this.Departments = this.getDropDownData(globalconstants.MasterDefinitions[0].application[0].DEPARTMENT);
        this.shareddata.ChangeDepartment(this.Departments);

        this.Applications = this.getDropDownData(globalconstants.MasterDefinitions[0].application[0].APPLICATION);
        this.shareddata.ChangeApplication(this.Applications);

        this.Locations = this.getDropDownData(globalconstants.MasterDefinitions[0].application[0].LOCATION);
        this.shareddata.ChangeLocation(this.Locations);

        this.Roles = this.getDropDownData(globalconstants.MasterDefinitions[0].application[0].ROLE);
        this.shareddata.ChangeRoles(this.Roles);

        this.UserDetail = UserApp.map(element => {
          this.RoleFilter = ' and (RoleId eq 0';
          var _location = '';
          if (this.Locations.length > 0 && element.LocationId != null)
            _location = this.Locations.filter(l => l.MasterDataId == element.LocationId)[0].MasterDataName;
          var _department = '';
          if (this.Departments.length > 0 && element.DepartmentId != null)
            _department = this.Departments.filter(l => l.MasterDataId == element.DepartmentId)[0].MasterDataName;

          return {
            userId: element.ApplicationUserId,
            userName: element.UserName,
            email: element.EmailAddress,
            orgId: element.OrgId,
            org: this.Organizations.filter(l => l.MasterDataId == element.OrgId)[0].MasterDataName,
            locationId: element.LocationId,
            location: _location,
            departmentId: element.DepartmentId,
            department: _department,
            validfrom: element.ValidFrom,
            validto: element.ValidTo,
            managerId: element.ManagerId,
            RoleUsers: element.RoleUsers.map(roleuser => {
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
          }
        })

        if (this.RoleFilter.length > 0)
          this.RoleFilter += ')';

        this.GetApplicationRoles();

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
  
  GetApplicationRoles() {

    let list: List = new List();
    list.fields = [
      'ApplicationId',
      'RoleId',
      'PermissionId'
    ];

    list.PageName = "ApplicationRoles";
    list.filter = ["Active eq 1 " + this.RoleFilter];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {

          this.UserDetail[0]["applicationRolePermission"] = data.value.map(item => {
            var _application = '';
            if (this.Applications.length > 0 && item.ApplicationId != null)
              _application = this.Applications.filter(a => a.MasterDataId == item.ApplicationId)[0].MasterDataName
            var _permission = '';
            if (item.PermissionId != null)
              _permission = globalconstants.PERMISSIONTYPES.filter(a => a.val == item.PermissionId)[0].type

            return {
              'applicationId': item.ApplicationId,
              'application': _application,
              'roleId': item.RoleId,
              'permissionId': item.PermissionId,
              'permission': _permission,
            }
          })
          this.tokenStorage.saveUserdetail(this.UserDetail);
          console.log('userdetail', this.tokenStorage.getUserDetail());
          this.isLoginFailed = false;
          this.isLoggedIn = true;
          this.username = this.tokenStorage.getUser();
        }
      })
  }

  gotohome() {
    this.route.navigate(['/home']);
  }
  reloadPage(): void {
    window.location.reload();
  }
}