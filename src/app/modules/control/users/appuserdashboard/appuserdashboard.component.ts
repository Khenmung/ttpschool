//import { DatePipe } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-appuserdashboard',
  templateUrl: './appuserdashboard.component.html',
  styleUrls: ['./appuserdashboard.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AppuserdashboardComponent implements OnInit {
  @ViewChild("container") container: ElementRef;
  @ViewChild("table") mattable;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionsAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  loading = false;
  Users: IUser[] = [];
  filteredOptions: Observable<IUser[]>;
  filterwithOrg = '';
  allMasterData = [];
  Organizations = [];
  Applications = [];
  Departments = [];
  Locations = [];
  Roles = [];
  LoginDetail = [];
  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  expandedElement: any;
  datasource: MatTableDataSource<IAppUser>;
  displayedColumns = [
    'ApplicationUserId',
    'UserName',
    'EmailAddress',
    'ContactNo',
    'ValidFrom',
    'ValidTo',
    // 'OrgName',
    // 'Department',
    // 'Location',
    'Active',
    'Action'
  ]
  AppUsersData = {
    ApplicationUserId: 0,
    UserName: '',
    EmailAddress: 0,
    Address: '',
    ContactNo: '',
    ValidFrom: Date,
    ValidTo: Date,
    OrgId: 0,
    DepartmentId: 0,
    LocationId: 0,
    ManagerId: 0,
    Remarks: '',
    CreatedDate: new Date(),
    //UpdatedDate: new Date(),
    CreatedBy: 0,
    //UpdatedBy: 0,
    Active: 1,
  }
  UserId = 0;
  AppUsers = [];
  searchForm: FormGroup;
  constructor(
    private shareddata: SharedataService,
    private fb: FormBuilder,
    private route: Router,
    private tokenStorage: TokenStorageService,
    private dataservice: NaomitsuService,
    private alert: AlertService) { }
  ngOnInit() {
    this.searchForm = this.fb.group({
      searchUserName: [''],
    })
    this.filteredOptions = this.searchForm.get("searchUserName").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.UserName),
        map(UserName => UserName ? this._filter(UserName) : this.Users.slice())
      );

  }
  private _filter(name: string): IUser[] {

    const filterValue = name.toLowerCase();
    return this.Users.filter(option => option.UserName.toLowerCase().includes(filterValue));

  }
  displayFn(user: IUser): string {
    return user && user.UserName ? user.UserName : '';
  }
  PageLoad() {
    debugger;
    this.loading = true;

    this.LoginDetail = this.tokenStorage.getUserDetail();
    if (this.LoginDetail == null || this.LoginDetail.length == 0)
      this.route.navigate(['/auth/login']);

    this.filterwithOrg = globalconstants.getStandardFilter(this.LoginDetail);
    this.GetMasterData();

  }

  GetMasterData() {

    var orgIdSearchstr = ' or OrgId eq ' + this.LoginDetail[0]["orgId"];

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1 and (ParentId eq 0 " + orgIdSearchstr + ')'];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Roles = this.getDropDownData(globalconstants.MasterDefinitions[0].applications[0].ROLE);
        //this.Applications = this.getDropDownData(globalconstants.MasterDefinitions[0].applications[0].APPLICATION);
        this.Departments = this.getDropDownData(globalconstants.MasterDefinitions[0].applications[0].DEPARTMENT);
        this.Locations = this.getDropDownData(globalconstants.MasterDefinitions[0].applications[0].LOCATION);
        this.shareddata.ChangeRoles(this.Roles);
        this.shareddata.ChangeApplication(this.Applications);
        this.shareddata.ChangeDepartment(this.Departments);
        this.shareddata.ChangeLocation(this.Locations);
        this.shareddata.CurrentOrganization.subscribe(o => this.Organizations = o);
        this.shareddata.CurrentDepartment.subscribe(d => this.Departments = d);
        this.shareddata.CurrentLocation.subscribe(l => this.Locations = l);
        this.shareddata.CurrentApplication.subscribe(a => this.Applications = a);
        this.GetUsers();

        //this.GetRoleUser();
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

  search() {

  }
  SetUser(value) {
    this.UserId = value;
    this.container.nativeElement.style.backgroundColor = "";
    this.mattable._elementRef.nativeElement.style.backgroundColor = "";
  }
  view(element) {
    //console.log('this.mattable', this.mattable);
    this.UserId = element.UserId;
    this.container.nativeElement.style.backgroundColor = "grey";
    this.mattable._elementRef.nativeElement.style.backgroundColor = "grey";
    //this.route.navigate(['/auth/appuser']);
  }
  GetUsers() {

    //console.log(this.LoginUserDetail);

    let list: List = new List();
    list.fields = [
      'ApplicationUserId',
      'UserName'
    ];

    list.PageName = "AppUsers";
    list.filter = [this.filterwithOrg];
    //this.RoleUserList = [];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.Users = [...data.value];
        }
        this.loading = false;

      })
  }
  GetAppUsers() {
    debugger;
    this.loading = true;
    let filterStr = " and OrgId eq " + this.LoginDetail[0]["orgId"];
    if (this.searchForm.get("searchUserName").value.ApplicationUserId > 0) {
      filterStr += " and ApplicationUserId eq " + this.searchForm.get("searchUserName").value.ApplicationUserId;
    }

    let list: List = new List();
    list.fields = ["ApplicationUserId",
      "UserName",
      "EmailAddress",
      "ContactNo",
      "OrgId",
      "Organization/OrganizationName",
      "DepartmentId",
      "LocationId",
      "ValidFrom",
      "ValidTo",
      "Active",
      "RoleUsers/RoleId"
    ];
    list.PageName = "AppUsers";
    list.lookupFields = ["RoleUsers", "Organization"];
    list.filter = ["Active eq 1" + filterStr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          var _department;
          var _departmentName = '';
          var _location;
          var _locationName = '';
          this.AppUsers = data.value.map(u => {
            _department = '';
            _departmentName = '';
            _location = '';
            _department = this.Departments.filter(o => o.MasterDataId == u.DepartmentId);
            if (_department.length > 0)
              _departmentName = _department[0].MasterDataName

            _location = this.Locations.filter(o => o.MasterDataId == u.LocationId);
            if (_location.length > 0)
              _locationName = _location[0].MasterDataName;

            return {
              "ApplicationUserId": u.ApplicationUserId,
              "UserName": u.UserName,
              "EmailAddress": u.EmailAddress,
              "ContactNo": u.ContactNo,
              "OrgId": u.OrgId,
              "OrgName": u.Organization.OrganizationName,
              "DepartmentId": u.DepartmentId,
              "Department": _departmentName,
              "LocationId": u.LocationId,
              "Location": _locationName,
              "ValidFrom": u.ValidFrom,
              "ValidTo": u.ValidTo,
              "Active": u.Active,
              "RoleUsers": u.RoleUsers.map(d => {

                return {
                  Role: this.Roles.length == 0 ? '' : this.Roles.filter(a => a.MasterDataId == d.RoleId)[0].MasterDataName,
                  RoleId: d.RoleId,
                }
              }),
            }
          });
        }
        else
          this.alert.error("No user found matching search criteria!", this.optionsAutoClose);
        const rows = [];
        this.AppUsers.forEach(element => rows.push(element, { detailRow: true, element }));
        this.datasource = new MatTableDataSource<IAppUser>(rows);
        this.loading = false;
      });

  }
  UpdateOrSave(row) {
    debugger;

    let ErrorMessage = '';
    // if (this.AppUsersForm.get("ContactNo").value == 0) {
    //   ErrorMessage += "Please select contact.<br>";
    // }
    if (row.UserName.length == 0) {
      ErrorMessage += "User name is required.<br>";
    }
    if (row.EmailAddress.length == 0) {
      ErrorMessage += "Please select Section.<br>";
    }

    if (ErrorMessage.length > 0) {
      this.alert.error(ErrorMessage, this.optionsNoAutoClose);
      return;
    }

    var duplicatecheck = "UserName eq '" + row.UserName + "' and OrgId eq " + this.LoginDetail[0]["orgId"]

    if (row.ApplicationUserId > 0)
      duplicatecheck += ' and ApplicationUserId ne ' + row.ApplicationUserId;

    let list = new List();
    list.fields = ["ApplicationUserId"];
    list.PageName = "AppUsers";
    list.filter = ["Active eq 1 and " + duplicatecheck]
    this.dataservice.get(list).subscribe((data: any) => {
      if (data.value.length > 0) {
        this.alert.error("User name already exists.", this.optionsAutoClose);
        return;
      }
      else {
        this.AppUsersData.Active = 1;
        this.AppUsersData.ApplicationUserId = row.ApplicationUserId;
        this.AppUsersData.UserName = row.UserName;
        this.AppUsersData.EmailAddress = row.EmailAddress;
        this.AppUsersData.Address = '';
        this.AppUsersData.ContactNo = row.ContactNo;
        this.AppUsersData.ValidFrom = row.ValidFrom;
        this.AppUsersData.ValidTo = row.ValidTo;
        this.AppUsersData.OrgId = this.LoginDetail[0]["orgId"];
        this.AppUsersData.DepartmentId = 0;
        this.AppUsersData.LocationId = 0;
        this.AppUsersData.ManagerId = 0;
        this.AppUsersData.Remarks = '';
        this.AppUsersData.CreatedBy = this.LoginDetail[0]["userId"];
        //this.AppUsersData.UpdatedBy = 0;
        //this.AppUsersData.ApplicationUserId = this.UserId;
        console.log('user dasta', this.AppUsersData)
        debugger;
        if (row.ApplicationUserId == 0)
          this.insert(row);
        else {
          this.update();
        }

      }
    })
  }
  tabChanged($event) {

  }
  insert(row) {

    debugger;
    this.dataservice.postPatch('AppUsers', this.AppUsersData, 0, 'post')
      .subscribe(
        (data: any) => {

          row.ApplicationUserId = data.ApplicationUserId;
          this.loading = false;
          this.alert.success("Data saved successfully", this.optionsAutoClose);
          //this.router.navigate(['/home/pages']);

        });

  }
  update() {

    this.dataservice.postPatch('AppUsers', this.AppUsersData, this.AppUsersData.ApplicationUserId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          this.alert.success("Data updated successfully", this.optionsAutoClose);
          //this.router.navigate(['/home/pages']);
        });
  }
}
export interface IAppUser {
  UserId: number;
  UserName: string;
  Email: string;
  Department: string;
  Location: string;
  ContactNo: string;
  ValidFrom: Date;
  ValidTo: Date;
  OrgName: string;
  Active: number;
  RoleUsers: [];
}
export interface IUser {
  ApplicationUserId: number;
  UserName: string;
}