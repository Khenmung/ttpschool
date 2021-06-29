//import { DatePipe } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
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
    'UserId',
    'UserName',
    'Email',
    'ContactNo',
    // 'ValidFrom',
    // 'ValidTo',
    // 'OrgName',
    // 'Department',
    // 'Location',
    'Active',
    'Action'
  ]
  UserId = 0;
  AppUsers = [];
  searchForm: FormGroup;
  constructor(
    private shareddata: SharedataService,
    private fb: FormBuilder,
    private sharedData: SharedataService,
    private route: Router,
    private tokenStorage: TokenStorageService,
    private dataservice: NaomitsuService,
    private alert: AlertService) { }
  ngOnInit() {
    this.searchForm = this.fb.group({
      Name: [''],
      Email: [''],
      Organization: [0],
      Department: [0],
      Location: [0]
    })

    //this.GetAppUsers();
  }
  PageLoad() {
    debugger;
    this.LoginDetail = this.tokenStorage.getUserDetail();
    if (this.LoginDetail == null || this.LoginDetail.length == 0)
      this.route.navigate(['/auth/login']);
    this.sharedData.CurrentOrganization.subscribe(o => this.Organizations = o);
    this.sharedData.CurrentDepartment.subscribe(d => this.Departments = d);
    this.sharedData.CurrentLocation.subscribe(l => this.Locations = l);
    this.sharedData.CurrentApplication.subscribe(a => this.Applications = a);
    if (this.Applications.length == 0) {
      this.shareddata.GetApplication().subscribe((data: any) => {
        this.Applications = data.value.map(item => item);
      });
      this.GetMasterData();
    }
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
        this.sharedData.ChangeRoles(this.Roles);
        this.sharedData.ChangeApplication(this.Applications);
        this.sharedData.ChangeDepartment(this.Departments);
        this.sharedData.ChangeLocation(this.Locations);
        this.sharedData.CurrentOrganization.subscribe(o => this.Organizations = o);
        this.sharedData.CurrentDepartment.subscribe(d => this.Departments = d);
        this.sharedData.CurrentLocation.subscribe(l => this.Locations = l);
        this.sharedData.CurrentApplication.subscribe(a => this.Applications = a);

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
  GetAppUsers() {
    debugger;
    let filterStr = " and OrgId eq " + this.LoginDetail[0]["orgId"];
    if (this.searchForm.get("Name").value.length > 0) {
      filterStr += " and substringof('" + this.searchForm.get("Name").value + "',UserName)";
    }
    if (this.searchForm.get("Email").value.length > 0) {
      filterStr += " and substringof('" + this.searchForm.get("Email").value + "',EmailAddress)";
    }
    if (this.searchForm.get("Organization").value.length > 0) {
      filterStr += " and OrgId eq " + this.searchForm.get("Organization").value;
    }
    if (this.searchForm.get("Department").value.length > 0) {
      filterStr += " and DepartmentId eq " + this.searchForm.get("Department").value;
    }
    if (this.searchForm.get("Location").value.length > 0) {
      filterStr += " and LocationId eq " + this.searchForm.get("Location").value;
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
          var _department = '';
          var _location = '';
          this.AppUsers = data.value.map(u => {
            _department ='';
            _location ='';
            if (this.Departments.length > 0 && u.DepartmentId != null)
              _department = this.Departments.filter(o => o.MasterDataId == u.DepartmentId)[0].MasterDataName;
            if (this.Locations.length > 0 && u.LocationId != null)
              _location = this.Locations.filter(o => o.MasterDataId == u.LocationId)[0].MasterDataName;

            return {
              "UserId": u.ApplicationUserId,
              "UserName": u.UserName,
              "Email": u.EmailAddress,
              "ContactNo": u.ContactNo,
              "OrgId": u.OrgId,
              "OrgName": u.Organization.OrganizationName,
              "DepartmentId": u.DepartmentId,
              "Department": _department,
              "LocationId": u.LocationId,
              "Location": _location,
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