import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import alasql from 'alasql';
import { evaluate } from 'mathjs';
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
  //ClassSubjectComponents = [];
  StudentGradeFormula = [];
  ClassFullMarkPassMark = [];
  ExamNames = [];
  Batches = [];
  ExamStudentSubjectResult = [];
  dataSource: MatTableDataSource<IExams>;
  allMasterData = [];
  Permission = 'deny';
  ExamId = 0;
  ExamsData = {
    ExamId: 0,
    ExamNameId: 0,
    StartDate: Date,
    EndDate: Date,
    ReleaseResult: 0,
    ReleaseDate: null,
    OrgId: 0,
    BatchId: 0,
    Active: 1
  };
  displayedColumns = [
    'ExamId',
    'ExamName',
    'StartDate',
    'EndDate',
    'ReleaseDate',
    'ReleaseResult',
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
    //debugger;
    this.PageLoad()
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var feature = globalconstants.AppAndMenuAndFeatures.edu.examination.exam;

      var perObj = globalconstants.getPermission(this.tokenstorage, feature);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission == 'deny')
        this.nav.navigate(['/auth/login']);

      this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
      //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
      this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
    }
    this.GetMasterData();
    this.GetSubjectComponents();

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
      ExamName: '',
      StartDate: new Date(),
      EndDate: new Date(),
      ReleaseResult: 0,
      ReleaseDate: null,
      BatchId: 0,
      OrgId: 0,
      Active: 0,
      Action: false

    };
    this.Exams.push(toadd);
    this.dataSource = new MatTableDataSource<IExams>(this.Exams);

  }
  updateRelease(row, value) {
    row.Action = true;
    row.ReleaseResult = value.checked ? 1 : 0;
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

    //debugger;
    this.loading = true;

    let checkFilterString = "ExamNameId eq " + row.ExamNameId +
      " and StartDate gt " + this.datepipe.transform(row.StartDate, 'yyyy-MM-dd')


    if (row.ExamId > 0)
      checkFilterString += " and ExamId ne " + row.ExamId;
    checkFilterString += " and " + this.StandardFilter;
    let list: List = new List();
    list.fields = ["ExamId"];
    list.PageName = "Exams";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
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
          this.ExamsData.ReleaseResult = row.ReleaseResult;
          if (row.ReleaseResult == 1) {
            row.ReleaseDate = this.datepipe.transform(new Date(), 'dd/MM/yyyy');
            this.ExamsData.ReleaseDate = new Date();
          }
          else
            this.ExamsData.ReleaseDate = null;

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
            this.update(row);
          }
        }
      });

  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('Exams', this.ExamsData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.ExamId = data.ExamId;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update(row) {

    this.dataservice.postPatch('Exams', this.ExamsData, this.ExamsData.ExamId, 'patch')
      .subscribe(
        (data: any) => {
          this.GetExamStudentSubjectResults(this.ExamsData.ExamId,row);
        });
  }
  GetExams() {

    var orgIdSearchstr = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);

    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId", "StartDate", "EndDate",
      "ReleaseResult", "ReleaseDate", "OrgId", "BatchId", "Active"];
    list.PageName = "Exams";
    list.filter = ["Active eq 1 and " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //this.Exams = [...data.value];
        this.Exams = this.ExamNames.map(e => {
          let existing = data.value.filter(db => db.ExamNameId == e.MasterDataId);
          if (existing.length > 0) {
            existing[0].ExamName = this.ExamNames.filter(f => f.MasterDataId == existing[0].ExamNameId)[0].MasterDataName;
            existing[0].Action = false;
            return existing[0];
          }
          else {
            return {
              ExamId: 0,
              ExamNameId: e.MasterDataId,
              ExamName: e.MasterDataName,
              StartDate: new Date(),
              EndDate: new Date(),
              ReleaseResult: 0,
              ReleaseDate: null,
              OrgId: 0,
              BatchId: 0,
              Active: 0,
              Action: false
            }
          }
        })
        //console.log('this', this.Exams)
        this.Exams.sort((a, b) => {
          return this.getTime(a.StartDate) - this.getTime(b.StartDate)
        })
        this.dataSource = new MatTableDataSource<IExams>(this.Exams);
        this.loading = false;
      })
  }
  private getTime(date?: Date) {
    var std = new Date(date);
    return std != null ? std.getTime() : 0;
  }
  GetMasterData() {

    var orgIdSearchstr = 'and (ParentId eq 0  or OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ')';

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId","Logic"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        this.StudentGradeFormula = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTGRADE);
        this.GetExams();

      });
  }
  GetSubjectComponents() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    this.loading = true;
    let list: List = new List();

    list.fields = ["ClassSubjectMarkComponentId", "SubjectComponentId", "ClassSubjectId", "FullMark", "PassMark"];
    list.PageName = "ClassSubjectMarkComponents";
    list.lookupFields = ["ClassSubject($filter=Active eq 1;$select=ClassId)"];
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        this.ClassFullMarkPassMark = data.value.map(e => {
          e.ClassId = e.ClassSubject.ClassId;
          return e;
        })
        this.loading = false;
      })
  }
  GetExamStudentSubjectResults(examId,row) {

    //this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.ExamStudentSubjectResult = [];
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = ' ';

    this.loading = true;
    filterstr = 'Active eq 1 and ExamId eq ' + examId;

    let list: List = new List();
    list.fields = [
      "ExamStudentSubjectResultId",
      "ExamId",
      "StudentClassId",
      "StudentClassSubjectId",
      "ClassSubjectMarkComponentId",
      "Marks",
      "BatchId",
      "Active"
    ];
    list.PageName = "ExamStudentSubjectResults";
    list.lookupFields = ["StudentClass($select=ClassId)"]
    list.filter = [filterstr + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((examComponentResult: any) => {
        this.ExamStudentSubjectResult = examComponentResult.value.map(e => {
          e.ClassId = e.StudentClass.ClassId;          
          return e;
        })//.filter(active=>active.ActiveExamId>0);

        var _active = 0;
        if (this.ExamsData.ReleaseResult == 1)
          _active = 1;
        debugger;
        var examresultstatus = [];
        var studentresults = this.ExamStudentSubjectResult.filter(s => s.ExamId == this.ExamsData.ExamId && s.BatchId == this.SelectedBatchId);
        studentresults = alasql("select ClassId,StudentClassId,sum(Marks) as TotalMark from ? group by ClassId,StudentClassId", [studentresults])

        studentresults.forEach(studentresult => {
          var ClassFullMarkPassMark =alasql("select ClassId,sum(FullMark) as FullMark,sum(PassMark) as PassMark from ? group by ClassId",[this.ClassFullMarkPassMark]); 
          //this.ClassFullMarkPassMark.filter(f => f.ClassId == studentresult.ClassId)
          //var ExamStatusId =0;
          var studentGradeId = 0;
          var currentFormula = '';
          
          this.StudentGradeFormula.every(formula => {
            studentGradeId = 0;
            currentFormula = formula.Logic.replaceAll("[FullMark]", ClassFullMarkPassMark[0].FullMark).replaceAll("[TotalMark]", studentresult.TotalMark);
            var grade =evaluate(currentFormula)
            if (grade) 
            {
              studentGradeId = formula.MasterDataId;
              return false
            }
            else return true
           
          });
          
          examresultstatus.push(
            {
              ExamStudentResultId: 0,
              ExamId: this.ExamsData.ExamId,
              StudentClassId: studentresult.StudentClassId,
              TotalMarks: studentresult.TotalMark,
              Grade: studentGradeId,
              OrgId: this.ExamsData.OrgId,
              BatchId: this.SelectedBatchId,
              Active: _active
            });
        })
        //console.log("examresultstatus",examresultstatus);
        debugger;
        this.dataservice.postPatch('ExamStudentResults', examresultstatus, 0, 'post')
          .subscribe(
            (data: any) => {
              this.loading = false;
              row.Action =false;
              this.alert.success("Students result generated successfully.", this.optionAutoClose);
            }, error => {
              console.log("error",error);
              this.alert.error("Something went wrong. Please try again.");
              this.loading = false;
            })


        //console.log("this.ExamStudentSubjectResult",this.ExamStudentSubjectResult);
      })
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
  ExamName: string;
  StartDate: Date;
  EndDate: Date;
  ReleaseResult: number;
  ReleaseDate: Date;
  OrgId: number;
  BatchId: number;
  Active: number;
}
