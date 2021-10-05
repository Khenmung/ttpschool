import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-exams',
  templateUrl: './exams.component.html',
  styleUrls: ['./exams.component.scss']
})
export class ExamsComponent implements OnInit {

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
  Exams: IExams[] = [];
  SelectedBatchId = 0;
  ExamNames = [];
  Batches = [];
  dataSource: MatTableDataSource<IExams>;
  allMasterData = [];

  ExamId = 0;
  ExamsData = {
    ExamId: 0,
    ExamNameId: 0,
    StartDate: Date,
    EndDate: Date,
    OrgId: 0,
    BatchId: 0,
    Active: 1
  };
  displayedColumns = [
    'ExamName',
    'StartDate',
    'EndDate',
    'Active',
    'Action'
  ];

  constructor(
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
    private datepipe: DatePipe
  ) { }

  ngOnInit(): void {
    debugger;

  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
      //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
      this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
    }
    this.GetMasterData();
  }
  // GetCurrentBatchIDnAssign() {
  //   let CurrentBatches = this.Batches.filter(b => b.MasterDataName == globalconstants.getCurrentBatch());
  //   if (CurrentBatches.length > 0) {
  //     this.SelectedBatchId = CurrentBatches[0].MasterDataId;   
  //   }
  // }
  addnew() {

    let toadd = {
      ExamId: 0,
      ExamNameId: 0,
      ExamName:'',
      StartDate: new Date(),
      EndDate: new Date(),
      BatchId: 0,
      OrgId: 0,
      Active: 0,
      Action: false

    };
    this.Exams.push(toadd);
    this.dataSource = new MatTableDataSource<IExams>(this.Exams);

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
    this.loading = true;

    let checkFilterString = "ExamNameId eq " + row.ExamNameId +
      " and StartDate gt datetime'" + new Date(row.StartDate).toISOString() + "'"


    if (row.ExamId > 0)
      checkFilterString += " and ExamId ne " + row.ExamId;
    checkFilterString += " and " + this.StandardFilter;
    let list: List = new List();
    list.fields = ["ExamId"];
    list.PageName = "Exams";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {
          this.ExamsData.ExamId = row.ExamId;
          this.ExamsData.Active = row.Active;
          this.ExamsData.ExamNameId = row.ExamNameId;
          this.ExamsData.StartDate = row.StartDate;
          this.ExamsData.EndDate = row.EndDate;
          this.ExamsData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ExamsData.BatchId = this.SelectedBatchId;
          //console.log('data', this.ClassSubjectData);
          if (this.ExamsData.ExamId == 0) {
            this.ExamsData["CreatedDate"] = new Date();
            this.ExamsData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.ExamsData["UpdatedDate"];
            delete this.ExamsData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.ExamsData["CreatedDate"];
            delete this.ExamsData["CreatedBy"];
            this.ExamsData["UpdatedDate"] = new Date();
            this.ExamsData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update();
          }
        }
      });

  }

  insert(row) {

    debugger;
    this.dataservice.postPatch('Exams', this.ExamsData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.ExamId = data.ExamId;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update() {

    this.dataservice.postPatch('Exams', this.ExamsData, this.ExamsData.ExamId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }
  GetExams() {

    var orgIdSearchstr = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);

    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId", "StartDate", "EndDate", "OrgId", "BatchId", "Active"];
    list.PageName = "Exams";
    list.filter = ["Active eq 1 and " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //this.Exams = [...data.value];
        this.Exams = this.ExamNames.map(e => {
          let existing = data.value.filter(db => db.ExamNameId == e.MasterDataId);
          if (existing.length > 0) {
            existing[0].ExamName = this.ExamNames.filter(f=>f.MasterDataId == existing[0].ExamNameId)[0].MasterDataName; 
            return existing[0];
          }
          else {
            return {
              ExamId: 0,
              ExamNameId: e.MasterDataId,
              ExamName: e.MasterDataName,
              StartDate: new Date(),
              EndDate: new Date(),
              OrgId: 0,
              BatchId: 0,
              Active: 0,

            }
          }
        })
        //console.log('this', this.Exams)
        this.Exams.sort((a,b)=>{
          return this.getTime(a.StartDate) - this.getTime(b.StartDate)
        })
        this.dataSource = new MatTableDataSource<IExams>(this.Exams);
        this.loading = false;
      })
  }
  private getTime(date?: Date) {
    var std= new Date(date);
    return std != null ? std.getTime() : 0;
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
export interface IExams {
  ExamId: number;
  ExamNameId: number;
  ExamName:string;
  StartDate: Date;
  EndDate: Date;
  OrgId: number;
  BatchId: number;
  Active: number;
}
