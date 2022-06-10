import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import alasql from 'alasql';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-verifyresultstatus',
  templateUrl: './verifyresultstatus.component.html',
  styleUrls: ['./verifyresultstatus.component.scss']
})
export class VerifyresultstatusComponent implements OnInit { PageLoading=true;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ClickedVerified =false;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  SelectedClassStudentGrades = [];
  SelectedApplicationId = 0;
  StandardFilterWithBatchId = '';
  loading = false;
  rowCount = 0;
  ExamStudentResult: IExamStudentResult[] = [];
  ClassFullMark = 0;
  ClassSubjectComponents = [];
  SelectedBatchId = 0;
  Students = [];
  Classes = [];
  ExamNames = [];
  Exams = [];
  Batches = [];
  dataSource: MatTableDataSource<IExamStudentResult>;
  allMasterData = [];
  Permission = 'deny';
  ExamId = 0;
  displayedColumns = [
    "ExamName",
    "ClassName",
    "Active"
  ];
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private nav: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchExamId: [0],
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
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.EXAM.VERIFYRESULTSTATUS);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
        });

        this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
        this.GetMasterData();
      }
      else
      {
        this.loading=false;this.PageLoading=false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage,globalconstants.ActionText,globalconstants.RedBackground);
      }
    }
  }

  GetExamStudentResults() {

    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.ExamStudentResult = [];
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 ';
    if (this.searchForm.get("searchExamId").value == 0) {
      this.contentservice.openSnackBar("Please select exam", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    //var _classId = this.searchForm.get("searchClassId").value;

    this.loading = true;
    filterstr = 'ExamId eq ' + this.searchForm.get("searchExamId").value;

    let list: List = new List();
    list.fields = [
      "ExamStudentResultId",
      "ExamId",
      "StudentClassId",
      "Active"
    ];
    list.PageName = "ExamStudentResults";
    list.lookupFields = ["StudentClass($select=ClassId)"];
    list.filter = [filterstr + orgIdSearchstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        // if (_classId > 0)
        //   this.ExamStudentResult = data.value.filter(f => f["StudentClass"].ClassId == _classId);
        // else
          this.ExamStudentResult = [...data.value]
        //  console.log("this.ExamStudentResult",this.ExamStudentResult)
        this.ExamStudentResult = this.ExamStudentResult.map(d => {
          var _className = '';
          var _classObj = this.Classes.filter(s => s.ClassId == d.StudentClass["ClassId"]);
          if (_classObj.length > 0)
            _className = _classObj[0].ClassName;
          d["ClassName"] = _className;
          d["ClassId"] = d.StudentClass["ClassId"];
          d["ExamName"] = this.Exams.filter(f => f.ExamId == d.ExamId)[0].ExamName;
          return d;

        })
        var _distinctExamClass = alasql("select distinct ExamId,ExamName,ClassId,ClassName,Active from ? where Active =1", [this.ExamStudentResult])
        var statusdetail = [];
        this.Classes.forEach(cls => {
          var verified = _distinctExamClass.filter(f => f.ClassId == cls.ClassId)
          if (verified.length > 0) {
            statusdetail.push(
              {
                ExamName: verified[0].ExamName,
                ClassName: verified[0].ClassName,
                Active: 1
              }
            )
          }
          else
          {
            var _examId = this.searchForm.get("searchExamId").value;
            statusdetail.push(
              {
                ExamName: this.Exams.filter(f=>f.ExamId ==_examId)[0].ExamName,
                ClassName: cls.ClassName,
                Active: 0
              }
            )
          }
        })
        statusdetail = statusdetail.sort((a,b)=>a.Active-b.Active);
        this.dataSource = new MatTableDataSource(statusdetail);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false; this.PageLoading=false;
      })
  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        this.Batches = this.tokenstorage.getBatches()
        this.GetExams();
      });
  }

  GetExams() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId"];
    list.PageName = "Exams";
    list.filter = ["Active eq 1 and ReleaseResult eq 0 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Exams = data.value.map(e => {
          return {
            ExamId: e.ExamId,
            ExamName: this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId)[0].MasterDataName
          }
        })
        this.loading = false; this.PageLoading=false;
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
export interface IExamStudentResult {
  ExamStudentResultId: number;
  ExamId: number;
  StudentClassId: number;
  StudentClass: {},
  TotalMarks: number;
  GradeId: number;
  Rank: number;
  OrgId: number;
  BatchId: number;
  Active: number;
  Action: boolean

}




