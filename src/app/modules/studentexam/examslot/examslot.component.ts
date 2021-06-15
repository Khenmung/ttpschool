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
  StandardFilter = '';
  loading = false;
  ExamSlots: IExamSlots[] = [];
  CurrentBatchId = 0;
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
    'SlotNameId',
    'ExamDate',
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
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);

      this.GetMasterData();
    }
  }

  PageLoad() {

  }
  GetCurrentBatchIDnAssign() {
    let CurrentBatches = this.Batches.filter(b => b.MasterDataName == globalconstants.getCurrentBatch());
    if (CurrentBatches.length > 0) {
      this.CurrentBatchId = CurrentBatches[0].MasterDataId;
    }
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
          this.alert.success("Data deleted successfully.", this.optionAutoClose);

        });
  }
  UpdateOrSave(row) {

    debugger;
    if(row.ExamDate ==null)
    {
      this.alert.error("Exam date is mandatory!",this.optionAutoClose);
      return;
    }
    if(row.StartTime.length==0 || row.EndTime.length ==0)
    {
      this.alert.error("Start time and end time are mandatory!",this.optionAutoClose);
      return;
    }
    
    let checkFilterString = "ExamId eq " + this.searchForm.get("searchExamId").value +
      " and SlotNameId eq " + row.SlotNameId +
      this.StandardFilter;

    if (row.ExamSlotId > 0)
      checkFilterString += " and ExamSlotId ne " + row.ExamSlotId;

    let list: List = new List();
    list.fields = ["ExamSlotId"];
    list.PageName = "ExamSlots";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {
          this.ExamSlotsData.ExamSlotId =row.ExamSlotId;
          this.ExamSlotsData.ExamId = this.searchForm.get("searchExamId").value;
          this.ExamSlotsData.Active = row.Active;
          this.ExamSlotsData.SlotNameId = row.SlotNameId;
          this.ExamSlotsData.ExamDate = row.ExamDate;
          this.ExamSlotsData.StartTime = row.StartTime;
          this.ExamSlotsData.EndTime = row.EndTime;
          this.ExamSlotsData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ExamSlotsData.BatchId = this.CurrentBatchId;
          //console.log('data', this.ClassSubjectData);
          if (this.ExamSlotsData.ExamSlotId == 0) {
            this.ExamSlotsData["CreatedDate"] = new Date();
            this.ExamSlotsData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ExamSlotsData["UpdatedDate"] =new Date();
            delete this.ExamSlotsData["UpdatedBy"];
            console.log('exam slot',this.ExamSlotsData)
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
          row.ExamSlotId = data.ExamSlotId;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update() {

    this.dataservice.postPatch('ExamSlots', this.ExamSlotsData, this.ExamSlotsData.ExamSlotId, 'patch')
      .subscribe(
        (data: any) => {
          this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }
  GetExams() {

    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId"];
    list.PageName = "Exams";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Exams = data.value.map(e => {
          return {
            ExamId: e.ExamId,
            ExamName: this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId)[0].MasterDataName
          }
        })
        this.loading = false;
      })
  }
  GetExamSlots() {

    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.CurrentBatchId;
    var filterstr = '';
    if (this.searchForm.get("searchExamId").value == 0) {
      this.alert.error("Please select exam", this.optionAutoClose);
      return;
    }
    else
      filterstr = ' and ExamId eq ' + this.searchForm.get("searchExamId").value;

    let list: List = new List();
    list.fields = ["ExamSlotId", "ExamId", "SlotNameId", "ExamDate", "StartTime", "EndTime", "OrgId", "BatchId", "Active"];
    list.PageName = "ExamSlots";
    list.filter = ["Active eq 1 " + orgIdSearchstr + filterstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //this.Exams = [...data.value];
        this.ExamSlots = this.SlotNames.map(e => {
          let existing = data.value.filter(db => db.SlotNameId = e.MasterDataId);
          if (existing.length > 0) {
            return existing[0];
          }
          else {
            return {
              ExamSlotId: 0,
              ExamId: 0,
              SlotNameId: e.MasterDataId,
              ExamDate: new Date(),
              StartTime: '',
              EndTime: '',
              OrgId: 0,
              BatchId: 0,
              Active: 0

            }
          }
        })
        console.log('this', this.ExamSlots)
        this.dataSource = new MatTableDataSource<IExamSlots>(this.ExamSlots);
        this.loading = false;
      })
  }
  GetMasterData() {

    var orgIdSearchstr = 'and (ParentId eq 0  or OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ')';

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.SlotNames = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].EXAMSLOTNAME);
        this.Batches = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].BATCH);
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].EXAMNAME);
        this.shareddata.ChangeBatch(this.Batches);
        this.GetCurrentBatchIDnAssign();
        //this.GetExamSlots();
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
  ExamDate: Date;
  StartTime: string;
  EndTime: string;
  OrgId: number;
  BatchId: number;
  Active: number;
}

