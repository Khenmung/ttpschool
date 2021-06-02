import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-approleuserdashboard',
  templateUrl: './approleuserdashboard.component.html',
  styleUrls: ['./approleuserdashboard.component.scss']
})
export class ApproleuserdashboardComponent implements OnInit {

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
  studentInfoTodisplay = {
    ApplicationRoleUserId: 0,
    UserName: '',
    UserId: 0,
    ApplicationId: 0,
    ApplicationName: '',
    ValidFrom: new Date(),
    ValidTo: new Date()
  }
  Applications = [];
  Roles = [];
  Users = [];
  ELEMENT_DATA: IApplicationRoleUsers[] = [];
  ApplicationRoleUserList: IApplicationRoleUsers[];
  dataSource: MatTableDataSource<IApplicationRoleUsers>;
  allMasterData = [];
  searchForm = new FormGroup({
    StudentId: new FormControl(0),
  });
  ApplicationRoleUserData = {
    UserId: 0,
    ApplicationId: 0,
    ApplicationRoleUserId: 0,
    RoleId: 0,
    ValidFrom: new Date(),
    ValidTo: new Date(),
    Active: 1
  };
  displayedColumns = [
    'User',
    'Application',
    'Role',
    'ValidFrom',
    'ValidTo',
    'Active'
  ];

  constructor(private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private nav: Router,
    private datepipe: DatePipe,
    private shareddata: SharedataService) { }

  ngOnInit(): void {
    this.GetApplicationRoleUser();
  }

  GetMasterData() {
    var applicationIdSearchstr = '';
    let userdetail = this.tokenstorage.getUserDetail();
    if (userdetail.length > 0) {
      userdetail.ApplicationsRoleUsers.forEach(element => {
        if (applicationIdSearchstr.length > 0)
          applicationIdSearchstr += ' or ApplicationId eq ' + element.ApplicationId
        else
          applicationIdSearchstr += ' ApplicationId eq ' + element.ApplicationId
      });

      if (applicationIdSearchstr.length > 0) {
        applicationIdSearchstr = " and (" + applicationIdSearchstr + ')';
      }

    }

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1 " + applicationIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Roles = this.getDropDownData(globalconstants.MasterDefinitions[0].application[0].ROLE);
        this.Applications = this.getDropDownData(globalconstants.MasterDefinitions[0].application[0].APPLICATION);
      });
  }
  getDropDownData(dropdowntype) {
    let Id = this.allMasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    })[0].MasterDataId;
    return this.allMasterData.filter((item, index) => {
      return item.ParentId == Id
    });
  }

  GetApplicationRoleUser() {

    let list: List = new List();
    list.fields = [
      'ApplicationRoleUserId',
      'UserId',
      'AppUsers/UserName',
      'ApplicationId',
      'RoleId',
      'ValidFrom',
      'ValidTo',
      'Active'];

    list.PageName = "ApplicationRoleUsers";
    list.lookupFields = ["AppUsers"];
    list.filter = ['Active eq 1'];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;

        this.ApplicationRoleUserList = data.value.map(item => {

          return {
            ApplicationRoleUserId: item.ApplicationRoleUserId,
            UserId: item.UserId,
            User: item.AppUsers.UserName,
            RoleId: item.RoleId,
            Application: this.Applications.filter(a => a.MasterDataId == item.ApplicationId)[0].MasterDataName,
            Role: this.Roles.filter(a => a.MasterDataId == item.RoleId)[0].MasterDataName,
            CreatedDate: item.CreatedDate,
            ValidFrom: item.ValidFrom,
            ValidTo: item.ValidTo,
            Active: item.Active
          }
        });

        //this.Applications = 
        this.dataSource = new MatTableDataSource<IApplicationRoleUsers>(this.ApplicationRoleUserList);

      });
  }


  Update(element) {

  }

  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

}
export interface IApplicationRoleUsers {

  ApplicationRoleUserId: number;
  UserId: number;
  User: string;
  ApplicationId: number;
  Application: string;
  RoleId: number;
  Role: string;
  CreatedDate: Date;
  ValidFrom: Date;
  ValidTo: Date;
  Active;
}
