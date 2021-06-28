import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { roleuseraddComponent } from '../roleuseradd/roleuseradd.component';

@Component({
  selector: 'app-roleuserdashboard',
  templateUrl: './roleuserdashboard.component.html',
  styleUrls: ['./roleuserdashboard.component.scss']
})
export class roleuserdashboardComponent implements OnInit {
  @ViewChild("table") mattable;
  @ViewChild("container") container: ElementRef;
  @ViewChild(roleuseraddComponent, { static: false }) roleuseradd: roleuseraddComponent;
  loading = false;
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  FeePayable = true;
  filteredOptions: Observable<string[]>;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };

  Departments = [];
  Locations = [];
  Applications = [];
  Roles = [];
  Users = [];
  //ELEMENT_DATA: IRoleUsers[] = [];
  RoleUserList: IRoleUsers[];
  dataSource: MatTableDataSource<IRoleUsers>;
  allMasterData = [];
  searchForm = new FormGroup({
    StudentId: new FormControl(0),
  });
  RoleUserId = 0;
  RoleUserData = {
    UserId: 0,
    RoleUserId: 0,
    RoleId: 0,
    OrgId: 0,
    Active: 1
  };
  displayedColumns = [
    'UserId',
    'RoleId',
    'Active',
    'Action'
  ];
  currentRoute = '';
  constructor(private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private nav: Router,
    private datepipe: DatePipe,
    private shareddata: SharedataService) {
  }

  ngOnInit(): void {

  }
  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null || this.LoginUserDetail.length == 0) {

      this.tokenstorage.saveredirectionurl(window.location.pathname);
      this.nav.navigate(['/auth/login']);
    }
    else {
      this.GetMasterData();
    }

  }
  GetRoleUserId(event) {
    this.RoleUserId = event;
    this.mattable._elementRef.nativeElement.style.backgroundColor = "";
    this.container.nativeElement.style.backgroundColor = "";
    this.GetRoleUser();
  }

  View(element) {
    this.RoleUserId = element.RoleUserId;
    this.mattable._elementRef.nativeElement.style.backgroundColor = "grey";
    this.container.nativeElement.style.backgroundColor = "grey";
    setTimeout(() => {
      this.roleuseradd.PageLoad();
    }, 50);

  }

  addnew() {
    var newdata = {
      RoleUserId: 0,
      UserId: 0,
      User: '',
      RoleId: 0,
      Role: '',
      Active: 0
    }
    this.RoleUserList.push(newdata);
    this.dataSource = new MatTableDataSource<IRoleUsers>(this.RoleUserList);
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
        this.GetRoleUser();
        this.GetUsers();
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
  GetUsers() {

    //console.log(this.LoginUserDetail);

    let list: List = new List();
    list.fields = [
      'ApplicationUserId',
      'UserName'
    ];

    list.PageName = "AppUsers";
    list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"]];
    this.RoleUserList = [];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.Users = [...data.value];
        }
      })
  }
  GetRoleUser() {

    //console.log(this.LoginUserDetail);

    let list: List = new List();
    list.fields = [
      'RoleUserId',
      'UserId',
      'AppUser/UserName',
      'RoleId',
      'Active'];

    list.PageName = "RoleUsers";
    list.lookupFields = ["AppUser"];
    list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"]];
    this.RoleUserList = [];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.RoleUserList = data.value.map(item => {

            return {
              RoleUserId: item.RoleUserId,
              UserId: item.UserId,
              User: item.AppUser.UserName,
              RoleId: item.RoleId,
              Role: this.Roles.length == 0 ? '' : this.Roles.filter(a => a.MasterDataId == item.RoleId)[0].MasterDataName,
              Active: item.Active
            }
          });
        }
        else {
          this.alert.info("No user role has been defined!", this.optionsNoAutoClose);
        }
        //this.Applications = 
        this.dataSource = new MatTableDataSource<IRoleUsers>(this.RoleUserList);
        this.loading = false;
      });
  }

  updateActive(row, value) {

    row.Active = value.checked ? 1 : 0;

    // let toupdate = {
    //   Active: element.Active == 1 ? 0 : 1
    // }

    // this.dataservice.postPatch('RoleUsers', toupdate, element.RoleUserId, 'patch')
    //   .subscribe(
    //     (data: any) => {
    //       this.alert.success("Data updated successfully.", this.optionAutoClose);
    //     });
  }


  UpdateOrSave(row) {

    debugger;
    if (row.CurrentBatch == 1 && row.Active == 0) {
      this.alert.error("Current batch should be active!", this.optionAutoClose);
      return;
    }

    var StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
    let checkFilterString = "UserId eq " + row.UserId + " and RoleId eq " + row.RoleId + StandardFilter;

    if (row.RoleUserId > 0)
      checkFilterString += " and RoleUserId ne " + row.RoleUserId;

    let list: List = new List();
    list.fields = ["RoleUserId"];
    list.PageName = "RoleUsers";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
          row.Ative = 0;
          return;
        }
        else {

          this.RoleUserData.Active = row.Active;
          this.RoleUserData.RoleUserId = row.RoleUserId;
          this.RoleUserData.RoleId = row.RoleId;
          this.RoleUserData.UserId = row.UserId;
          this.RoleUserData.OrgId = this.LoginUserDetail[0]["orgId"];
          if (this.RoleUserData.RoleUserId == 0) {
            this.RoleUserData["CreatedDate"] = new Date();
            this.RoleUserData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.RoleUserData["UpdatedDate"];
            delete this.RoleUserData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.RoleUserData["CreatedDate"];
            delete this.RoleUserData["CreatedBy"];
            this.RoleUserData["UpdatedDate"] = new Date();
            this.RoleUserData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update();
          }
        }
      });
  }

  insert(row) {

    debugger;
    this.dataservice.postPatch('RoleUsers', this.RoleUserData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.RoleUserId = data.RoleUserId;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update() {

    this.dataservice.postPatch('RoleUsers', this.RoleUserData, this.RoleUserData.RoleUserId, 'patch')
      .subscribe(
        (data: any) => {
          this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

}
export interface IBatches {
  BatchId: number;
  BatchName: string;
  CurrentBatch: number;
  OrgId: number;
  Active;
}

export interface IRoleUsers {

  RoleUserId: number;
  UserId: number;
  User: string;
  RoleId: number;
  Role: string;
  Active;
}

