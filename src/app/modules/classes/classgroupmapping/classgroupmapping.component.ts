import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-classgroupmapping',
  templateUrl: './classgroupmapping.component.html',
  styleUrls: ['./classgroupmapping.component.scss']
})
export class ClassgroupmappingComponent implements OnInit {
    PageLoading = true;
  @ViewChild(MatPaginator) paging: MatPaginator;
  ClassGroupTypes = [];
  ClassGroups = [];
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  ClassGroupMappingListName = 'ClassGroupMappings';
  Applications = [];
  loading = false;
  SelectedBatchId = 0;
  ClassGroupMappingList: IClassGroupMapping[] = [];
  filteredOptions: Observable<IClassGroupMapping[]>;
  dataSource: MatTableDataSource<IClassGroupMapping>;
  allMasterData = [];
  ClassGroupMapping = [];
  Permission = 'deny';
  Classes = [];
  ClassGroupMappingData = {
    ClassGroupMappingId: 0,
    ClassId: 0,
    ClassGroupId: 0,
    OrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns = [
    "ClassGroupMappingId",
    "ClassId",
    "ClassGroupId",
    "Active",
    "Action"
  ];
  SelectedApplicationId = 0;
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private nav: Router,
    private datepipe: DatePipe,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchClassGroupId: [0]
    });
    this.PageLoad();
  }

  PageLoad() {

    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    //this.EmployeeId = +this.tokenstorage.getEmployeeId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.CLASSCOURSE.CLASSGROUPING);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {
        //this.nav.navigate(['/edu'])
      }
      else {

        this.GetMasterData();
        this.Getclassgroups();
      }
    }
  }

  AddNew() {

    var newdata = {
      ClassGroupMappingId: 0,
      ClassId: 0,
      ClassGroupId: 0,
      Active: 0,
      Action: false
    };
    this.ClassGroupMappingList = [];
    this.ClassGroupMappingList.push(newdata);
    this.dataSource = new MatTableDataSource<IClassGroupMapping>(this.ClassGroupMappingList);
    this.dataSource.paginator = this.paging;
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

          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  UpdateOrSave(row) {

    //debugger;
    this.loading = true;
    let checkFilterString = "ClassId eq " + row.ClassId +
      " and OrgId eq " + this.LoginUserDetail[0]["orgId"] +
      " and ClassGroupId eq " + row.ClassGroupId

    if (row.ClassGroupMappingId > 0)
      checkFilterString += " and ClassGroupMappingId ne " + row.ClassGroupMappingId;
    let list: List = new List();
    list.fields = ["ClassGroupMappingId"];
    list.PageName = this.ClassGroupMappingListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.ClassGroupMappingData.ClassGroupMappingId = row.ClassGroupMappingId;
          this.ClassGroupMappingData.Active = row.Active;
          this.ClassGroupMappingData.ClassId = row.ClassId;
          this.ClassGroupMappingData.ClassGroupId = row.ClassGroupId;
          this.ClassGroupMappingData.BatchId = this.SelectedBatchId;
          this.ClassGroupMappingData.OrgId = this.LoginUserDetail[0]["orgId"];
          console.log("this.ClassGroupMappingData", this.ClassGroupMappingData)
          if (this.ClassGroupMappingData.ClassGroupMappingId == 0) {
            this.ClassGroupMappingData["CreatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            this.ClassGroupMappingData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ClassGroupMappingData["UpdatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            delete this.ClassGroupMappingData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.ClassGroupMappingData["CreatedDate"];
            delete this.ClassGroupMappingData["CreatedBy"];
            this.ClassGroupMappingData["UpdatedDate"] = new Date();
            this.ClassGroupMappingData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.ClassGroupMappingListName, this.ClassGroupMappingData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ClassGroupMappingId = data.ClassGroupMappingId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.ClassGroupMappingListName, this.ClassGroupMappingData, this.ClassGroupMappingData.ClassGroupMappingId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  classgroupList = [];
  Getclassgroups() {
    this.loading=true;
    this.contentservice.GetClassGroups(this.LoginUserDetail[0]['orgId'])
    .subscribe((data:any)=>{
      this.ClassGroups = [...data.value];
      this.loading=false;
    })
    // this.loading = true;
    // let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]['orgId']; // BatchId eq  + this.SelectedBatchId
    // let list: List = new List();
    // list.fields = [
    //   "ClassGroupId",
    //   "GroupName",
    //   "ClassGroupTypeId",
    //   "Active"
    // ];

    // list.PageName = "ClassGroups";
    // list.filter = [filterStr];
    // this.ClassGroups = [];
    // this.dataservice.get(list)
    //   .subscribe((data: any) => {
    //     if (data.value.length > 0) {
    //       this.ClassGroups = [...data.value];
    //     }
    //     else {
    //       this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
    //     }

    //   });

  }
  GetClassGroupMapping() {
    debugger;

    this.loading = true;
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"]
    //  " and BatchId eq " + this.SelectedBatchId;

    var _ClassGroupId = this.searchForm.get("searchClassGroupId").value;
    if (_ClassGroupId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select class group.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      filterStr += " and ClassGroupId eq " + _ClassGroupId;
    }

    let list: List = new List();
    list.fields = ["*"];

    list.PageName = this.ClassGroupMappingListName;
    list.filter = [filterStr];
    this.ClassGroupMappingList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.ClassGroupMappingList = [...data.value];
        }
        if (this.ClassGroupMappingList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }
        this.dataSource = new MatTableDataSource<IClassGroupMapping>(this.ClassGroupMappingList);
        this.dataSource.paginator = this.paging;
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.ClassGroupTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSGROUPTYPE)
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
          this.loading = false; this.PageLoading = false;
        });


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
export interface IClassGroupMapping {
  ClassGroupMappingId: number;
  ClassId: number;
  ClassGroupId: number;
  Active: number;
  Action: boolean;
}

