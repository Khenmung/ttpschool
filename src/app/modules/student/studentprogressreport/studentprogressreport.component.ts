import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-studentprogressreport',
  templateUrl: './studentprogressreport.component.html',
  styleUrls: ['./studentprogressreport.component.scss']
})
export class StudentprogressreportComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

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
  ExamStudentSubjectResult: IExamStudentSubjectResult[] = [];
  SelectedBatchId = 0;
  StoredForUpdate = [];
  SubjectMarkComponents = [];
  MarkComponents = [];
  StudentGrades = [];
  Students = [];
  Classes = [];
  ClassGroups = [];
  Subjects = [];
  Sections = [];
  ExamStatuses = [];
  ExamNames = [];
  StudentClassId = 0;
  Exams = [];
  Batches = [];
  StudentSubjects = [];
  dataSource: MatTableDataSource<IExamStudentSubjectResult>;
  allMasterData = [];
  Permission = 'deny';
  ExamId = 0;
  SelectedApplicationId=0;
  ExamStudentSubjectResultData = {
    ExamStudentSubjectResultId: 0,
    ExamId: 0,
    StudentClassSubjectId: 0,
    ClassSubjectMarkComponentId: 0,
    Marks: 0,
    ExamStatus: 0,
    OrgId: 0,
    BatchId: 0,
    Active: 0
  };
  DisplayColumns = [
    "Subject"
  ];
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    
    private nav: Router,
    private shareddata: SharedataService,
    private datepipe: DatePipe,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.PageLoad();
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.EXAM.VERIFYRESULT);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      ////console.log('this.Permission', this.Permission)
      if (this.Permission != 'deny') {
        this.StudentClassId = this.tokenstorage.getStudentClassId();
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
        });

        this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
        this.GetMasterData();
      }

    }
  }
  GetStudentSubject() {

    let filterStr = 'Active eq 1 and StudentClassId eq ' + this.StudentClassId;

    let list: List = new List();
    list.fields = [
      "ClassSubjectId",
      "StudentClassId",
      "Active",
      "SubjectId"
    ];
    list.PageName = "StudentClassSubjects";
    list.filter = [filterStr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.StudentSubjects = data.value.map(ss => {
          ss.Subject = this.Subjects.filter(s => s.MasterDataId == ss.SubjectId)[0].MasterDataName;
          return ss;
        })
        this.GetStudentSubjectResults();
      })
  }
  GetStudentSubjectResults() {
    debugger;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    filterStr += ' and StudentClassId eq ' + this.StudentClassId;

    let list: List = new List();
    list.fields = [
      "ExamStudentSubjectResultId",
      "ExamId",
      "StudentClassSubjectId",
      "StudentClassId",
      "ClassSubjectMarkComponentId",
      "Marks",
      "ExamStatus",
      "Active"
    ];

    list.PageName = "ExamStudentSubjectResults";
    list.lookupFields = [
      "StudentClassSubject($select=SubjectId,ClassSubjectId,StudentClassId;$expand=StudentClass($select=ClassId,StudentId,RollNo,SectionId))"];
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //console.log("data", data)
        var _class = '';
        var _subject = '';
        var _section = '';
        var _Mark = '';
        this.ExamStudentSubjectResult = data.value.map(s => {
          _class = '';
          _subject = '';
          _Mark = '';
          let _stdClass = this.Classes.filter(c => c.ClassId == s.StudentClassSubject.StudentClass.ClassId);
          if (_stdClass.length > 0)
            _class = _stdClass[0].ClassName;

          let _stdSubject = this.Subjects.filter(c => c.MasterDataId == s.StudentClassSubject.SubjectId);
          if (_stdSubject.length > 0)
            _subject = _stdSubject[0].MasterDataName;

          let _stdSection = this.Sections.filter(c => c.MasterDataId == s.StudentClassSubject.StudentClass.SectionId);
          if (_stdSection.length > 0)
            _section = _stdSection[0].MasterDataName;
          var _ExamName = '';
          var examobj = this.Exams.filter(f => f.ExamId == s.ExamId)
          if (examobj.length > 0)
            _ExamName = examobj[0].ExamName;

          return {
            StudentClassSubjectId: s.StudentClassSubjectId,
            ClassSubjectId: s.StudentClassSubject.ClassSubjectId,
            StudentClassId: s.StudentClassId,
            Student: s.StudentClassSubject.StudentClass.RollNo,
            SubjectId: s.StudentClassSubject.SubjectId,
            Subject: _subject,
            ClassId: s.StudentClassSubject.StudentClass.ClassId,
            StudentId: s.StudentClassSubject.StudentClass.StudentId,
            SectionId: s.StudentClassSubject.StudentClass.SectionId,
            Mark: s.Marks,
            ExamStatus: s.ExamStatus,
            ExamName: _ExamName
          }
        })
        var marksum = alasql("select SubjectId,Subject,ExamName,sum(Mark) Mark from ? group by SubjectId,Subject,ExamName", [this.ExamStudentSubjectResult])

        var progressreport = [];
        var examEolumns = [];
        this.Exams.forEach(e => {
          examEolumns.push(e.ExamName)
        })

        //progressreport.push(JSON.parse(columns));

        this.StudentSubjects.forEach((ss) => {
          progressreport.push({
            "Subject": ss.Subject,
            "SubjectId": ss.SubjectId
          });
        })
        progressreport.forEach((subject) => {
          examEolumns.forEach(exam => {
            //subject["'"+exam + "'"] = ''
            subject[exam] = ''
            if (this.DisplayColumns.indexOf(exam) == -1)
              this.DisplayColumns.push(exam)
          })
        })

        progressreport.forEach(report => {

          var current = marksum.filter(c => c.SubjectId == report.SubjectId);
          current.forEach(exam => {
            // report["'"+exam.ExamName+ "'"] = exam.Mark
            report[exam.ExamName] = exam.Mark
          })

        })

        ////console.log("shd", progressreport);

        this.dataSource = new MatTableDataSource<any>(progressreport);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.loading = false;
      });
  }
  // GetStudents(classId) {
  //   //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
  //   var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
  //   var filterstr = 'Active eq 1';
  //   if (classId != undefined)
  //     filterstr += ' and ClassId eq ' + classId

  //   let list: List = new List();
  //   list.fields = [
  //     "StudentClassId",
  //     "ClassId",
  //     "StudentId"
  //   ];
  //   list.PageName = "StudentClasses";
  //   list.lookupFields = ["Student($select=FirstName,LastName)"];
  //   list.filter = [filterstr + orgIdSearchstr];

  //   return this.dataservice.get(list);

  // }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"],this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
        this.ExamStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSTATUS);
        this.MarkComponents = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTMARKCOMPONENT);
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        this.ClassGroups = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSGROUP);
        this.StudentGrades = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTGRADE);
        this.shareddata.ChangeBatch(this.Batches);
        //this.GetCurrentBatchIDnAssign();
        this.GetExams();
      });
  }
  GetExams() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId"];
    list.PageName = "Exams";
    list.filter = ["Active eq 1 and ReleaseResult eq 1 " + orgIdSearchstr];
    list.orderBy = "EndDate desc";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Exams = data.value.map(e => {
          return {
            ExamId: e.ExamId,
            ExamName: this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId)[0].MasterDataName
          }
        })
        this.GetStudentSubject();

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
export interface IExamStudentSubjectResult {
  ExamStudentSubjectResultId: number;
  ExamId: number;
  ExamName: string;
  SubjectId: number;
  StudentClassSubjectId: number;
  Student: string;
  ClassSubjectMarkComponentId: number;
  SubjectMarkComponent: string;
  FullMark: number;
  PassMark: number;
  Mark: number;
  ExamStatus: number;
  Active: number;
  Action: boolean;
}



