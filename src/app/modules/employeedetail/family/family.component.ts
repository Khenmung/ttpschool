import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-family',
  templateUrl: './family.component.html',
  styleUrls: ['./family.component.scss']
})
export class FamilyComponent implements OnInit {

  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  SelectedApplicationId=0;
  EmployeeFamilyListName = 'EmployeeFamilies';
  Applications = [];
  loading = false;
  SelectedBatchId = 0;
  EmployeeFamilyList: IFamily[] = [];
  filteredOptions: Observable<IFamily[]>;
  dataSource: MatTableDataSource<IFamily>;
  allMasterData = [];
  EmployeeFamilys = [];
  FamilyRelationship=[];
  Genders=[];
  Permission = 'deny';
  EmployeeId = 0;
  EmployeeFamilyData = {
    EmployeeFamilyId: 0,
    EmployeeId: 0,
    FamilyRelationShipId: 0,
    FullName: '',
    Age: 0,
    Gender: 0,
    OrgId: 0,
    Active: 0
  };
  displayedColumns = [
    "EmployeeFamilyId",
    "FullName",
    "Age",
    "Gender",
    "FamilyRelationShipId",
    "Active",
    "Action"
  ];
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private nav: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchClassName: [0]
    });
    this.PageLoad();
  }

  PageLoad() {

    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    this.EmployeeId = +this.tokenstorage.getEmployeeId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.emp.employee.FAMILY)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {

        //this.nav.navigate(['/edu'])
      }
      else {
        this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
        this.GetMasterData();
      }
    }
  }

  AddNew() {

    var newdata = {
      EmployeeFamilyId: 0,
      EmployeeId: 0,
      FamilyRelationShipId: 0,
      FullName: '',
      Age: 0,
      Gender: 0,
      Active: 0,
      Action: true
    };
    this.EmployeeFamilyList = [];
    this.EmployeeFamilyList.push(newdata);
    this.dataSource = new MatTableDataSource<IFamily>(this.EmployeeFamilyList);
  }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = value.checked ? 1 : 0;
  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {

          this.alert.success("Data deleted successfully.", this.optionAutoClose);

        });
  }
  UpdateOrSave(row) {

    //debugger;
    this.loading = true;
    let checkFilterString = "FamilyRelationShipId eq " + row.FamilyRelationShipId

    if (row.EmployeeFamilyId > 0)
      checkFilterString += " and EmployeeFamilyId ne " + row.EmployeeFamilyId;
    let list: List = new List();
    list.fields = ["EmployeeFamilyId"];
    list.PageName = this.EmployeeFamilyListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {

          this.EmployeeFamilyData.EmployeeFamilyId = row.EmployeeFamilyId;
          this.EmployeeFamilyData.Active = row.Active;
          this.EmployeeFamilyData.Age = row.Age;
          this.EmployeeFamilyData.EmployeeId = this.EmployeeId;
          this.EmployeeFamilyData.FamilyRelationShipId = row.FamilyRelationShipId;
          this.EmployeeFamilyData.FullName = row.FullName;
          this.EmployeeFamilyData.Gender = row.Gender;
          this.EmployeeFamilyData.OrgId = this.LoginUserDetail[0]["orgId"];
                    
          if (this.EmployeeFamilyData.EmployeeFamilyId == 0) {
            this.EmployeeFamilyData["CreatedDate"] = new Date();
            this.EmployeeFamilyData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EmployeeFamilyData["UpdatedDate"] = new Date();
            delete this.EmployeeFamilyData["UpdatedBy"];
            //console.log('this.EmployeeFamilyData',this.EmployeeFamilyData)
            this.insert(row);
          }
          else {
            delete this.EmployeeFamilyData["CreatedDate"];
            delete this.EmployeeFamilyData["CreatedBy"];
            this.EmployeeFamilyData["UpdatedDate"] = new Date();
            this.EmployeeFamilyData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false;
  }
  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.EmployeeFamilyListName, this.EmployeeFamilyData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EmployeeFamilyId = data.EmployeeFamilyId;
          row.Action = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.EmployeeFamilyListName, this.EmployeeFamilyData, this.EmployeeFamilyData.EmployeeFamilyId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
          this.loadingFalse();
        });
  }
  GetEmployeeFamilys() {
    debugger;

    this.loading = true;
    let filterStr = 'EmployeeId eq ' + this.EmployeeId;
    let list: List = new List();
    list.fields = ["*"];

    list.PageName = this.EmployeeFamilyListName;
    list.filter = [filterStr];
    this.EmployeeFamilyList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.EmployeeFamilyList = [...data.value];
        }
        this.dataSource = new MatTableDataSource<IFamily>(this.EmployeeFamilyList);
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"],this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.FamilyRelationship = this.getDropDownData(globalconstants.MasterDefinitions.employee.FAMILYRELATIONSHIP);
        this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.employee.GENDER);
        this.GetEmployeeFamilys();
        this.loading = false;
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
export interface IFamily {
  EmployeeFamilyId: number;
  EmployeeId: number;
  FamilyRelationShipId: number;
  FullName: string;
  Age: number;
  Gender: number;
  Action: boolean;
}
export interface IApplication {
  ApplicationId: number;
  ApplicationName: string;
}
