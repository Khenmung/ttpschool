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
import { AuthService } from 'src/app/_services/auth.service';
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
  //Applications = [];
  Departments = [];
  Locations = [];
  Roles = [];
  LoginDetail = [];
  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  expandedElement: any;
  datasource: MatTableDataSource<IAppUser>;
  displayedColumns = [
    'UserName',
    'EmailAddress',
    'ContactNo',
    'ValidFrom',
    'ValidTo',
    'Active',
    'Action'
  ]
  AppUsersData = {
    Id: 0,
    UserName: '',
    Email: 0,
    PhoneNumber: '',
    ValidFrom: Date,
    ValidTo: Date,
    OrgId: 0,
    CreatedDate: new Date(),
    CreatedBy: 0,
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
    private authservice: AuthService,
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
    //debugger;
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
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 and (ParentId eq 0 " + orgIdSearchstr + ')'];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Roles = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.ROLE);
        //this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.APPLICATION);
        this.Departments = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.DEPARTMENT);
        this.Locations = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.LOCATION);
        this.shareddata.ChangeRoles(this.Roles);
        //this.shareddata.ChangePermittedApplications(this.Applications);
        this.shareddata.ChangeDepartment(this.Departments);
        this.shareddata.ChangeLocation(this.Locations);
        this.shareddata.CurrentOrganization.subscribe(o => this.Organizations = o);
        this.shareddata.CurrentDepartment.subscribe(d => this.Departments = d);
        this.shareddata.CurrentLocation.subscribe(l => this.Locations = l);
        //this.shareddata.CurrentPermittedApplications.subscribe(a => this.Applications = a);
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
      'Id',
      'UserName'
    ];

    list.PageName = "AuthManagement";
    list.filter = [this.filterwithOrg];
    //this.RoleUserList = [];

    this.authservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.Users = [...data.value];
        }
        this.loading = false;

      })
  }
  GetAppUsers() {
    //debugger;
    this.loading = true;
    let filterStr = " and OrgId eq " + this.LoginDetail[0]["orgId"];
    if (this.searchForm.get("searchUserName").value.Id > 0) {
      filterStr += " and Id eq " + this.searchForm.get("searchUserName").value.Id;
    }

    let list: List = new List();
    list.fields = [
      "Id",
      "UserName",
      "Email",
      "PhoneNumber",
      "OrgId",
      "ValidFrom",
      "ValidTo",
      "Active",
     ];
    list.PageName = "AuthManagement";
    list.lookupFields = ["Org($select=OrganizationName)"];
    list.filter = ["Active eq 1" + filterStr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          // var _department;
          // var _departmentName = '';
          // var _location;
          // var _locationName = '';
          this.AppUsers = data.value.map(u => {
            // _department = '';
            // _departmentName = '';
            // _location = '';
            // _department = this.Departments.filter(o => o.MasterDataId == u.DepartmentId);
            // if (_department.length > 0)
            //   _departmentName = _department[0].MasterDataName

            // _location = this.Locations.filter(o => o.MasterDataId == u.LocationId);
            // if (_location.length > 0)
            //   _locationName = _location[0].MasterDataName;

            return {
              "Id": u.Id,
              "UserName": u.UserName,
              "EmailAddress": u.EmailAddress,
              "ContactNo": u.ContactNo,
              "OrgId": u.OrgId,
              "OrgName": u.Org.OrganizationName,
              "ValidFrom": u.ValidFrom,
              "ValidTo": u.ValidTo,
              "Active": u.Active              
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
    //debugger;

    let ErrorMessage = '';
    // if (this.AppUsersForm.get("ContactNo").value == 0) {
    //   ErrorMessage += "Please select contact.<br>";
    // }
    if (row.UserName.length == 0) {
      ErrorMessage += "User name is required.<br>";
    }
    if (row.Email.length == 0) {
      ErrorMessage += "Please email is required.<br>";
    }

    if (ErrorMessage.length > 0) {
      this.alert.error(ErrorMessage, this.optionsNoAutoClose);
      return;
    }

    var duplicatecheck = "UserName eq '" + row.UserName + "' and OrgId eq " + this.LoginDetail[0]["orgId"]

    if (row.Id.length > 0)
      duplicatecheck += " and Id ne '" + row.Id + "'";

    let list = new List();
    list.fields = ["Id"];
    list.PageName = "AuthManagement";
    list.filter = ["Active eq 1 and " + duplicatecheck]
    this.dataservice.get(list).subscribe((data: any) => {
      if (data.value.length > 0) {
        this.alert.error("User name already exists.", this.optionsAutoClose);
        return;
      }
      else {
        this.AppUsersData.Active = 1;
        this.AppUsersData.Id = row.Id;
        this.AppUsersData.UserName = row.UserName;
        this.AppUsersData.Email = row.Email;
        this.AppUsersData.PhoneNumber = row.PhoneNumber;
        this.AppUsersData.ValidFrom = row.ValidFrom;
        this.AppUsersData.ValidTo = row.ValidTo;
        this.AppUsersData.OrgId = this.LoginDetail[0]["orgId"];
        this.AppUsersData.CreatedBy = this.LoginDetail[0]["userId"];
        if (row.Id == 0)
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

    //debugger;
    this.dataservice.postPatch('AuthManagement/Register', this.AppUsersData, 0, 'post')
      .subscribe(
        (data: any) => {

          row.Id = data.Id;
          this.loading = false;
          this.alert.success("Data saved successfully", this.optionsAutoClose);
          //this.router.navigate(['/home/pages']);

        });

  }
  update() {

    this.dataservice.postPatch('AuthManagement', this.AppUsersData, this.AppUsersData.Id, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          this.alert.success("Data updated successfully", this.optionsAutoClose);
          //this.router.navigate(['/home/pages']);
        });
  }
}
export interface IAppUser {
  Id: string;
  UserName: string;
  Email: string;
  PhoneNumber: string;
  ValidFrom: Date;
  ValidTo: Date;
  OrgName: string;
  Active: number;
}
export interface IUser {
  Id: string;
  UserName: string;
}