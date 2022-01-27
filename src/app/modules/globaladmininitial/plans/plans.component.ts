import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss']
})
export class PlansComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

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
  PlanListName = 'Plans';
  loading = false;
  SelectedApplicationId=0;
  SelectedBatchId = 0;
  PlanList: IPlan[] = [];
  filteredOptions: Observable<IPlan[]>;
  dataSource: MatTableDataSource<IPlan>;
  allMasterData = [];
  Plans = [];
  FeeCategories = [];
  Permission = 'deny';
  ExamId = 0;
  PlanData = {
    PlanId: 0,
    Title: '',
    Description: '',
    Logic:'',
    PCPM: 0,
    MinPrice: 0,
    MinCount: 0,
    Active: 0
  };
  displayedColumns = [
    "PlanId",
    "Title",
    "Description",
    "Logic",
    "PCPM",
    "MinPrice",
    "MinCount",
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
    // this.searchForm = this.fb.group({
    //   searchClassName: [0]
    // });
    this.PageLoad();
  }

  PageLoad() {

    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.globaladmin.PLAN)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {

        //this.nav.navigate(['/edu'])
      }
      else {
        this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
        this.GetMasterData();
        this.GetPlans();

      }
    }
  }

  AddNew() {

    var newdata = {
      "PlanId": 0,
      "Title": '',
      "Description": '',
      "Logic":'',
      "PCPM":0,
      "MinPrice":0,
      "MinCount":0,
      "Active": 0,
      "Action": false
    };
    this.PlanList = [];
    this.PlanList.push(newdata);
    this.dataSource = new MatTableDataSource<IPlan>(this.PlanList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
  UpdateOrSave(row: IPlan) {

    //debugger;
    this.loading = true;
    let checkFilterString = "Title eq '" + row.Title + "'"

    if (row.Title == '') {
      this.alert.error("Please enter plan name.", this.optionsNoAutoClose);
      this.loading = false;
      row.Action = false;
      return;
    }
    if (row.PlanId > 0)
      checkFilterString += " and PlanId ne " + row.PlanId;


    let list: List = new List();
    list.fields = ["PlanId"];
    list.PageName = this.PlanListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {

          this.PlanData.PlanId = row.PlanId;
          this.PlanData.Title = row.Title;
          this.PlanData.Description = row.Description;
          this.PlanData.Logic = row.Logic;
          this.PlanData.PCPM = +row.PCPM;
          this.PlanData.MinPrice = +row.MinPrice;
          this.PlanData.MinCount = +row.MinCount;
          this.PlanData.Active = row.Active;
          ////console.log("plandata", this.PlanData)
          if (this.PlanData.PlanId == 0) {
            this.insert(row);
          }
          else {
            // delete this.PlanData["CreatedDate"];
            // delete this.PlanData["CreatedBy"];
            // this.PlanData["UpdatedDate"] = new Date();
            // this.PlanData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
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
    this.dataservice.postPatch(this.PlanListName, this.PlanData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.PlanId = data.PlanId;
          row.Action = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.PlanListName, this.PlanData, this.PlanData.PlanId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
          this.loadingFalse();
        });
  }
  GetPlans() {
    debugger;

    this.loading = true;
    let list: List = new List();
    list.fields = [
      "PlanId",
      "Title",
      "Description",
      "Logic",
      "PCPM",
      "MinCount",
      "MinPrice",
      "Active"
    ];

    list.PageName = this.PlanListName;
    //list.filter = ["Active eq 1"];
    this.PlanList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.PlanList = data.value.map(m=>{
            m.Action=false;
            return m;
          });
        }
        this.dataSource = new MatTableDataSource<IPlan>(this.PlanList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"],this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        //this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.bang);
        this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY);
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
export interface IPlan {
  PlanId: number;
  Title: string;
  Description: string;
  Logic:string;
  PCPM: number;
  MinPrice: number;
  MinCount: number;
  Active: number;
  Action: boolean;
}

