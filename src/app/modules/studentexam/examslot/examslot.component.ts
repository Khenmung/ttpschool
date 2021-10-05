import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-examslot',
  templateUrl: './examslot.component.html',
  styleUrls: ['./examslot.component.scss']
})
export class ExamslotComponent implements OnInit {
  weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

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
  ExamSlots: IExamSlots[] = [];
  SelectedBatchId = 0;
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
    StartTime: String,
    EndTime: String,
    ExamDate: Date,
    OrgId: 0,
    BatchId: 0,
    Active: 1
  };
  displayedColumns = [
    'ExamDate',
    'SlotName',
    'StartTime',
    'EndTime',
    'Active',
    'Action'
  ];
  searchForm: FormGroup;
  constructor(
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
    debugger;
    this.searchForm = this.fb.group({
      searchExamId: [0],

    });

  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
      //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
      this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
      this.shareddata.CurrentBatch.subscribe(b=>this.Batches=b);
      this.GetMasterData();
    }
  }
  // GetCurrentBatchIDnAssign() {
  //   let CurrentBatches = this.Batches.filter(b => b.MasterDataName == globalconstants.getCurrentBatch());
  //   if (CurrentBatches.length > 0) {
  //     this.SelectedBatchId = CurrentBatches[0].MasterDataId;
  //   }
  // }
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
          this.alert.success("Data deleted successfully.", this.optionAutoClose);

        });
  }
  UpdateOrSave(row) {

    debugger;
    this.loading = true;

    if (row.ExamDate == null) {
      this.loading = false;
      this.alert.error("Exam date is mandatory!", this.optionAutoClose);
      return;
    }
    if (row.StartTime.length == 0 || row.EndTime.length == 0) {
      this.loading = false;
      this.alert.error("Start time and end time are mandatory!", this.optionAutoClose);
      return;
    }
    var dateplusone = new Date(row.ExamDate).setDate(new Date(row.ExamDate).getDate()+1)
    let checkFilterString = "ExamId eq " + this.searchForm.get("searchExamId").value +
      " and SlotNameId eq " + row.SlotNameId +
      " and ExamDate gt datetime'" + this.datepipe.transform(row.ExamDate,'yyyy-MM-dd') + "'" +
      " and ExamDate lt datetime'" + this.datepipe.transform(dateplusone,'yyyy-MM-dd') + "'"


    if (row.ExamSlotId > 0)
      checkFilterString += " and ExamSlotId ne " + row.ExamSlotId;
    checkFilterString += " and " + this.StandardFilterWithBatchId;

    let list: List = new List();
    list.fields = ["ExamSlotId"];
    list.PageName = "ExamSlots";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.loading=false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {
          //var _examdate =new Date(row.ExamDate).setDate(row.ExamDate.getDate()+1);
          this.ExamSlotsData.ExamSlotId = row.ExamSlotId;
          this.ExamSlotsData.ExamId = this.searchForm.get("searchExamId").value;
          this.ExamSlotsData.Active = row.Active;
          this.ExamSlotsData.SlotNameId = row.SlotNameId;
          this.ExamSlotsData.ExamDate = row.ExamDate;
          this.ExamSlotsData.StartTime = row.StartTime;
          this.ExamSlotsData.EndTime = row.EndTime;
          this.ExamSlotsData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ExamSlotsData.BatchId = this.SelectedBatchId;
          //console.log('data', this.ClassSubjectData);
          if (this.ExamSlotsData.ExamSlotId == 0) {
            this.ExamSlotsData["CreatedDate"] = new Date();
            this.ExamSlotsData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ExamSlotsData["UpdatedDate"] = new Date();
            delete this.ExamSlotsData["UpdatedBy"];
            console.log('exam slot', this.ExamSlotsData)
            this.insert(row);
          }
          else {
            delete this.ExamSlotsData["CreatedDate"];
            delete this.ExamSlotsData["CreatedBy"];
            this.ExamSlotsData["UpdatedDate"] = new Date();
            this.ExamSlotsData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update();
          }
        }
      });

  }

  insert(row) {

    debugger;
    this.dataservice.postPatch('ExamSlots', this.ExamSlotsData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.ExamSlotId = data.ExamSlotId;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update() {

    this.dataservice.postPatch('ExamSlots', this.ExamSlotsData, this.ExamSlotsData.ExamSlotId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
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
        this.Exams = data.value.map(e => {
          return {
            ExamId: e.ExamId,
            ExamName: this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId)[0].MasterDataName,
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
    if (this.searchForm.get("searchExamId").value == 0) {

      this.alert.error("Please select exam", this.optionAutoClose);
      return;
    }
    else
      filterstr = ' and ExamId eq ' + this.searchForm.get("searchExamId").value;

    this.loading = true;
    let list: List = new List();
    list.fields = ["ExamSlotId", "ExamId",
      "SlotNameId",
      "ExamDate",
      "StartTime",
      "EndTime",
      "OrgId",
      "BatchId",
      "Active"];
    list.PageName = "ExamSlots";
    list.filter = ["Active eq 1 and " + this.StandardFilterWithBatchId + filterstr];
    //list.orderBy = "ParentId";
    this.ExamSlots =[];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _startDate = new Date(this.Exams.filter(e => e.ExamId == this.searchForm.get("searchExamId").value)[0].StartDate);
        var _endDate = new Date(this.Exams.filter(e => e.ExamId == this.searchForm.get("searchExamId").value)[0].EndDate);
        var _examDate = _startDate;
        var day ='';
        //var dtstring;
        while ( _examDate < _endDate) {
          day = this.weekday[_examDate.getDay()];
          //dtstring =new Date(_examDate);
           this.SlotNames.forEach(e => {
            let existing = data.value.filter(db =>{
              var same = this.datepipe.transform(db.ExamDate,'dd/MM/yyyy') === this.datepipe.transform(_examDate,'dd/MM/yyyy')
              return db.SlotNameId == e.MasterDataId && same 
            } );
            if (existing.length > 0) {
              existing[0].SlotName = e.MasterDataName;
              existing[0].WeekDay = day;
              this.ExamSlots.push(existing[0]);
            }
            else {
              this.ExamSlots.push({
                ExamSlotId: 0,
                ExamId: 0,
                SlotNameId: e.MasterDataId,
                SlotName: e.MasterDataName,
                ExamDate: new Date(_examDate.getTime()),
                WeekDay:day,
                StartTime: '',
                EndTime: '',
                OrgId: 0,
                BatchId: 0,
                Active: 0
              });
              }
            })
          _examDate.setDate(_examDate.getDate() + 1);
        }
        //console.log('this', this.ExamSlots)
        this.dataSource = new MatTableDataSource<IExamSlots>(this.ExamSlots);
        this.loading = false;
      })
  }
  GetMasterData() {

    var orgIdSearchstr = 'and (ParentId eq 0  or OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ')';

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.SlotNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSLOTNAME);
        //this.Batches = this.getDropDownData(globalconstants.MasterDefinitions.school.BATCH);
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
  WeekDay:string;
  StartTime: string;
  EndTime: string;
  OrgId: number;
  BatchId: number;
  Active: number;
}

