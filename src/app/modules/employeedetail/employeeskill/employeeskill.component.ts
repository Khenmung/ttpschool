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
import { IFamily } from '../family/family.component';

@Component({
  selector: 'app-employeeskill',
  templateUrl: './employeeskill.component.html',
  styleUrls: ['./employeeskill.component.scss']
})
export class EmployeeskillComponent implements OnInit {

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
  EmployeeSkillsListName = 'EmpEmployeeSkills';
  Applications = [];
  loading = false;
  SelectedBatchId = 0;
  EmployeeSkillsList: ISkill[] = [];
  filteredOptions: Observable<ISkill[]>;
  dataSource: MatTableDataSource<ISkill>;
  allMasterData = [];
  EmployeeSkills = [];
  Permission = 'deny';
  EmployeeId = 0;
  EmployeeSkillsData = {
    EmpEmployeeSkillId: 0,
    SkillId: 0,
    EmployeeId: 0,
    Active: 0,
    ExperienceInMonths: 0,
    OrgId:0
  };
  displayedColumns = [
    "EmpEmployeeSkillId",
    "SkillId",
    "ExperienceInMonths",
    "Active",
    "Action"
  ];
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
    private datepipe: DatePipe,
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
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.emp.employee.EMPLOYEESKILL)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {

        //this.nav.navigate(['/edu'])
      }
      else {

        this.GetMasterData();
      }
    }
  }

  AddNew() {

    var newdata = {
      EmpEmployeeSkillId: 0,
      SkillId: 0,
      EmployeeId: 0,
      ExperienceInMonths: 0,
      Active: 0,
      Action: false
    };
    this.EmployeeSkillsList = [];
    this.EmployeeSkillsList.push(newdata);
    this.dataSource = new MatTableDataSource<ISkill>(this.EmployeeSkillsList);
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
    let checkFilterString = "SkillId eq " + row.SkillId + " and EmployeeId eq " + this.EmployeeId

    if (row.EmpEmployeeSkillId > 0)
      checkFilterString += " and EmpEmployeeSkillId ne " + row.EmpEmployeeSkillId;
    let list: List = new List();
    list.fields = ["EmpEmployeeSkillId"];
    list.PageName = this.EmployeeSkillsListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {

          this.EmployeeSkillsData.EmpEmployeeSkillId = row.EmpEmployeeSkillId;
          this.EmployeeSkillsData.Active = row.Active;
          this.EmployeeSkillsData.SkillId = row.SkillId;
          this.EmployeeSkillsData.EmployeeId = this.EmployeeId;
          this.EmployeeSkillsData.ExperienceInMonths = row.ExperienceInMonths;
          this.EmployeeSkillsData.OrgId = this.LoginUserDetail[0]["orgId"];

          if (this.EmployeeSkillsData.EmpEmployeeSkillId == 0) {
            this.EmployeeSkillsData["CreatedDate"] = this.datepipe.transform(new Date(),'yyyy-MM-dd');
            this.EmployeeSkillsData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EmployeeSkillsData["UpdatedDate"] = this.datepipe.transform(new Date(),'yyyy-MM-dd');
            delete this.EmployeeSkillsData["UpdatedBy"];
            console.log('this.EmployeeSkillsData', this.EmployeeSkillsData)
            this.insert(row);
          }
          else {
            delete this.EmployeeSkillsData["CreatedDate"];
            delete this.EmployeeSkillsData["CreatedBy"];
            this.EmployeeSkillsData["UpdatedDate"] = new Date();
            this.EmployeeSkillsData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
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
    this.dataservice.postPatch(this.EmployeeSkillsListName, this.EmployeeSkillsData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EmpEmployeeSkillId = data.EmpEmployeeSkillId;
          row.Action = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.EmployeeSkillsListName, this.EmployeeSkillsData, this.EmployeeSkillsData.EmpEmployeeSkillId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
          this.loadingFalse();
        });
  }
  GetEmployeeSkills() {
    debugger;

    this.loading = true;
    let filterStr = 'EmployeeId eq ' + this.EmployeeId
    
    let list: List = new List();
    list.fields = ["*"];

    list.PageName = this.EmployeeSkillsListName;
    list.filter = [filterStr];
    this.EmployeeSkillsList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.EmployeeSkillsList = [...data.value];
        }
        this.dataSource = new MatTableDataSource<ISkill>(this.EmployeeSkillsList);
        this.loadingFalse();
      });

  }

  GetMasterData() {

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId", "Description"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 and (ParentId eq 0 or OrgId eq " + this.LoginUserDetail[0]["orgId"] + ")"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        //this.FamilyRelationship = this.getDropDownData(globalconstants.MasterDefinitions.employee.FAMILYRELATIONSHIP);
        this.EmployeeSkills = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEESKILL);
        this.GetEmployeeSkills();
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
export interface ISkill {
  EmpEmployeeSkillId: number;
  SkillId: number;
  EmployeeId: number;
  Active: number;
  ExperienceInMonths: number;
  Action: boolean;
}