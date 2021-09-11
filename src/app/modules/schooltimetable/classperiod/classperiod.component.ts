import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
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
  StandardFilterWithBatchId = '';
  loading = false;
  rowCount = 0;
  DataToSave = 0;
  SelectedBatchId = 0;
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
  PagePermission = '';
  SchoolClassPeriodData = {
    SchoolClassPeriodId: 0,
    ClassId: 0,
    PeriodId: 0,
    PeriodTypeId:0,
    FromToTime: '',
    Sequence:0,
    OrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns = [];
  searchForm: FormGroup;
  constructor(
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private nav: Router,
    private shareddata: SharedataService,
    private contentservice: ContentService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    debugger;
    this.searchForm = this.fb.group({
      searchClassId: [0],
      searchClassIdApplyAll: [0]
    });

  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.shareddata.CurrentClasses.subscribe(c => (this.Classes = c));
      if (this.Classes.length == 0) {
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
        });
      }
      this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
      this.GetMasterData();
      this.GetAllClassPeriods();
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
          this.alert.success("Data deleted successfully.", this.optionAutoClose);

        });
  }
  UpdateOrSave(row) {

    debugger;

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
        debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
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

          //console.log('data', this.ClassSubjectData);
          if (this.SchoolClassPeriodData.SchoolClassPeriodId == 0) {
            this.SchoolClassPeriodData["CreatedDate"] = new Date();
            this.SchoolClassPeriodData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.SchoolClassPeriodData["UpdatedDate"] = new Date();
            delete this.SchoolClassPeriodData["UpdatedBy"];
            //console.log('exam slot', this.SchoolClassPeriodListData)
            this.insert(row);
          }
          else {
            delete this.SchoolClassPeriodData["CreatedDate"];
            delete this.SchoolClassPeriodData["CreatedBy"];
            this.SchoolClassPeriodData["UpdatedDate"] = new Date();
            this.SchoolClassPeriodData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    debugger;
    this.dataservice.postPatch(this.SchoolClassPeriodListName, this.SchoolClassPeriodData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.SchoolClassPeriodId = data.SchoolClassPeriodId;
          row.Action = false;
          this.loading = false;
          this.rowCount++;
          if (this.rowCount == this.DataToSave) {
            this.loading = false;
            this.alert.success("Data saved successfully", this.optionAutoClose);
          }
          //this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.SchoolClassPeriodListName, this.SchoolClassPeriodData, this.SchoolClassPeriodData.SchoolClassPeriodId, 'patch')
      .subscribe(
        (data: any) => {
          //this.loading = false;
          this.rowCount++;
          row.Action = false;
          if (this.rowCount == this.DataToSave) {
            this.loading = false;
            this.alert.success("Data saved successfully", this.optionAutoClose);
          }
          //this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }

  GetSchoolClassPeriods() {

    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.SchoolClassPeriodList = [];
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 ';
    if (this.searchForm.get("searchClassId").value == 0) {
      this.alert.info("Please select class", this.optionAutoClose);
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
        debugger;
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
              "PeriodTypeId":existing[0].PeriodTypeId,
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
              "PeriodTypeId":0,
              "PeriodName": p.MasterDataName,
              "FromToTime": '',
              "Sequence": 0,
              "Active": 0,
              "Action": false
            })
          }
        })

        this.dataSource = new MatTableDataSource<ISchoolClassPeriod>(this.SchoolClassPeriodList);
        this.loading = false;
      })
  }
  CheckAll(value) {
    this.SchoolClassPeriodList.forEach(record => {
      if (value.checked)
        record.Active = 1;
      else
        record.Active = 0;
      record.Action = !record.Action;
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
      this.alert.info("Please select classes to replicate to!", this.optionsNoAutoClose);
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
      this.UpdateOrSave(record);

    })
  }
  SaveRow(element) {
    debugger;
    this.loading = true;
    this.rowCount = 0;

    this.DataToSave = 1;
    this.UpdateOrSave(element);
  }
  GetMasterData() {

    var orgIdSearchstr = 'and (ParentId eq 0  or OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ')';

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId", "Sequence"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Periods = this.getDropDownData(globalconstants.MasterDefinitions.school.PERIOD);
        this.Periods.sort((a, b) => a.Sequence - b.Sequence);

        this.PeriodTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.PERIODTYPE);
        this.shareddata.ChangeBatch(this.Batches);
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
export interface ISchoolClassPeriod {
  SchoolClassPeriodId: number;
  ClassId: number;
  PeriodId: number;
  PeriodTypeId:number;
  FromToTime: string;
  Sequence:number;
  OrgId: number;
  BatchId: number;
  Active: number;
  Action: boolean;
}


