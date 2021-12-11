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
  selector: 'app-planandmasteritem',
  templateUrl: './planandmasteritem.component.html',
  styleUrls: ['./planandmasteritem.component.scss']
})
export class PlanandmasteritemComponent implements OnInit {
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
  PlanAndMasterItemListName = 'PlanAndMasterItems';
  loading = false;
  SelectedBatchId = 0;
  //SelectedApplicationId =0;
  RowToUpdateCount = -1;
  Topfeatures = [];
  Plans = [];
  Features = [];
  SelectedFeatures = [];
  PlanAndMasterItemList: IPlanMasterItem[] = [];
  filteredOptions: Observable<IPlanMasterItem[]>;
  dataSource: MatTableDataSource<IPlanMasterItem>;
  allMasterData = [];
  PlanAndMasterItems = [];
  Applications = [];
  FeeCategories = [];
  Permission = 'deny';
  PlanAndMasterItemData = {
    PlanAndMasterDataId: 0,
    PlanId: 0,
    MasterDataId: 0,
    Active: 0
  };
  displayedColumns = [
    "PlanAndMasterDataId",
    "PlanId",
    "MasterDataId",
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
      searchApplicationId: [0],
      searchPlanId: [0],
      searchTopfeatureId: [0]
    });
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
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.globaladmin.PLANANDMASTERDATA)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {

        //this.nav.navigate(['/edu'])
      }
      else {
        this.GetPlans();
        this.GetMasterData();

      }
    }
  }

  // AddNew() {

  //   var newdata = {
  //     PlanAndMasterItemId: 0,
  //     PlanId: 0,
  //     FeatureId: 0,
  //     FeatureName: '',
  //     ParentId: 0,

  //     Active: 0,
  //     Action: false
  //   };
  //   this.PlanAndMasterItemList = [];
  //   this.PlanAndMasterItemList.push(newdata);
  //   this.dataSource = new MatTableDataSource<IPlanAndMasterItem>(this.PlanAndMasterItemList);
  //   this.dataSource.paginator = this.paginator;
  //   this.dataSource.sort = this.sort;
  // }
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
  SaveAll() {

    var toUpdate = this.PlanAndMasterItemList.filter(f => f.Action);
    this.RowToUpdateCount = toUpdate.length;
    this.loading = true;
    toUpdate.forEach(element => {
      this.RowToUpdateCount--;
      this.UpdateOrSave(element);
    });

  }
  SaveRow(row) {
    this.RowToUpdateCount = 0;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row: IPlanMasterItem) {

    //debugger;
    this.loading = true;

    if (row.PlanId == 0) {
      this.alert.error("Please enter PlanAndMasterItem name.", this.optionsNoAutoClose);
      this.loading = false;
      row.Action = false;
      return;
    }
    let checkFilterString = "PlanId eq " + row.PlanId + " and PlanId eq " + this.searchForm.get("searchPlanId").value

    if (row.PlanAndMasterDataId > 0)
      checkFilterString += " and PlanAndMasterDataId ne " + row.PlanAndMasterDataId;


    let list: List = new List();
    list.fields = ["PlanAndMasterDataId"];
    list.PageName = this.PlanAndMasterItemListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {

          this.PlanAndMasterItemData.PlanAndMasterDataId = row.PlanAndMasterDataId;
          this.PlanAndMasterItemData.PlanId = row.PlanId;
          this.PlanAndMasterItemData.MasterDataId = row.MasterDataId;
          //this.PlanAndMasterItemData.ParentId = row.ParentId;
          //this.PlanAndMasterItemData.ApplicationId = row.ApplicationId;
          this.PlanAndMasterItemData.Active = row.Active;
          ////console.log("PlanAndMasterItemdata", this.PlanAndMasterItemData)
          if (this.PlanAndMasterItemData.PlanAndMasterDataId == 0) {
            this.insert(row);
          }
          else {
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
    this.dataservice.postPatch(this.PlanAndMasterItemListName, this.PlanAndMasterItemData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.PlanAndMasterDataId = data.PlanAndMasterDataId;
          row.Action = false;
          if (this.RowToUpdateCount == 0) {
            this.RowToUpdateCount = -1;
            this.alert.success("Data saved successfully.", this.optionAutoClose);
            this.loadingFalse()
          }
        });
  }
  update(row) {

    this.dataservice.postPatch(this.PlanAndMasterItemListName, this.PlanAndMasterItemData, this.PlanAndMasterItemData.PlanAndMasterDataId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          if (this.RowToUpdateCount == 0) {
            this.RowToUpdateCount = -1;
            this.alert.success("Data updated successfully.", this.optionAutoClose);
            this.loadingFalse();
          }
        });
  }
  checkall(value) {

    if (value.checked) {
      this.PlanAndMasterItemList.forEach(record => {
        record.Active = 1;
        record.Action = true;
      });
    }
    else {
      this.PlanAndMasterItemList.forEach(record => {
        record.Active = 0;
        record.Action = true;
      });
    }
  }
  GetPlans() {
    this.loading = true;
    let list: List = new List();
    list.fields = [
      "PlanId",
      "Title",
      "Description",
      "Logic"
    ];

    list.PageName = "Plans";
    list.filter = ["Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Plans = [...data.value];
      })
  }
  GetTopFeature() {
    var ApplicationId = this.searchForm.get("searchApplicationId").value;
    this.GetFeatures(ApplicationId).subscribe((d: any) => {
      this.Features = [...d.value];
      this.Topfeatures = this.Features.filter(f => f.ParentId == 0);
      this.loading = false;
    });
  }
  GetFeatures(appId) {
    this.loading = true;
    let list: List = new List();
    list.fields = [
      "PageId",
      "PageTitle",
      "ParentId"
    ];

    list.PageName = "Pages";
    list.filter = ["Active eq 1 and ApplicationId eq " + appId];
    return this.dataservice.get(list)
    // .subscribe((data: any) => {
    //   this.Features = [...data.value];
    // })
  }
  GetPlanAndMasterItem() {
    debugger;

    var _PlanId = this.searchForm.get("searchPlanId").value;

    if (_PlanId == 0) {
      this.alert.info("Please select plan.", this.optionAutoClose);
      return;
    }
    var _applicationId = this.searchForm.get("searchApplicationId").value;
    if (_applicationId == 0) {
      this.alert.info("Please select application.", this.optionAutoClose);
      return;
    }

    this.loading = true;

    let list: List = new List();
    list.fields = [
      "PlanAndMasterDataId",
      "PlanId",
      "MasterDataId",
      "Active"
    ];

    list.PageName = this.PlanAndMasterItemListName;
    list.lookupFields = ["Plan($select=PlanId,Title;$filter=Active eq 1)","MasterItem($filter=Active eq 1;$select=MasterDataId,ApplicationId)"];
    
    list.filter = ["Active eq 1 and ApplicationId eq " + _applicationId + " and PlanId eq " + _PlanId];
    this.PlanAndMasterItemList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _ParentId = 0;
        if (this.searchForm.get("searchTopfeatureId").value > 0)
          _ParentId = this.searchForm.get("searchTopfeatureId").value;

        this.SelectedFeatures = this.Features.filter(f => f.ParentId == _ParentId);
        this.SelectedFeatures.forEach(f => {

          var existing = data.value.filter(d => d.PageId == f.PageId);
          if (existing.length > 0) {
            existing[0].ParentId = _ParentId;
            existing[0].FeatureName = f.PageTitle;
            existing[0].Action = false;
            this.PlanAndMasterItemList.push(existing[0]);
          }
          else {
            this.PlanAndMasterItemList.push(
              {
                PlanAndMasterDataId: 0,
                PlanId: _PlanId,
                MasterDataId:0,
                Active: 0,
                Action: false
              });
          }
        })
        if (this.PlanAndMasterItemList.length == 0) {
          this.alert.info("No record found.", this.optionAutoClose);
        }
        this.PlanAndMasterItemList.sort((a, b) => b.Active - a.Active);
        this.dataSource = new MatTableDataSource<IPlanMasterItem>(this.PlanAndMasterItemList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loadingFalse();
      });

  }

  GetMasterData() {

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId", "Description"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 and (ParentId eq 0 or MasterDataName eq 'Application' or OrgId eq " + this.LoginUserDetail[0]["orgId"] + ")"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.bang);
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
export interface IPlanMasterItem {
  PlanAndMasterDataId: number;
  PlanId: number;
  MasterDataId: number;
  Active: number;
  Action: boolean;
}




