//import { DatePipe } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
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
@ViewChild("table") mattable;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionsAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
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
    'ValidFrom',
    'ValidTo',
    'OrgName',
    'Department',
    'Location',
    'Active',
    'Action'
  ]
  UserId=0;
  AppUsers = [];
  searchForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private sharedData: SharedataService,
    private route: Router,
    private tokenStorage: TokenStorageService,
    private dataservice: NaomitsuService,
    private alert: AlertService) { }
  ngOnInit() {
    this.LoginDetail = this.tokenStorage.getUserDetail();
    if (this.LoginDetail == null)
      this.route.navigate(['/auth/login']);
    this.sharedData.CurrentOrganization.subscribe(o => this.Organizations = o);
    this.sharedData.CurrentDepartment.subscribe(d => this.Departments = d);
    this.sharedData.CurrentLocation.subscribe(l => this.Locations = l);
    this.sharedData.CurrentApplication.subscribe(a => this.Applications = a);
    this.searchForm = this.fb.group({
      Name: [''],
      Email: [''],
      Organization: [0],
      Department: [0],
      Location: [0]
    })
    //this.GetAppUsers();
  }
  search() {

  }
  SetUser(value){
    this.UserId =value;
    this.mattable._elementRef.nativeElement.style.backgroundColor="";
  }
  view(element) {
    console.log('this.mattable',this.mattable);
    this.UserId = element.UserId;
    this.mattable._elementRef.nativeElement.style.backgroundColor="grey";
    //this.mattable._elementRef.nativeElement.style.disabled=true;
    //this.route.navigate(['/auth/appuser']);
   }
  GetAppUsers() {
    debugger;
    let filterStr = "";
    if (this.searchForm.get("Name").value.length > 0) {
      filterStr = " and substringof('" + this.searchForm.get("Name").value + "',UserName)";
    }
    if (this.searchForm.get("Email").value.length > 0) {
      filterStr = " and substringof('" + this.searchForm.get("Email").value + "',EmailAddress)";
    }
    if (this.searchForm.get("Organization").value.length > 0) {
      filterStr = " and OrgId eq " + this.searchForm.get("Organization").value;
    }
    if (this.searchForm.get("Department").value.length > 0) {
      filterStr = " and DepartmentId eq " + this.searchForm.get("Department").value;
    }
    if (this.searchForm.get("Location").value.length > 0) {
      filterStr = " and LocationId eq " + this.searchForm.get("Location").value;
    }

    let list: List = new List();
    list.fields = ["ApplicationUserId",
      "UserName",
      "EmailAddress",
      "ContactNo",
      "OrgId",
      "DepartmentId",
      "LocationId",
      "ValidFrom",
      "ValidTo",
      "Active",      
      "RoleUsers/RoleId"
    ];
    list.PageName = "AppUsers";
    list.lookupFields = ["RoleUsers"];
    list.filter = ["Active eq 1" + filterStr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.AppUsers = data.value.map(u => {
            return {
              "UserId": u.ApplicationUserId,
              "UserName": u.UserName,
              "Email": u.EmailAddress,
              "ContactNo": u.ContactNo,
              "OrgId": u.OrgId,
              "OrgName": this.Organizations.length == 0 ? '' : this.Organizations.filter(o => o.MasterDataId == u.OrgId)[0].MasterDataName,
              "DepartmentId": u.DepartmentId,
              "Department": this.Departments.length == 0 ? '' : this.Departments.filter(o => o.MasterDataId == u.DepartmentId)[0].MasterDataName,
              "LocationId": u.LocationId,
              "Location": this.Locations.length == 0 ? '' : this.Locations.filter(o => o.MasterDataId == u.LocationId)[0].MasterDataName,
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
          this.alert.error("Problem fetching app users", this.optionsNoAutoClose);
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