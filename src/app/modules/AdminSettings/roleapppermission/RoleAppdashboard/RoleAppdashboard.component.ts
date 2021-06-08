import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormGroup, FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { roleappAddComponent } from '../roleappadd/roleappadd.component';

@Component({
  selector: 'app-RoleAppdashboard',
  templateUrl: './RoleAppdashboard.component.html',
  styleUrls: ['./RoleAppdashboard.component.scss']
})
export class RoleAppdashboardComponent implements OnInit {
  @ViewChild("table") mattable;
  @ViewChild(roleappAddComponent) roleappadd: roleappAddComponent;
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  //filteredOptions: Observable<string[]>;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  loading = false;
  Departments = [];
  Locations = [];
  Applications = [];
  Roles = [];
  Users = [];
  AppRoleList: IAppRoles[];
  dataSource: MatTableDataSource<IAppRoles>;
  allMasterData = [];
  searchForm = new FormGroup({
    StudentId: new FormControl(0),
  });
  ApplicationRoleId = 0;
  AppRoleData = {
    PermissionId: 0,
    ApplicaitonRoleId: 0,
    RoleId: 0,
    Active: 1
  };
  displayedColumns = [
    'Application',
    'Role',
    'Permission',
    'Active',
    'Action'
  ];

  constructor(private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private nav: Router,
    private datepipe: DatePipe,
    private shareddata: SharedataService,
    private changeDetectorRefs: ChangeDetectorRef) { }

  ngOnInit(): void {

  }
  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.shareddata.CurrentApplication.subscribe(a => this.Applications = a);
      if (this.Applications.length == 0)
        this.GetMasterData();
      else {
        this.shareddata.CurrentRoles.subscribe(r => this.Roles = r);
        this.shareddata.CurrentDepartment.subscribe(a => this.Departments = a);
        this.shareddata.CurrentLocation.subscribe(r => this.Locations = r);
        this.GetApplicationRoles();
      }
    }

  }
  GetApplicationRoleId(event) {
    this.ApplicationRoleId = event;
    this.mattable._elementRef.nativeElement.style.backgroundColor = "";
    this.GetApplicationRoles();
  }

  View(element) {
    this.ApplicationRoleId = element.ApplicationRoleId;
    this.mattable._elementRef.nativeElement.style.backgroundColor = "grey";
    setTimeout(() => {
      this.roleappadd.PageLoad();
    }, 50);
  }

  addnew() {
    this.ApplicationRoleId = -1;
    this.mattable._elementRef.nativeElement.style.backgroundColor = "grey";
    setTimeout(() => {
      this.roleappadd.PageLoad();
    }, 50);
  }

  GetApplicationRoles() {

    //console.log(this.LoginUserDetail);

    let list: List = new List();
    list.fields = [
      'ApplicationRoleId',
      'PermissionId',
      'RoleId',
      'ApplicationId',
      'Active'];

    list.PageName = "ApplicationRoles";
    list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"]];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  console.log('data.value', data.value);
        var permission = ''
        var role = '';
        var application = '';
        this.AppRoleList = data.value.map(item => {
          permission = '';
          role = '';
          application = '';

          let _permissionIds = item.PermissionId == null ? '' : globalconstants.PERMISSIONTYPES.filter(p => p.val == item.PermissionId);
          if (_permissionIds.length > 0)
            permission = _permissionIds[0]["type"];

          let _roleId = item.RoleId != null && this.Roles.length == 0 ? '' : this.Roles.filter(a => a.MasterDataId == item.RoleId);
          if (_roleId.length > 0)
            role = _roleId[0].MasterDataName;

          let applicationId = this.Applications.filter(a => a.MasterDataId == item.ApplicationId);
          if (applicationId.length > 0)
            application = applicationId[0].MasterDataName;

          return {
            ApplicationRoleId: item.ApplicationRoleId,
            PermissionId: item.PermissionId,
            Permission: permission,
            RoleId: item.RoleId,
            Role: role,
            ApplicationId: item.ApplicationId,
            Application: application,
            Active: item.Active
          }
        });

        //this.shareddata.ChangeApplicationRoles(this.AppRoleList); 
        this.dataSource = new MatTableDataSource<IAppRoles>(this.AppRoleList);
        this.loading = false;
        //this.changeDetectorRefs.detectChanges();
      });
  }

  update(element) {
    let toupdate={
      //ApplicationId:element.ApplicationId,      
      Active:element.Active==1?0:1
    }
    this.dataservice.postPatch('ApplicationRoles', toupdate, element.ApplicationRoleId, 'patch')
      .subscribe(
        (data: any) => {
         // this.GetApplicationRoles();
          this.alert.success("Data updated successfully.", this.optionAutoClose);
          
        });
  }
  delete(element){
    let toupdate={
      Active:element.Active==1?0:1
    }
    this.dataservice.postPatch('ApplicationRoles', toupdate, element.ApplicationRoleId, 'delete')
      .subscribe(
        (data: any) => {
         // this.GetApplicationRoles();
          this.alert.success("Data deleted successfully.", this.optionAutoClose);
          
        });
  }
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
  GetMasterData() {

    var orgIdSearchstr = ' or OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1 and (ParentId eq 0 " + orgIdSearchstr + ')'];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Roles = this.getDropDownData(globalconstants.MasterDefinitions[0].application[0].ROLE);
        this.Applications = this.getDropDownData(globalconstants.MasterDefinitions[0].application[0].APPLICATION);
        this.Departments = this.getDropDownData(globalconstants.MasterDefinitions[0].application[0].DEPARTMENT);
        this.Locations = this.getDropDownData(globalconstants.MasterDefinitions[0].application[0].LOCATION);

        this.shareddata.ChangeRoles(this.Roles);
        this.shareddata.ChangeApplication(this.Applications);
        this.shareddata.ChangeDepartment(this.Departments);
        this.shareddata.ChangeLocation(this.Locations);
        this.GetApplicationRoles();
      });
  }
  getDropDownData(dropdowntype) {
    let Id = 0;
    let Ids = this.allMasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();//globalconstants.GENDER
    })
    if (Ids.length > 0) {
      Id = Ids[0].MasterDataId;
      return this.allMasterData.filter((item, index) => {
        return item.ParentId == Id
      })
    }
    else
      return [];

  }

}
export interface IAppRoles {

  ApplicationRoleId: number;
  PermissionId: number;
  Permission: string;
  RoleId: number;
  Role: string;
  ApplicationId: number;
  Applicaiton: string;
  Active;
}


