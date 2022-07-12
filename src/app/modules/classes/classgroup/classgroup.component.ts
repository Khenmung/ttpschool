import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-classclassgroup',
  templateUrl: './classgroup.component.html',
  styleUrls: ['./classgroup.component.scss']
})
export class ClassgroupComponent implements OnInit {
    PageLoading = true;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  IscurrentBatchSelect = 1;
  classgroupListName = 'ClassGroups';
  Applications = [];
  Permission = '';
  loading = false;
  SelectedApplicationId = 0;
  ClassGroupType = [];
  SelectedBatchId = 0;
  classgroupList: IClassgroup[] = [];
  filteredOptions: Observable<IClassgroup[]>;
  dataSource: MatTableDataSource<IClassgroup>;
  allMasterData = [];
  ClassMasters = [];
  classgroupData = {
    ClassGroupId: 0,
    GroupName: '',
    ClassGroupTypeId: 0,
    BatchId: 0,
    OrgId: 0,
    Active: 0,
    //Deleted: 0
  };
  displayedColumns = [
    "ClassGroupId",
    "GroupName",
    "ClassGroupTypeId",
    "Active",
    "Action"
  ];
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,

    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
    private datepipe: DatePipe,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchClassId: [0]
    });
    this.PageLoad();
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.IscurrentBatchSelect = +this.tokenstorage.getCheckEqualBatchId();
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.CLASSCOURSE.CLASSGROUP);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;

      if (this.Permission == 'deny') {
        //this.nav.navigate(['/edu']);
      }
      else if (this.ClassMasters.length == 0) {
        this.GetMasterData();
        this.Getclassgroups();
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.ClassMasters = [...data.value];
          this.loading = false;
          this.PageLoading = false;
        })
      }
      this.loading = false; this.PageLoading = false;

    }
  }
  AddNew() {

    // if (this.searchForm.get("searchClassId").value == 0) {
    //   this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText,globalconstants.RedBackground);
    //   return;
    // }

    var newdata = {
      ClassGroupId: 0,
      GroupName: '',
      ClassGroupTypeId: 0,
      OrgId: 0,
      Active: 0,
      Action: false
    };
    this.classgroupList = [];
    this.classgroupList.push(newdata);
    this.dataSource = new MatTableDataSource<IClassgroup>(this.classgroupList);
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

    if (row.ClassGroupTypeId == 0) {
      this.contentservice.openSnackBar("Please select class group type.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.loading = true;
    let checkFilterString = "OrgId eq " + this.LoginUserDetail[0]['orgId'] + " and GroupName eq '" + row.GroupName + "'"

    if (row.ClassGroupId > 0)
      checkFilterString += " and ClassGroupId ne " + row.ClassGroupId;
    let list: List = new List();
    list.fields = ["ClassGroupId"];
    list.PageName = this.classgroupListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.classgroupData.ClassGroupId = row.ClassGroupId;
          this.classgroupData.GroupName = row.GroupName;
          this.classgroupData.ClassGroupTypeId = row.ClassGroupTypeId;
          this.classgroupData.BatchId = this.SelectedBatchId;
          this.classgroupData.OrgId = this.LoginUserDetail[0]["orgId"];
          //this.classgroupData.Deleted = 0;
          this.classgroupData.Active = row.Active;

          if (this.classgroupData.ClassGroupId == 0) {
            this.classgroupData["CreatedDate"] = new Date();
            this.classgroupData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.classgroupData["UpdatedDate"] = new Date();
            delete this.classgroupData["UpdatedBy"];
            console.log("this.classgroupData", this.classgroupData)
            this.insert(row);
          }
          else {
            delete this.classgroupData["CreatedDate"];
            delete this.classgroupData["CreatedBy"];
            this.classgroupData["UpdatedDate"] = new Date();
            this.classgroupData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
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
    this.dataservice.postPatch(this.classgroupListName, this.classgroupData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ClassGroupId = data.ClassGroupId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.classgroupListName, this.classgroupData, this.classgroupData.ClassGroupId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  Getclassgroups() {
    //debugger;

    this.loading = true;
    let filterStr = 'OrgId eq ' +  this.LoginUserDetail[0]['orgId']; // BatchId eq  + this.SelectedBatchId
    // var _searchClassId = this.searchForm.get("searchClassId").value;
    // if (_searchClassId == 0) {
    //   this.loading = false; this.PageLoading=false;
    //   this.contentservice.openSnackBar("Please select class/course.", globalconstants.ActionText,globalconstants.RedBackground);
    //   return;
    // }
    // else {
    //   filterStr += ' ClassId eq ' + _searchClassId
    // }
    let list: List = new List();
    list.fields = [
      "ClassGroupId",
      "GroupName",
      "ClassGroupTypeId",
      "Active"
    ];

    list.PageName = this.classgroupListName;
    list.filter = [filterStr];
    this.classgroupList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.classgroupList = [...data.value];
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.dataSource = new MatTableDataSource<IClassgroup>(this.classgroupList);
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.ClassGroupType = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSGROUPTYPE)
        this.loading = false; this.PageLoading = false;
      });
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenstorage, this.allMasterData);
    // let Id = 0;
    // let Ids = this.allMasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();//globalconstants.GENDER
    // })
    // if (Ids.length > 0) {
    //   Id = Ids[0].MasterDataId;
    //   return this.allMasterData.filter((item, index) => {
    //     return item.ParentId == Id
    //   })
    // }
    // else
    //   return [];

  }
}
export interface IClassgroup {
  ClassGroupId: number;
  GroupName: string;
  ClassGroupTypeId: number;
  Active: number;
  Action: boolean;
}





