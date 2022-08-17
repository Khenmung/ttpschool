import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-classperiod',
  templateUrl: './classperiod.component.html',
  styleUrls: ['./classperiod.component.scss']
})

export class ClassperiodComponent implements OnInit {
  PageLoading = true;


  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  StandardFilterWithBatchId = '';
  loading = false;
  rowCount = 0;
  DataToSave = 0;
  SelectedBatchId = 0;
  SelectedApplicationId = 0;
  StoredForUpdate = [];
  Classes = [];
  Periods = [];
  PeriodTypes = [];
  Batches = [];
  AllClassPeriods = [];
  SchoolClassPeriodListName = "SchoolClassPeriods";
  SchoolClassPeriodList = [];
  dataSource: MatTableDataSource<ISchoolClassPeriod>;
  allMasterData = [];
  Permission = '';
  SchoolClassPeriodData = {
    SchoolClassPeriodId: 0,
    ClassId: 0,
    PeriodId: 0,
    PeriodTypeId: 0,
    FromToTime: '',
    Sequence: 0,
    OrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns = [];
  searchForm: UntypedFormGroup;
  constructor(
    private datepipe: DatePipe,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,

    private nav: Router,
    private shareddata: SharedataService,
    private contentservice: ContentService,
    private fb: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchClassId: [0],
      searchClassIdApplyAll: [0]
    });
    this.PageLoad();
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.TIMETABLE.CLASSPERIOD);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {

        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
        });

        this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
        this.GetMasterData();
        this.GetAllClassPeriods();
      }
    }
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
          // this.GetApplicationRoles();
          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  UpdateOrSave(row) {

    //debugger;
    
    if (row.Active == 1) {
      if (row.FromToTime == 0) {
        this.contentservice.openSnackBar("Please enter period time.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
      else if (row.PeriodTypeId == 0) {
        this.contentservice.openSnackBar("Please select period type.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
      if (row.Sequence == 0) {
        this.contentservice.openSnackBar("Please enter sequence of period.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
    }
    this.loading = true;


    let checkFilterString = "ClassId eq " + row.ClassId +
      " and PeriodId eq " + row.PeriodId


    if (row.SchoolClassPeriodId > 0)
      checkFilterString += " and SchoolClassPeriodId ne " + row.SchoolClassPeriodId;
    checkFilterString += " and " + this.StandardFilterWithBatchId;

    let list: List = new List();
    list.fields = ["SchoolClassPeriodId"];
    list.PageName = this.SchoolClassPeriodListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.SchoolClassPeriodData.SchoolClassPeriodId = row.SchoolClassPeriodId;
          this.SchoolClassPeriodData.ClassId = row.ClassId;
          this.SchoolClassPeriodData.Active = row.Active;
          this.SchoolClassPeriodData.PeriodId = row.PeriodId;
          this.SchoolClassPeriodData.PeriodTypeId = row.PeriodTypeId;
          this.SchoolClassPeriodData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.SchoolClassPeriodData.BatchId = this.SelectedBatchId;
          this.SchoolClassPeriodData.FromToTime = row.FromToTime;
          this.SchoolClassPeriodData.Sequence = row.Sequence;

          ////console.log('data', this.ClassSubjectData);
          if (this.SchoolClassPeriodData.SchoolClassPeriodId == 0) {
            this.SchoolClassPeriodData["CreatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            this.SchoolClassPeriodData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.SchoolClassPeriodData["UpdatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            delete this.SchoolClassPeriodData["UpdatedBy"];
            ////console.log('exam slot', this.SchoolClassPeriodListData)
            this.insert(row);
          }
          else {
            delete this.SchoolClassPeriodData["CreatedDate"];
            delete this.SchoolClassPeriodData["CreatedBy"];
            this.SchoolClassPeriodData["UpdatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            this.SchoolClassPeriodData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.SchoolClassPeriodListName, this.SchoolClassPeriodData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.SchoolClassPeriodId = data.SchoolClassPeriodId;
          row.Action = false;
          this.loading = false; 
          this.PageLoading = false;
          this.DataToSave--;
          if (this.DataToSave == 0) {
            this.DataToSave = -1;
            this.loading = false; 
            this.PageLoading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }

        });
  }
  update(row) {

    this.dataservice.postPatch(this.SchoolClassPeriodListName, this.SchoolClassPeriodData, this.SchoolClassPeriodData.SchoolClassPeriodId, 'patch')
      .subscribe(
        (data: any) => {
          this.rowCount++;
          row.Action = false;
          this.DataToSave--;
          if (this.DataToSave == 0) {
            this.DataToSave = -1;
            this.loading = false; 
            this.PageLoading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
  }

  GetSchoolClassPeriods() {

    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.SchoolClassPeriodList = [];
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 ';
    if (this.searchForm.get("searchClassId").value == 0) {
      this.contentservice.openSnackBar("Please select class", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    filterstr = 'ClassId eq ' + this.searchForm.get("searchClassId").value;

    let list: List = new List();
    list.fields = [
      "SchoolClassPeriodId",
      "ClassId",
      "PeriodId",
      "PeriodTypeId",
      "FromToTime",
      "Sequence",
      "Active"
    ];
    list.PageName = this.SchoolClassPeriodListName;
    //list.lookupFields = ["ClassSubjectMarkComponent"];
    list.filter = [filterstr + orgIdSearchstr];
    //list.orderBy = "ParentId";
    this.displayedColumns = [
      'PeriodName',
      'PeriodTypeId',
      'FromToTime',
      'Sequence',
      'Active',
      'Action'
    ];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        var forDisplay;

        this.Periods.forEach(p => {
          forDisplay = {
            PeriodName: p.MasterDataName
          }

          let existing = data.value.filter(db => db.PeriodId == p.MasterDataId);
          if (existing.length > 0) {
            this.SchoolClassPeriodList.push({
              "SchoolClassPeriodId": existing[0].SchoolClassPeriodId,
              "ClassId": existing[0].ClassId,
              "PeriodId": existing[0].PeriodId,
              "PeriodTypeId": existing[0].PeriodTypeId,
              "PeriodName": this.Periods.filter(c => c.MasterDataId == existing[0].PeriodId)[0].MasterDataName,
              "FromToTime": existing[0].FromToTime,
              "Sequence": existing[0].Sequence,
              "Active": existing[0].Active,
              "Action": false
            })
          }
          else {
            this.SchoolClassPeriodList.push({
              "SchoolClassPeriodId": 0,
              "ClassId": this.searchForm.get("searchClassId").value,
              "PeriodId": p.MasterDataId,
              "PeriodTypeId": 0,
              "PeriodName": p.MasterDataName,
              "FromToTime": '',
              "Sequence": 0,
              "Active": 0,
              "Action": false
            })
          }
        })

        this.dataSource = new MatTableDataSource<ISchoolClassPeriod>(this.SchoolClassPeriodList);
        this.loading = false; this.PageLoading = false;
      })
  }
  CheckAll(value) {
    this.SchoolClassPeriodList.forEach(record => {
      if (value.checked)
        record.Active = 1;
      else
        record.Active = 0;
      record.Action = true;
    })
  }

  onBlur(element, event) {
    element.Action = true;
  }
  GetAllClassPeriods() {
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.SchoolClassPeriodList = [];
    var orgIdSearchstr = ' OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    //var filterstr = '';// 'Active eq 1 ';

    this.loading = true;

    let list: List = new List();
    list.fields = [
      "SchoolClassPeriodId",
      "ClassId",
      "PeriodId",
      "PeriodTypeId",
      "FromToTime",
      "Sequence",
      "Active"
    ];
    list.PageName = this.SchoolClassPeriodListName;
    list.filter = [orgIdSearchstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AllClassPeriods = [...data.value];
      })
  }
  ReplicateToClasses() {

    if (this.searchForm.get("searchClassIdApplyAll").value == 0) {
      this.contentservice.openSnackBar("Please select classes to replicate to!", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    this.rowCount = 0;

    //not action means data has been saved.
    var filteredAction = this.SchoolClassPeriodList.filter(s => !s.Action);
    var selectedClassIds = this.searchForm.get("searchClassIdApplyAll").value;
    delete selectedClassIds[this.searchForm.get("searchClassId").value];
    this.DataToSave = filteredAction.length * selectedClassIds.length;
    var existInDB = [];

    //this.DataToSave = filteredAction.length;
    filteredAction.forEach(toReplicate => {
      selectedClassIds.forEach(toSelectedClassId => {
        existInDB = this.AllClassPeriods.filter(d => d.ClassId == toSelectedClassId && d.PeriodId == toReplicate.PeriodId)
        if (existInDB.length == 0) {
          var toinsert = JSON.parse(JSON.stringify(toReplicate));
          toinsert.SchoolClassPeriodId = 0;
          toinsert.ClassId = toSelectedClassId;
          this.UpdateOrSave(toinsert);
        }
        else {
          var _schoolClassPeriodId = 0;
          existInDB.forEach(e => {
            _schoolClassPeriodId = JSON.parse(JSON.stringify(e.SchoolClassPeriodId));
            e = JSON.parse(JSON.stringify(toReplicate));
            e.SchoolClassPeriodId = _schoolClassPeriodId;
            e.ClassId = toSelectedClassId;
            this.UpdateOrSave(e);

          })
        }
      })
    })


  }
  SaveAll() {

    this.loading = true;
    this.rowCount = 0;
    var checkedRows = this.SchoolClassPeriodList.filter(f => f.Action);
    this.DataToSave = checkedRows.length;

    checkedRows.forEach(record => {
      this.DataToSave--;
      this.UpdateOrSave(record);

    })
  }
  SaveRow(element) {
    //debugger;
    this.loading = true;
    this.rowCount = 0;

    this.DataToSave = 0;
    this.UpdateOrSave(element);
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Periods = this.getDropDownData(globalconstants.MasterDefinitions.school.PERIOD);
        this.Periods.sort((a, b) => a.Sequence - b.Sequence);

        this.PeriodTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.PERIODTYPE);
        //this.shareddata.ChangeBatch(this.Batches);
        this.Batches = this.tokenstorage.getBatches()
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
export interface ISchoolClassPeriod {
  SchoolClassPeriodId: number;
  ClassId: number;
  PeriodId: number;
  PeriodTypeId: number;
  FromToTime: string;
  Sequence: number;
  OrgId: number;
  BatchId: number;
  Active: number;
  Action: boolean;
}


