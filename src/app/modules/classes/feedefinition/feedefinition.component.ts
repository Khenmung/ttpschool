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
  selector: 'app-feedefinition',
  templateUrl: './feedefinition.component.html',
  styleUrls: ['./feedefinition.component.scss']
})
export class FeeDefinitionComponent implements OnInit {
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
  FeeDefinitionListName = 'FeeDefinitions';
  Applications = [];
  loading = false;
  SelectedBatchId = 0;
  FeeDefinitionList: IFeeDefinition[] = [];
  filteredOptions: Observable<IFeeDefinition[]>;
  dataSource: MatTableDataSource<IFeeDefinition>;
  allMasterData = [];
  FeeDefinitions = [];
  FeeCategories = [];
  Permission = 'deny';
  ExamId = 0;
  FeeDefinitionData = {
    FeeDefinitionId: 0,
    FeeName: '',
    Description: '',
    FeeCategoryId: 0,
    OrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns = [
    "FeeDefinitionId",
    "FeeName",
    "Description",
    "FeeCategoryId",
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
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.CLASSCOURSE.CLASSDETAIL)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {

        //this.nav.navigate(['/edu'])
      }
      else {
        this.GetMasterData();
        this.GetFeeDefinitions();
        // if (this.FeeDefinitions.length == 0) {
        //   this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
        //     this.FeeDefinitions = [...data.value];
        //   })
        // }

      }
    }
  }

  AddNew() {

    var newdata = {
      FeeDefinitionId: 0,
      FeeName: '',
      Description: '',
      FeeCategoryId: 0,
      OrgId: 0,
      BatchId: 0,
      Active: 0,
      Action: true
    };
    this.FeeDefinitionList = [];
    this.FeeDefinitionList.push(newdata);
    this.dataSource = new MatTableDataSource<IFeeDefinition>(this.FeeDefinitionList);
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
  UpdateOrSave(row: IFeeDefinition) {

    //debugger;
    this.loading = true;
    let checkFilterString = "FeeName eq '" + row.FeeName + "'"

    if (row.FeeCategoryId == 0) {
      this.alert.error("Please select Fee Category.", this.optionsNoAutoClose);
      this.loading = false;
      row.Action = false;
      return;
    }
    if (row.FeeName == '') {
      this.alert.error("Please enter fee name.", this.optionsNoAutoClose);
      this.loading = false;
      row.Action = false;
      return;
    }
    if (row.FeeDefinitionId > 0)
      checkFilterString += " and FeeDefinitionId ne " + row.FeeDefinitionId;


    let list: List = new List();
    list.fields = ["FeeDefinitionId"];
    list.PageName = this.FeeDefinitionListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {

          this.FeeDefinitionData.FeeDefinitionId = row.FeeDefinitionId;
          this.FeeDefinitionData.FeeName = row.FeeName;
          this.FeeDefinitionData.Description = row.Description;
          this.FeeDefinitionData.FeeCategoryId = row.FeeCategoryId;
          this.FeeDefinitionData.Active = row.Active;
          this.FeeDefinitionData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.FeeDefinitionData.BatchId = this.SelectedBatchId;

          this.FeeDefinitionData.Active = row.Active;
          //console.log('exam slot', this.FeeDefinitionData)

          if (this.FeeDefinitionData.FeeDefinitionId == 0) {
            this.FeeDefinitionData["CreatedDate"] = new Date();
            this.FeeDefinitionData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.FeeDefinitionData["UpdatedDate"] = new Date();
            delete this.FeeDefinitionData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.FeeDefinitionData["CreatedDate"];
            delete this.FeeDefinitionData["CreatedBy"];
            this.FeeDefinitionData["UpdatedDate"] = new Date();
            this.FeeDefinitionData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
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
    this.dataservice.postPatch(this.FeeDefinitionListName, this.FeeDefinitionData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.FeeDefinitionId = data.FeeDefinitionId;
          row.Action = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.FeeDefinitionListName, this.FeeDefinitionData, this.FeeDefinitionData.FeeDefinitionId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
          this.loadingFalse();
        });
  }
  GetFeeDefinitions() {
    debugger;

    this.loading = true;
    let filterStr = 'BatchId eq ' + this.SelectedBatchId + ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    // var _searchClassName = this.searchForm.get("searchClassName").value;
    // if (_searchClassName > 0) {
    //   filterStr += ' and FeeDefinitionId eq ' + _searchClassName;
    // }
    let list: List = new List();
    list.fields = [
      "FeeDefinitionId",
      "FeeName",
      "Description",
      "FeeCategoryId",
      "OrgId",
      "BatchId",
      "Active"
    ];

    list.PageName = this.FeeDefinitionListName;
    list.filter = [filterStr];
    this.FeeDefinitionList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.FeeDefinitionList = [...data.value];
        }
        this.dataSource = new MatTableDataSource<IFeeDefinition>(this.FeeDefinitionList);
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
export interface IFeeDefinition {
  FeeDefinitionId: number;
  FeeName: string;
  Description: string;
  FeeCategoryId: number;
  OrgId: number;
  BatchId: number;
  Active: number;
  Action: boolean;
}
