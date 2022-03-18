import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import * as moment from 'moment';

@Component({
  selector: 'app-examslot',
  templateUrl: './examslot.component.html',
  styleUrls: ['./examslot.component.scss']
})
export class ExamslotComponent implements OnInit {
  weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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
  DataCountToUpdate = 0;
  ExamSlots: IExamSlots[] = [];
  SelectedBatchId = 0;
  SelectedApplicationId=0;
  Exams = [];
  ExamNames = [];
  SlotNames = [];
  Batches = [];
  dataSource: MatTableDataSource<IExamSlots>;
  allMasterData = [];

  ExamId = 0;
  ExamSlotsData = {
    ExamSlotId: 0,
    ExamId: 0,
    SlotNameId: 0,
    StartTime: '',
    EndTime: '',
    ExamDate: moment(),
    Sequence:0,
    OrgId: 0,
    BatchId: 0,
    Active: 1
  };
  displayedColumns = [
    'ExamSlotId',
    'ExamDate',
    'SlotName',
    'StartTime',
    'EndTime',
    'Sequence',
    'Active',
    'Action'
  ];
  searchForm: FormGroup;
  constructor(
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    
    private contentservice: ContentService,
    private nav: Router,
    private shareddata: SharedataService,
    private datepipe: DatePipe,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchExamId: [0],
      searchExamDate: [new Date()]
    });
    this.PageLoad();
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
      //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
      this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
      this.shareddata.CurrentBatch.subscribe(b => this.Batches = b);
      this.GetMasterData();
    }
  }
  AssignExamDate(selected) {
    var startdate = this.Exams.filter(f => f.ExamId == selected.value)[0].StartDate;
    //console.log("value", selected.value)

    this.searchForm.patchValue({ "searchExamDate": startdate });
  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = row.Active == 1 ? 0 : 1;
  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {
          // this.GetApplicationRoles();
          this.contentservice.openSnackBar(globalconstants.DeletedMessage,globalconstants.ActionText,globalconstants.BlueBackground);

        });
  }
  SaveAll() {
    var toUpdate = this.ExamSlots.filter(f => f.Action);
    this.DataCountToUpdate = toUpdate.length;
    toUpdate.forEach(f => {
      this.DataCountToUpdate--;
      this.UpdateOrSave(f);
    })
  }
  Save(row) {
    this.DataCountToUpdate = 0;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row) {

    //debugger;
    this.loading = true;

    if (row.ExamDate == null) {
      this.loading = false;
      this.contentservice.openSnackBar("Exam date is mandatory!", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    if (row.StartTime.length == 0 || row.EndTime.length == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Start time and end time are mandatory!", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    var dateplusone = new Date(row.ExamDate).setDate(new Date(row.ExamDate).getDate() + 1)
    let checkFilterString = "ExamId eq " + this.searchForm.get("searchExamId").value +
      " and SlotNameId eq " + row.SlotNameId +
      " and ExamDate gt " + this.datepipe.transform(row.ExamDate, 'yyyy-MM-dd') +
      " and ExamDate lt " + this.datepipe.transform(dateplusone, 'yyyy-MM-dd')


    if (row.ExamSlotId > 0)
      checkFilterString += " and ExamSlotId ne " + row.ExamSlotId;
    checkFilterString += " and " + this.StandardFilterWithBatchId;

    let list: List = new List();
    list.fields = ["ExamSlotId"];
    list.PageName = "ExamSlots";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.AddedMessage, globalconstants.RedBackground);
        }
        else {
          //var _date = new Date(this.datepipe.transform(row.ExamDate, 'yyyy-MM-dd'))

          this.ExamSlotsData.ExamSlotId = row.ExamSlotId;
          this.ExamSlotsData.ExamId = this.searchForm.get("searchExamId").value;
          this.ExamSlotsData.Active = row.Active;
          this.ExamSlotsData.SlotNameId = row.SlotNameId;
          this.ExamSlotsData.ExamDate = row.ExamDate;//.format('yyyy/MM/dd');
          this.ExamSlotsData.StartTime = row.StartTime;
          this.ExamSlotsData.EndTime = row.EndTime;
          this.ExamSlotsData.Sequence = row.Sequence;
          this.ExamSlotsData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ExamSlotsData.BatchId = this.SelectedBatchId;
          
          if (this.ExamSlotsData.ExamSlotId == 0) {
            this.ExamSlotsData["CreatedDate"] = new Date();
            this.ExamSlotsData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ExamSlotsData["UpdatedDate"] = new Date();
            delete this.ExamSlotsData["UpdatedBy"];
            //console.log('exam slot', this.ExamSlotsData)
            this.insert(row);
          }
          else {
            delete this.ExamSlotsData["CreatedDate"];
            delete this.ExamSlotsData["CreatedBy"];
            this.ExamSlotsData["UpdatedDate"] = new Date();
            this.ExamSlotsData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            console.log('ExamSlotsData', this.ExamSlotsData);
            this.update(row);
          }
        }
      });

  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('ExamSlots', this.ExamSlotsData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.ExamSlotId = data.ExamSlotId;
          row.Action = false;
          if (this.DataCountToUpdate == 0) {
            this.DataCountToUpdate = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
  }
  update(row) {

    this.dataservice.postPatch('ExamSlots', this.ExamSlotsData, this.ExamSlotsData.ExamSlotId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.Action = false;
          if (this.DataCountToUpdate == 0) {
            this.DataCountToUpdate = -1;
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          }
        });
  }
  GetExams() {

    //var orgIdSearchstr = this.StandardFilterWithBatchId;// ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId", "StartDate", "EndDate"];
    list.PageName = "Exams";
    list.filter = ["Active eq 1 and " + this.StandardFilterWithBatchId];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _examName = '';
        var _startDate, _endDate = null;
        this.Exams = data.value.map(e => {
          _examName = '';
          var examobj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
          if (examobj.length > 0) {
            _examName = examobj[0].MasterDataName + " (" + this.datepipe.transform(e.StartDate, 'dd/MM/yyyy') + " - " + this.datepipe.transform(e.EndDate, 'dd/MM/yyyy') + ")";
          }
          return {
            ExamId: e.ExamId,
            ExamName: _examName,
            StartDate: e.StartDate,
            EndDate: e.EndDate
          }
        })
        this.loading = false;
      })
  }
  GetExamSlots() {
    debugger;
    //var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = '';
    this.ExamSlots = [];
    if (this.searchForm.get("searchExamId").value == 0) {

      this.contentservice.openSnackBar("Please select exam", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    else
      filterstr = ' and ExamId eq ' + this.searchForm.get("searchExamId").value;

    var dateObj = this.Exams.filter(e => e.ExamId == this.searchForm.get("searchExamId").value);
    var _startDate = new Date(dateObj[0].StartDate);
    var _endDate = new Date(dateObj[0].EndDate);
    _startDate.setHours(0, 0, 0, 0);
    _endDate.setHours(0, 0, 0, 0);
    var _filterExamDate = new Date(this.searchForm.get("searchExamDate").value);
    var higherdate = new Date(this.searchForm.get("searchExamDate").value);
    higherdate.setDate(_filterExamDate.getDate() +1);

    if (!_filterExamDate != null) {

      filterstr += " and ExamDate ge " + this.datepipe.transform(_filterExamDate, 'yyyy-MM-dd');
      filterstr += " and ExamDate lt " + this.datepipe.transform(higherdate, 'yyyy-MM-dd');
      //var startDate = new Date(_startDate)
      if (_filterExamDate.getTime() < _startDate.getTime() || _filterExamDate.getTime() > _endDate.getTime()) {
        this.contentservice.openSnackBar("Date should be between exam start date and end date.",globalconstants.ActionText,globalconstants.RedBackground);
        return;
      }
    }

    this.loading = true;
    let list: List = new List();
    list.fields = ["ExamSlotId", "ExamId",
      "SlotNameId",
      "ExamDate",
      "StartTime",
      "EndTime",
      "Sequence",
      "OrgId",
      "BatchId",
      "Active"];
    list.PageName = "ExamSlots";
    list.filter = ["Active eq 1 and " + this.StandardFilterWithBatchId + filterstr];
    //list.orderBy = "ParentId";
    this.ExamSlots = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _examDate = _startDate;
        var day = '';

        if (_filterExamDate != null) {
          _examDate = _filterExamDate;
        }
        //while (_examDate < higherdate) {
          day = this.weekday[_examDate.getDay()];

          this.SlotNames.forEach(e => {
            let existing = data.value.filter(db => {                                     
              return db.SlotNameId == e.MasterDataId
            });
            if (existing.length > 0) {
              existing[0].SlotName = e.MasterDataName;
              existing[0].WeekDay = day;
              existing[0].Action = false;
              existing[0].ExamDate = moment(existing[0].ExamDate),
              this.ExamSlots.push(existing[0]);
            }
            else {
              this.ExamSlots.push({
                ExamSlotId: 0,
                ExamId: 0,
                SlotNameId: e.MasterDataId,
                SlotName: e.MasterDataName,
                ExamDate: _examDate,
                WeekDay: day,
                StartTime: '',
                EndTime: '',
                Sequence:0,
                OrgId: 0,
                BatchId: 0,
                Active: 0,
                Action: false
              });
            }
          })
        //  _examDate.setDate(_examDate.getDate() + 1);
        //}
        ////console.log('this', this.ExamSlots)
        this.dataSource = new MatTableDataSource<IExamSlots>(this.ExamSlots);
        this.loading = false;
      })
  }
  onBlur(row) {
    row.Action = true;
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"],this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.SlotNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSLOTNAME);
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        this.GetExams();
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
export interface IExamSlots {
  ExamSlotId: number;
  ExamId: number;
  SlotNameId: number;
  SlotName: string;
  ExamDate: Date;
  WeekDay: string;
  StartTime: string;
  EndTime: string;
  Sequence: number;
  OrgId: number;
  BatchId: number;
  Active: number;
  Action: boolean
}

