//import { DatePipe } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ContentService } from 'src/app/shared/content.service';
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
  // @Output()
  // dateChange: EventEmitter<MatDatepickerInputEvent<any>> = new EventEmitter();

  // onDateChange(row): void {
  //   this.dateChange.emit();
  //   row.Action = true;
  // }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
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
  errorMessage = '';
  Permission = '';
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
  SelectedApplicationId = 0;
  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  expandedElement: any;
  datasource: MatTableDataSource<IAppUser>;
  displayedColumns = [
    //'UserName',
    'EmailAddress',
    'PhoneNumber',
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
    ValidTo: new Date(),
    Active: 1,
  }
  UserId = 0;
  AppUsers = [];
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
    private shareddata: SharedataService,
    private fb: FormBuilder,
    private route: Router,
    private tokenStorage: TokenStorageService,
    //private dataservice: NaomitsuService,
    private authservice: AuthService,
    private alert: MatSnackBar
  ) { }
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
    this.PageLoad();
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
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.APPLICATIONFEATUREPERMISSION);
    if (perObj.length > 0)
      this.Permission = perObj[0].permission;
    if (this.Permission != 'deny') {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
      this.filterwithOrg = globalconstants.getStandardFilter(this.LoginDetail);
      this.GetMasterData();
    }

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Roles = this.getDropDownData(globalconstants.MasterDefinitions.school.ROLE);
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
    ////console.log('this.mattable', this.mattable);
    this.UserId = element.UserId;
    this.container.nativeElement.style.backgroundColor = "grey";
    this.mattable._elementRef.nativeElement.style.backgroundColor = "grey";
    //this.route.navigate(['/auth/appuser']);
  }
  //   GetOrganization(){
  //     let list: List = new List();
  //     list.fields = ["OrganizationId,OrganizationName"];

  //     list.PageName = "Organizations";
  //     list.filter = ["Active eq 1 and " + this.filterwithOrg];
  //     //this.RoleUserList = [];

  //     this.dataservice.get(list)
  //       .subscribe((data: any) => {
  //         this.Organizations=[...data.value];
  //   })
  // }
  GetUsers() {

    ////console.log(this.LoginUserDetail);

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
        //  //console.log('data.value', data.value);
        if (data.length > 0) {
          this.Users = [...data];
        }
        this.loading = false;
      })
  }
  onBlur(row) {
    debugger;
    row.Action = true;
  }
  GetAppUsers() {
    debugger;
    this.loading = true;
    let filterStr = " and OrgId eq " + this.LoginDetail[0]["orgId"];
    if (this.searchForm.get("searchUserName").value != "") {
      filterStr += " and Id eq '" + this.searchForm.get("searchUserName").value.Id + "'";
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
    //list.lookupFields = ["Org($select=OrganizationName)"];
    list.filter = ["Active eq 1" + filterStr];

    this.authservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.length > 0) {

          this.AppUsers = data.map(u => {
            return {
              "Id": u.Id,
              "UserName": u.UserName,
              "EmailAddress": u.Email,
              "PhoneNumber": u.PhoneNumber,
              "OrgId": u.OrgId,
              "ValidFrom": u.ValidFrom,
              "ValidTo": u.ValidTo,
              "Active": u.Active,
              "Action": false
            }
          });
        }
        else
          this.alert.open("No user found matching search criteria!", 'Dismiss', { duration: 10000 });
        //const rows = [];

        //this.AppUsers.forEach(element => rows.push(element, { detailRow: true, element }));

        //console.log("users", this.AppUsers)
        this.datasource = new MatTableDataSource<IAppUser>(this.AppUsers);
        this.datasource.paginator = this.paginator;
        this.datasource.sort = this.sort;
        this.loading = false;
      });

  }
  updateActive(row, value) {
    row.Active = value.checked ? 1 : 0;
    row.Action = true;
  }
  
  onSave(row): void {
    this.errorMessage = '';
    //debugger;
    var userDetail = {
      ConfirmPassword: row.ConfirmPassword,
      Email: row.Email,
      Password: row.Password,
      Username: row.UserName,
      OrganizationName: this.LoginDetail[0]['org'],
      ContactNo: row.ContactNo
    }
    this.authservice.CallAPI(userDetail, 'Register').subscribe(
      data => {
        //this.AddAppUsers()
        this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
      },
      err => {
        var modelState;
        if (err.error.ModelState != null)
          modelState = JSON.parse(JSON.stringify(err.error.ModelState));
        else if (err.error != null)
          modelState = JSON.parse(JSON.stringify(err.error));
        else
          modelState = JSON.parse(JSON.stringify(err));

        //THE CODE BLOCK below IS IMPORTANT WHEN EXTRACTING MODEL STATE IN JQUERY/JAVASCRIPT
        for (var key in modelState) {
          if (modelState.hasOwnProperty(key) && key == 'errors') {
            this.errorMessage += (this.errorMessage == "" ? "" : this.errorMessage + "<br/>") + modelState[key];
            //errors.push(modelState[key]);//list of error messages in an array
          }
        }

      }
    );
  }
  // Delete(row) {
  //   this.contentservice.openDialog({},0)
  //     .subscribe((confirmed: boolean) => {
  //       if (confirmed) {
  //         this.contentservice.SoftDelete('AuthManagement',{}, row.MasterDataId)
  //           .subscribe((data: any) => {
  //             row.Action = false;
  //             this.loading = false;
  //             var idx = this.AppUsers.findIndex(x => x.MasterDataId == row.MasterDataId)
  //             this.AppUsers.splice(idx, 1);
  //             this.datasource = new MatTableDataSource<any>(this.AppUsers);
  //             this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
  //           },
  //             err => {
  //               this.contentservice.openSnackBar("error in data deletion: " + err, globalconstants.ActionText, globalconstants.RedBackground);
  //             }
  //           )
  //       }

  //     });
  // }
  UpdateOrSave(row) {
    //debugger;

    let ErrorMessage = '';
    // if (this.AppUsersForm.get("ContactNo").value == 0) {
    //   ErrorMessage += "Please select contact.<br>";
    // }
    if (row.UserName.length == 0) {
      ErrorMessage += "User name is required.\n";
    }
    if (row.EmailAddress.length == 0) {
      ErrorMessage += "Email is required.\n";
    }

    if (ErrorMessage.length > 0) {
      //this.contentservice.openSnackBar(errorMessage,globalconstants.ActionText,globalconstants.RedBackground);
      this.contentservice.openSnackBar(ErrorMessage, globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.AppUsersData.Active = row.Active;
    this.AppUsersData.Id = row.Id;
    this.AppUsersData.UserName = row.UserName;
    this.AppUsersData.Email = row.EmailAddress;
    this.AppUsersData.PhoneNumber = row.PhoneNumber;
    //this.AppUsersData.ValidFrom = row.ValidFrom;
    this.AppUsersData.ValidTo = new Date(row.ValidTo);
    console.log('this.AppUsersData', this.AppUsersData)
    if (row.Id == '')
      this.insert(row);
    else {
      this.update();
    }

  }
  tabChanged($event) {

  }
  insert(row) {

    //debugger;
    this.authservice.CallAPI(this.AppUsersData, 'Register')
      .subscribe(
        (data: any) => {

          row.Id = data.Id;
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });

  }
  update() {

    this.authservice.CallAPI(this.AppUsersData, 'UpdateUser')
      .subscribe(
        (data: any) => {
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground)
          //this.alert.open(globalconstants.,globalconstants.ActionText,globalconstants.AlertDuration);
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